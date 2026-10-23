import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { site } from "@/lib/site";
import { notifyOwner } from "@/lib/quote-store";

// Higher wins, so a late "delivered" never hides an "opened". Problems always win.
const RANK: Record<string, number> = { sent: 0, delayed: 1, delivered: 2, opened: 3, clicked: 4 };
const PROBLEMS = new Set(["bounced", "complained", "failed", "suppressed"]);

/**
 * Resend → delivery events for emails to leads (lead_emails). Configure in
 * Resend → Webhooks with https://<site>/api/resend/webhook, events email.*,
 * and put its signing secret in RESEND_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
    const resend = getResend();
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (!resend || !secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

    const payload = await request.text();
    let event;
    try {
        const h = request.headers;
        event = resend.webhooks.verify({
            payload,
            headers: { id: h.get("svix-id") ?? "", timestamp: h.get("svix-timestamp") ?? "", signature: h.get("svix-signature") ?? "" },
            webhookSecret: secret,
        });
    } catch (err) {
        console.error("[resend-webhook] bad signature:", (err as Error).message);
        return NextResponse.json({ error: "bad_signature" }, { status: 400 });
    }
    if (!event.type.startsWith("email.") || !("email_id" in event.data)) return NextResponse.json({ ok: true });

    const status = event.type.slice("email.".length).replace("delivery_delayed", "delayed");
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "not_configured" }, { status: 503 });

    const { data: row } = await supabase
        .from("lead_emails")
        .select("id, lead_id, status, subject, to_email")
        .eq("resend_id", event.data.email_id)
        .maybeSingle();
    // Not a lead email (newsletter, gifts…): nothing to track.
    if (!row) return NextResponse.json({ ok: true });

    const problem = PROBLEMS.has(status);
    if (!problem && (RANK[status] === undefined || PROBLEMS.has(row.status) || RANK[status] <= (RANK[row.status] ?? 0))) {
        return NextResponse.json({ ok: true });
    }
    const detail = event.type === "email.bounced" ? event.data.bounce.message : null;
    await supabase
        .from("lead_emails")
        .update({ status, detail, updated_at: new Date().toISOString() })
        .eq("id", row.id);

    if (problem && !PROBLEMS.has(row.status)) {
        await notifyOwner(
            `Email not delivered (${status}): ${row.to_email}`,
            `"${row.subject}" to ${row.to_email} was ${status}.${detail ? `\n\n${detail}` : ""}\n\nCheck the address or reach them another way:\n${site.url}/en/login/leads/${row.lead_id}`,
        );
    }
    return NextResponse.json({ ok: true });
}
