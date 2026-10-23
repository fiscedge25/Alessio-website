"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, checkPassword, isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getNewsletterFrom, getResend } from "@/lib/resend";
import { site } from "@/lib/site";
import { LEAD_STATUSES, type Lead } from "@/lib/leads";

export async function login(formData: FormData) {
    const value = checkPassword(String(formData.get("password") || ""));
    if (!value) redirect("/en/admin?error=1");
    (await cookies()).set(ADMIN_COOKIE, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
    redirect("/en/admin");
}

export async function logout() {
    (await cookies()).delete(ADMIN_COOKIE);
    redirect("/en/admin");
}

async function guard() {
    if (!(await isAdmin())) redirect("/en/admin");
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase not configured");
    return supabase;
}

export async function updateLead(formData: FormData) {
    const supabase = await guard();
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    const callAt = String(formData.get("call_at") || "");
    const { error } = await supabase
        .from("leads")
        .update({
            status: (LEAD_STATUSES as readonly string[]).includes(status) ? status : "new",
            notes: String(formData.get("notes") || "").slice(0, 10000) || null,
            // datetime-local has no zone: it's the owner's local time (Europe/Rome).
            call_at: callAt ? new Date(`${callAt}:00${romeOffset(callAt)}`).toISOString() : null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath(`/en/admin/leads/${id}`);
    redirect(`/en/admin/leads/${id}?saved=1`);
}

/** Accept a lead: mark it accepted and email them the booking link. */
export async function acceptLead(formData: FormData) {
    const supabase = await guard();
    const id = String(formData.get("id"));
    const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).single<Lead>();
    if (error || !lead) throw new Error(error?.message || "not found");

    const resend = getResend();
    let sent = false;
    if (resend) {
        const it = lead.locale === "it";
        const first = lead.name.split(" ")[0];
        const booking = site.bookingUrl
            ? it
                ? `Scegli tu il momento per una call gratuita di 20 minuti:\n${site.bookingUrl}`
                : `Pick a time for a free 20-minute call:\n${site.bookingUrl}`
            : it
              ? "Rispondi a questa email con due o tre orari che ti vanno bene per una call di 20 minuti."
              : "Reply to this email with two or three times that work for a 20-minute call.";
        const text = it
            ? `Ciao ${first},\n\ngrazie per la richiesta su BuiltWithSabba: l'ho letta e mi piacerebbe approfondire.\n\n${booking}\n\nA presto,\nAlessio`
            : `Hi ${first},\n\nthanks for your request on BuiltWithSabba — I've read it and I'd love to dig in.\n\n${booking}\n\nTalk soon,\nAlessio`;
        const { error: mailErr } = await resend.emails.send({
            from: getNewsletterFrom(),
            to: lead.email,
            replyTo: site.email,
            subject: it ? "La tua richiesta — parliamone" : "Your project request — let's talk",
            text,
        });
        sent = !mailErr;
        if (mailErr) console.error("[admin] accept email failed:", mailErr.message);
    }

    await supabase
        .from("leads")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", id);
    revalidatePath(`/en/admin/leads/${id}`);
    redirect(`/en/admin/leads/${id}?accepted=${sent ? "sent" : "nomail"}`);
}

/** "+01:00" or "+02:00" for a Rome wall-clock time, DST included. */
function romeOffset(local: string): string {
    const guess = new Date(`${local}:00Z`);
    const rome = new Date(guess.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
    const utc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
    const h = Math.round((rome.getTime() - utc.getTime()) / 3_600_000);
    return `${h >= 0 ? "+" : "-"}${String(Math.abs(h)).padStart(2, "0")}:00`;
}
