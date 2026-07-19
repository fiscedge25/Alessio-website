import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getResend, getNewsletterFrom, getSiteUrl } from "@/lib/resend";

export const maxDuration = 60;

type Subscriber = { id: string; email: string };

function wrap(bodyHtml: string, unsubscribeUrl: string) {
    return `<!doctype html><html><body style="margin:0;background:#f6f7fc;padding:24px 0;font-family:Helvetica,Arial,sans-serif;color:#29303f">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(30,27,75,0.08)">
      <tr><td style="padding:36px 40px 8px">${bodyHtml}</td></tr>
      <tr><td style="padding:24px 40px 36px;border-top:1px solid rgba(30,27,75,0.08);color:#97a0b4;font-size:12px;line-height:1.6">
        Alessio Sabatino · Build with AI. Think like a founder.<br>
        <a href="${unsubscribeUrl}" style="color:#97a0b4;text-decoration:underline">Disiscriviti</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

export async function POST(request: Request) {
    // ── Auth ──
    const secret = process.env.NEWSLETTER_ADMIN_SECRET;
    if (!secret) {
        return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    const auth = request.headers.get("authorization") || "";
    if (auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // ── Body ──
    let body: { subject?: string; html?: string; testEmail?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    const subject = (body.subject || "").trim();
    const html = (body.html || "").trim();
    if (!subject || !html) {
        return NextResponse.json({ error: "missing_subject_or_html" }, { status: 400 });
    }

    const resend = getResend();
    if (!resend) {
        return NextResponse.json({ error: "resend_not_configured" }, { status: 503 });
    }
    const from = getNewsletterFrom();
    const site = getSiteUrl();

    // ── Test mode: single recipient, no DB read ──
    if (body.testEmail) {
        const unsub = `${site}/api/unsubscribe?id=test`;
        const { error } = await resend.emails.send({
            from,
            to: body.testEmail,
            subject: `[TEST] ${subject}`,
            html: wrap(html, unsub),
        });
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ ok: true, mode: "test", sent: 1 });
    }

    // ── Real send: all active subscribers ──
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
    }
    const { data, error } = await supabase
        .from("subscribers")
        .select("id, email")
        .is("unsubscribed_at", null);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const subscribers = (data || []) as Subscriber[];
    if (subscribers.length === 0) {
        return NextResponse.json({ ok: true, sent: 0, note: "no active subscribers" });
    }

    let sent = 0;
    const errors: string[] = [];

    // Resend batch API: up to 100 messages per call.
    for (const group of chunk(subscribers, 100)) {
        const payload = group.map((s) => {
            const unsub = `${site}/api/unsubscribe?id=${encodeURIComponent(s.id)}`;
            return {
                from,
                to: s.email,
                subject,
                html: wrap(html, unsub),
                headers: { "List-Unsubscribe": `<${unsub}>` },
            };
        });
        const { error: batchErr } = await resend.batch.send(payload);
        if (batchErr) {
            errors.push(batchErr.message);
        } else {
            sent += group.length;
        }
    }

    return NextResponse.json({
        ok: errors.length === 0,
        sent,
        total: subscribers.length,
        errors: errors.length ? errors : undefined,
    });
}
