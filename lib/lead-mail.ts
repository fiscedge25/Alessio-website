import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getNewsletterFrom, getResend } from "@/lib/resend";
import { site } from "@/lib/site";
import type { Lead } from "@/lib/leads";

// Every email to a lead goes through here, so the dashboard can show what was
// sent and whether it arrived (statuses come from /api/resend/webhook).

export type LeadEmailKind =
    | "confirmation"
    | "accept"
    | "call_invite"
    | "call_update"
    | "call_cancel"
    | "call_reminder"
    | "quote";

export interface LeadEmail {
    id: string;
    lead_id: string;
    quote_id: string | null;
    created_at: string;
    updated_at: string;
    kind: LeadEmailKind;
    to_email: string;
    subject: string;
    resend_id: string | null;
    status: string;
    detail: string | null;
}

interface Attachment {
    filename: string;
    content: Buffer;
    contentType: string;
}

export async function sendLeadEmail(opts: {
    leadId: string;
    kind: LeadEmailKind;
    to: string;
    subject: string;
    text: string;
    quoteId?: string;
    attachments?: Attachment[];
}): Promise<boolean> {
    const resend = getResend();
    if (!resend) return false;
    let resendId: string | null = null;
    let failure: string | null = null;
    try {
        const { data, error } = await resend.emails.send({
            from: getNewsletterFrom(),
            to: opts.to,
            replyTo: site.email,
            subject: opts.subject,
            text: opts.text,
            attachments: opts.attachments,
            tags: [{ name: "kind", value: opts.kind }],
        });
        resendId = data?.id ?? null;
        failure = error?.message ?? null;
    } catch (err) {
        failure = (err as Error).message;
    }
    if (failure) console.error(`[lead-mail] ${opts.kind} failed:`, failure);

    const { error } = (await getSupabaseAdmin()
        ?.from("lead_emails")
        .insert({
            lead_id: opts.leadId,
            quote_id: opts.quoteId ?? null,
            kind: opts.kind,
            to_email: opts.to,
            subject: opts.subject,
            resend_id: resendId,
            status: failure ? "failed" : "sent",
            detail: failure,
        })) ?? { error: null };
    if (error) console.error("[lead-mail] log failed:", error.message);
    return !failure;
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
    const { data } = (await getSupabaseAdmin()?.from("admin_settings").select("value").eq("key", key).maybeSingle()) ?? {
        data: null,
    };
    return data?.value ?? null;
}

export async function setSetting(key: string, value: string) {
    await getSupabaseAdmin()
        ?.from("admin_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() });
}

// ─── Calendar invites ───────────────────────────────────────────────────────

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545 lines must be folded at 75 octets. */
const fold = (line: string) => line.match(/.{1,73}/g)!.join("\r\n ");

/**
 * An .ics invite for the intro call. REQUEST makes Gmail/Outlook show it as an
 * invitation with RSVP buttons; the RSVP lands in Alessio's inbox. One UID per
 * lead, so a new time updates the same event and CANCEL removes it.
 */
export function callInvite(
    lead: Pick<Lead, "id" | "name" | "email">,
    start: Date,
    minutes: number,
    link: string,
    method: "REQUEST" | "CANCEL" | "PUBLISH",
): Attachment {
    const end = new Date(start.getTime() + minutes * 60_000);
    const summary = `Alessio × ${lead.name} — intro call`;
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BuiltWithSabba//Leads//EN",
        "CALSCALE:GREGORIAN",
        `METHOD:${method}`,
        "BEGIN:VEVENT",
        `UID:call-${lead.id}@builtwithsabba.com`,
        // Seconds since epoch only grow, so every update supersedes the last.
        `SEQUENCE:${Math.floor(Date.now() / 1000)}`,
        `DTSTAMP:${icsDate(new Date())}`,
        `DTSTART:${icsDate(start)}`,
        `DTEND:${icsDate(end)}`,
        `SUMMARY:${icsText(summary)}`,
        `DESCRIPTION:${icsText(`Google Meet: ${link}`)}`,
        `LOCATION:${icsText(link)}`,
        `URL:${link}`,
        `ORGANIZER;CN=Alessio Sabatino:mailto:${site.email}`,
        `ATTENDEE;CN=${icsText(lead.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${lead.email}`,
        `STATUS:${method === "CANCEL" ? "CANCELLED" : "CONFIRMED"}`,
        "BEGIN:VALARM",
        "TRIGGER:-PT15M",
        "ACTION:DISPLAY",
        `DESCRIPTION:${icsText(summary)}`,
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR",
    ];
    return {
        filename: method === "CANCEL" ? "cancel.ics" : "invite.ics",
        content: Buffer.from(lines.map(fold).join("\r\n")),
        contentType: `text/calendar; charset=utf-8; method=${method}`,
    };
}

/** "giovedì 30 ottobre, 15:00" in the lead's language, Rome time. */
export function callWhen(start: Date, locale: string | null) {
    return start.toLocaleString(locale === "en" ? "en-GB" : "it-IT", {
        timeZone: "Europe/Rome",
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
    });
}
