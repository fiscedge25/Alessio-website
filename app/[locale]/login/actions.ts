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
    const callAt = String(formData.get("call_at") || "");
    const { error } = await supabase
        .from("leads")
        .update({
            status: isStatus(status) ? status : "new",
            notes: String(formData.get("notes") || "").slice(0, 10000) || null,
            // datetime-local has no zone: it's the owner's local time (Europe/Rome).
            call_at: callAt ? new Date(`${callAt}:00${romeOffset(callAt)}`).toISOString() : null,
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
        lead.email,
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
        lead.email,
        it ? `Il tuo preventivo — ${quote.title}` : `Your quote — ${quote.title}`,
        it
            ? `Ciao ${first},\n\ncome promesso, ecco il preventivo per "${quote.title}" (${total}).\n\n${link}\n\nDalla pagina puoi accettarlo${quote.deposit_cents ? " e versare l'acconto per partire" : ""}. Per qualsiasi dubbio rispondi pure a questa email.\n\nA presto,\nAlessio`
            : `Hi ${first},\n\nas promised, here's the quote for "${quote.title}" (${total}).\n\n${link}\n\nYou can accept it from that page${quote.deposit_cents ? " and pay the deposit to get started" : ""}. Any questions, just reply to this email.\n\nTalk soon,\nAlessio`,
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

async function mailLead(to: string, subject: string, text: string): Promise<boolean> {
    const resend = getResend();
    if (!resend) return false;
    const { error } = await resend.emails.send({ from: getNewsletterFrom(), to, replyTo: site.email, subject, text });
    if (error) console.error("[admin] email failed:", error.message);
    return !error;
}

/** "+01:00" or "+02:00" for a Rome wall-clock time, DST included. */
function romeOffset(local: string): string {
    const guess = new Date(`${local}:00Z`);
    const rome = new Date(guess.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
    const utc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
    const h = Math.round((rome.getTime() - utc.getTime()) / 3_600_000);
    return `${h >= 0 ? "+" : "-"}${String(Math.abs(h)).padStart(2, "0")}:00`;
}
