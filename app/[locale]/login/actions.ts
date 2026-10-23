"use server";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    ADMIN_COOKIE,
    SESSION_DAYS,
    checkPassword,
    clientInfo,
    createSession,
    currentSessionId,
    loginGate,
    recordFailure,
    revokeAllSessions,
    revokeSession,
} from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getNewsletterFrom, getResend } from "@/lib/resend";
import { callInvite, callWhen, sendLeadEmail, setSetting } from "@/lib/lead-mail";
import { site } from "@/lib/site";
import { LEAD_STATUSES, type Lead } from "@/lib/leads";
import { depositFor, eur, type Quote, type QuoteItem } from "@/lib/quotes";

export async function login(formData: FormData) {
    const { ip, userAgent } = await clientInfo();
    const gate = await loginGate(ip);
    if (gate !== "ok") redirect(`/en/login?error=${gate}`);
    if (!checkPassword(String(formData.get("password") || ""))) {
        await recordFailure(ip);
        redirect("/en/login?error=1");
    }
    const token = await createSession(ip, userAgent);
    if (!token) redirect("/en/login?error=setup");
    (await cookies()).set(ADMIN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * SESSION_DAYS,
    });
    redirect("/en/login");
}

export async function logout() {
    const id = await currentSessionId();
    if (id) await revokeSession(id);
    (await cookies()).delete(ADMIN_COOKIE);
    redirect("/en/login");
}

/** Logs out every device, this one included. */
export async function logoutEverywhere() {
    if (!(await currentSessionId())) redirect("/en/login");
    await revokeAllSessions();
    (await cookies()).delete(ADMIN_COOKIE);
    redirect("/en/login?error=signedout");
}

export async function endSession(formData: FormData) {
    if (!(await currentSessionId())) redirect("/en/login");
    await revokeSession(String(formData.get("id")));
    revalidatePath("/en/login");
}

async function guard() {
    if (!(await currentSessionId())) redirect("/en/login");
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase not configured");
    return supabase;
}

const isStatus = (s: string) => (LEAD_STATUSES as readonly string[]).includes(s);

export async function updateLead(formData: FormData) {
    const supabase = await guard();
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    const { error } = await supabase
        .from("leads")
        .update({
            status: isStatus(status) ? status : "new",
            notes: String(formData.get("notes") || "").slice(0, 10000) || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath(`/en/login/leads/${id}`);
    redirect(`/en/login/leads/${id}?saved=1`);
}

/** Board drag & drop. Returns instead of redirecting so the card just moves. */
export async function moveLead(id: string, status: string): Promise<{ ok: boolean }> {
    const supabase = await guard();
    if (!isStatus(status) || !/^[0-9a-f-]{36}$/.test(id)) return { ok: false };
    const { error } = await supabase
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
    if (error) console.error("[admin] move failed:", error.message);
    revalidatePath("/en/login");
    return { ok: !error };
}

/** Accept a lead: mark it accepted and email them the booking link. */
export async function acceptLead(formData: FormData) {
    const supabase = await guard();
    const id = String(formData.get("id"));
    const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).single<Lead>();
    if (error || !lead) throw new Error(error?.message || "not found");

    const it = lead.locale === "it";
    const first = lead.name.split(" ")[0];
    const booking = site.bookingUrl
        ? it
            ? `Scegli tu il momento per una call gratuita di 20 minuti:\n${site.bookingUrl}`
            : `Pick a time for a free 20-minute call:\n${site.bookingUrl}`
        : it
          ? "Rispondi a questa email con due o tre orari che ti vanno bene per una call di 20 minuti."
          : "Reply to this email with two or three times that work for a 20-minute call.";
    const sent = await mailLead(
        lead,
        "accept",
        it ? "La tua richiesta — parliamone" : "Your project request — let's talk",
        it
            ? `Ciao ${first},\n\ngrazie per la richiesta su BuiltWithSabba: l'ho letta e mi piacerebbe approfondire.\n\n${booking}\n\nA presto,\nAlessio`
            : `Hi ${first},\n\nthanks for your request on BuiltWithSabba — I've read it and I'd love to dig in.\n\n${booking}\n\nTalk soon,\nAlessio`,
    );

    await supabase
        .from("leads")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", id);
    revalidatePath(`/en/login/leads/${id}`);
    redirect(`/en/login/leads/${id}?accepted=${sent ? "sent" : "nomail"}`);
}

// ─── Intro call ─────────────────────────────────────────────────────────────

/**
 * Book (or move) the intro call: saves time and link, moves the lead to
 * "Call booked" and emails them the invite with a calendar event. Alessio gets
 * the same event to drop into his own calendar.
 */
export async function scheduleCall(formData: FormData) {
    const supabase = await guard();
    const id = String(formData.get("id"));
    const local = String(formData.get("call_at") || "");
    const link = String(formData.get("call_link") || "").trim().slice(0, 300);
    const minutes = [15, 20, 30, 45, 60].includes(Number(formData.get("call_minutes"))) ? Number(formData.get("call_minutes")) : 30;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local) || !/^https:\/\/\S+$/.test(link)) {
        redirect(`/en/login/leads/${id}?call=invalid#call`);
    }
    // datetime-local has no zone: it's the owner's local time (Europe/Rome).
    const start = new Date(`${local}:00${romeOffset(local)}`);

    const { data: lead } = await supabase.from("leads").select("*").eq("id", id).single<Lead>();
    if (!lead) throw new Error("lead not found");
    const moved = !!lead.call_at && lead.call_at !== start.toISOString();

    await supabase
        .from("leads")
        .update({
            call_at: start.toISOString(),
            call_minutes: minutes,
            call_link: link,
            call_reminded_at: null,
            status: ["new", "accepted"].includes(lead.status) ? "call" : lead.status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    await setSetting("meet_url", link);

    let flag = "saved";
    if (formData.get("notify") === "on") {
        const it = lead.locale !== "en";
        const first = lead.name.split(" ")[0];
        const when = callWhen(start, lead.locale);
        const sent = await sendLeadEmail({
            leadId: lead.id,
            kind: moved ? "call_update" : "call_invite",
            to: lead.email,
            subject: it
                ? moved
                    ? `Call spostata: ${when}`
                    : `La nostra call: ${when}`
                : moved
                  ? `Call moved: ${when}`
                  : `Our call: ${when}`,
            text: it
                ? `Ciao ${first},\n\n${moved ? "ho spostato la nostra call a" : "ci sentiamo"} ${when} (ora italiana), ${minutes} minuti su Google Meet:\n${link}\n\nTi ho allegato l'invito per il calendario. Per arrivare preparati bastano 2 minuti: pensa a chi userà il prodotto, cosa deve fare per prima cosa e se hai esempi che ti piacciono.\n\nSe l'orario non va più, rispondi a questa email e lo cambiamo.\n\nA presto,\nAlessio`
                : `Hi ${first},\n\n${moved ? "I've moved our call to" : "we're talking on"} ${when} (Rome time), ${minutes} minutes on Google Meet:\n${link}\n\nThe calendar invite is attached. Two minutes of prep is plenty: who will use the product, the first thing it must do, and any examples you like.\n\nIf the time no longer works, just reply and we'll change it.\n\nTalk soon,\nAlessio`,
            attachments: [callInvite(lead, start, minutes, link, "REQUEST")],
        });
        flag = sent ? "sent" : "nomail";
        // Same event for Alessio's own calendar (PUBLISH: no RSVP loop with himself).
        await sendOwnerEvent(lead, start, minutes, link);
    }
    revalidatePath(`/en/login/leads/${id}`);
    redirect(`/en/login/leads/${id}?call=${flag}#call`);
}

export async function cancelCall(formData: FormData) {
    const supabase = await guard();
    const id = String(formData.get("id"));
    const { data: lead } = await supabase.from("leads").select("*").eq("id", id).single<Lead>();
    if (!lead?.call_at) redirect(`/en/login/leads/${id}#call`);

    if (formData.get("notify") === "on") {
        const it = lead.locale !== "en";
        const start = new Date(lead.call_at);
        const when = callWhen(start, lead.locale);
        await sendLeadEmail({
            leadId: lead.id,
            kind: "call_cancel",
            to: lead.email,
            subject: it ? `Call annullata: ${when}` : `Call cancelled: ${when}`,
            text: it
                ? `Ciao ${lead.name.split(" ")[0]},\n\nho dovuto annullare la call di ${when}. Rispondi a questa email con un paio di orari che ti vanno bene e la rifissiamo.\n\nScusa per il cambio,\nAlessio`
                : `Hi ${lead.name.split(" ")[0]},\n\nI had to cancel our call on ${when}. Reply with a couple of times that work and we'll set a new one.\n\nSorry for the change,\nAlessio`,
            attachments: [callInvite(lead, start, lead.call_minutes ?? 30, lead.call_link ?? "", "CANCEL")],
        });
    }
    await supabase
        .from("leads")
        .update({
            call_at: null,
            call_reminded_at: null,
            status: lead.status === "call" ? "accepted" : lead.status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    revalidatePath(`/en/login/leads/${id}`);
    redirect(`/en/login/leads/${id}?call=cancelled#call`);
}

async function sendOwnerEvent(lead: Lead, start: Date, minutes: number, link: string) {
    const resend = getResend();
    if (!resend) return;
    try {
        await resend.emails.send({
            from: getNewsletterFrom(),
            to: site.email,
            subject: `Call: ${lead.name} — ${callWhen(start, "it")}`,
            text: `${lead.name} <${lead.email}>${lead.phone ? ` · ${lead.phone}` : ""}\n${link}\n\n${lead.description}\n\n${site.url}/en/login/leads/${lead.id}`,
            attachments: [callInvite(lead, start, minutes, link, "PUBLISH")],
        });
    } catch (err) {
        console.error("[admin] owner event failed:", (err as Error).message);
    }
}

// ─── Quotes ─────────────────────────────────────────────────────────────────

function parseItems(raw: string): QuoteItem[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    return parsed
        .slice(0, 30)
        .map((i) => ({
            label: String(i?.label ?? "").trim().slice(0, 200),
            detail: String(i?.detail ?? "").trim().slice(0, 600) || undefined,
            amount_cents: Math.max(0, Math.min(10_000_000, Math.round(Number(i?.amount_cents) || 0))),
        }))
        .filter((i) => i.label);
}

/** Create or edit a quote. Paid or accepted quotes are frozen. */
export async function saveQuote(formData: FormData) {
    const supabase = await guard();
    const leadId = String(formData.get("lead_id"));
    const quoteId = String(formData.get("quote_id") || "");
    const items = parseItems(String(formData.get("items") || "[]"));
    const title = String(formData.get("title") || "").trim().slice(0, 200);
    if (!title || items.length === 0) redirect(`/en/login/leads/${leadId}?quote=invalid#quote`);

    const total = items.reduce((s, i) => s + i.amount_cents, 0);
    let pct = Math.max(0, Math.min(100, Math.round(Number(formData.get("deposit_pct")) || 0)));
    let deposit = depositFor(total, pct);
    // Stripe can't charge less than €0.50: below €1 there's simply no deposit.
    if (deposit < 100) {
        pct = 0;
        deposit = 0;
    }
    const validUntil = String(formData.get("valid_until") || "");
    const row = {
        title,
        items,
        total_cents: total,
        deposit_pct: pct,
        deposit_cents: deposit,
        delivery: String(formData.get("delivery") || "").trim().slice(0, 200) || null,
        notes: String(formData.get("notes") || "").trim().slice(0, 4000) || null,
        valid_until: /^\d{4}-\d{2}-\d{2}$/.test(validUntil) ? validUntil : null,
        locale: formData.get("locale") === "en" ? "en" : "it",
        updated_at: new Date().toISOString(),
    };

    const { error } = quoteId
        ? await supabase.from("quotes").update(row).eq("id", quoteId).in("status", ["draft", "sent"])
        : await supabase
              .from("quotes")
              .insert({ ...row, lead_id: leadId, token: randomBytes(18).toString("base64url") });
    if (error) throw new Error(error.message);
    revalidatePath(`/en/login/leads/${leadId}`);
    redirect(`/en/login/leads/${leadId}?quote=saved#quote`);
}

/** Email the quote link to the client and move the lead to "Proposal sent". */
export async function sendQuote(formData: FormData) {
    const supabase = await guard();
    const id = String(formData.get("quote_id"));
    const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle<Quote>();
    if (!quote) throw new Error("quote not found");
    const { data: lead } = await supabase.from("leads").select("*").eq("id", quote.lead_id).single<Lead>();
    if (!lead) throw new Error("lead not found");

    const it = quote.locale !== "en";
    const first = lead.name.split(" ")[0];
    const link = `${site.url}/${it ? "it" : "en"}/quote/${quote.token}`;
    const total = eur(quote.total_cents, it ? "it" : "en");
    const sent = await mailLead(
        lead,
        "quote",
        it ? `Il tuo preventivo — ${quote.title}` : `Your quote — ${quote.title}`,
        it
            ? `Ciao ${first},\n\ncome promesso, ecco il preventivo per "${quote.title}" (${total}).\n\n${link}\n\nDalla pagina puoi accettarlo${quote.deposit_cents ? " e versare l'acconto per partire" : ""}. Per qualsiasi dubbio rispondi pure a questa email.\n\nA presto,\nAlessio`
            : `Hi ${first},\n\nas promised, here's the quote for "${quote.title}" (${total}).\n\n${link}\n\nYou can accept it from that page${quote.deposit_cents ? " and pay the deposit to get started" : ""}. Any questions, just reply to this email.\n\nTalk soon,\nAlessio`,
        quote.id,
    );
    if (!sent) redirect(`/en/login/leads/${quote.lead_id}?quote=nomail#quote`);

    const now = new Date().toISOString();
    await supabase.from("quotes").update({ status: "sent", sent_at: now, updated_at: now }).eq("id", id).eq("status", "draft");
    if (["new", "accepted", "call"].includes(lead.status)) {
        await supabase.from("leads").update({ status: "proposal", updated_at: now }).eq("id", lead.id);
    }
    revalidatePath(`/en/login/leads/${quote.lead_id}`);
    redirect(`/en/login/leads/${quote.lead_id}?quote=sent#quote`);
}

export async function voidQuote(formData: FormData) {
    const supabase = await guard();
    const id = String(formData.get("quote_id"));
    const { data } = await supabase
        .from("quotes")
        .update({ status: "void", updated_at: new Date().toISOString() })
        .eq("id", id)
        .in("status", ["draft", "sent"])
        .select("lead_id")
        .maybeSingle();
    const leadId = data?.lead_id ?? String(formData.get("lead_id"));
    revalidatePath(`/en/login/leads/${leadId}`);
    redirect(`/en/login/leads/${leadId}#quote`);
}

const mailLead = (lead: Pick<Lead, "id" | "email">, kind: "accept" | "quote", subject: string, text: string, quoteId?: string) =>
    sendLeadEmail({ leadId: lead.id, kind, to: lead.email, subject, text, quoteId });

/** "+01:00" or "+02:00" for a Rome wall-clock time, DST included. */
function romeOffset(local: string): string {
    const guess = new Date(`${local}:00Z`);
    const rome = new Date(guess.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
    const utc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
    const h = Math.round((rome.getTime() - utc.getTime()) / 3_600_000);
    return `${h >= 0 ? "+" : "-"}${String(Math.abs(h)).padStart(2, "0")}:00`;
}
