import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getNewsletterFrom, getResend } from "@/lib/resend";
import { site } from "@/lib/site";
import { CHOICE_STEPS, CONTACT_PREFS, LEAD_STEPS, OPTION_LABEL, type ChoiceStep } from "@/lib/leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const pick = <T extends readonly string[]>(v: unknown, allowed: T) =>
    (allowed as readonly string[]).includes(String(v)) ? String(v) : null;

// POST /api/leads — the guided "Start a project" flow on /start.
export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    // Honeypot: real people never see this field. Pretend it worked.
    if (str(body.website, 200)) return NextResponse.json({ ok: true });

    const choices = Object.fromEntries(CHOICE_STEPS.map((s) => [s, pick(body[s], LEAD_STEPS[s])])) as Record<
        ChoiceStep,
        string | null
    >;
    const lead = {
        ...choices,
        description: str(body.description, 5000),
        name: str(body.name, 120),
        email: str(body.email, 254).toLowerCase(),
        phone: str(body.phone, 40) || null,
        company: str(body.company, 160) || null,
        contact_pref: pick(body.contactPref, CONTACT_PREFS),
        locale: body.locale === "it" ? "it" : "en",
        source: str(body.source, 80) || null,
        consent_at: new Date().toISOString(),
    };

    if (!lead.need) return NextResponse.json({ error: "invalid_need" }, { status: 400 });
    if (!lead.name || !EMAIL_RE.test(lead.email)) {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    if (lead.description.length < 15) {
        return NextResponse.json({ error: "invalid_description" }, { status: 400 });
    }
    if (body.consent !== true) return NextResponse.json({ error: "consent_required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "not_configured" }, { status: 503 });

    const { data, error } = await supabase.from("leads").insert(lead).select("id").single();
    if (error) {
        console.error("[leads] supabase error:", error.message);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    await notifyOwner(data.id, lead);
    return NextResponse.json({ ok: true });
}

/** Best-effort heads-up to Alessio. A failed email never fails the lead. */
async function notifyOwner(id: string, lead: Record<string, string | null>) {
    const resend = getResend();
    if (!resend) return;
    const rows = [
        ["Need", lead.need],
        ["Who", lead.who],
        ["Stage", lead.stage],
        ["Timeline", lead.timeline],
        ["Budget", lead.budget],
        ["Prefers", lead.contact_pref],
    ]
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${OPTION_LABEL[v!] ?? v}`);
    const text = [
        `${lead.name} <${lead.email}>${lead.phone ? ` · ${lead.phone}` : ""}${lead.company ? ` · ${lead.company}` : ""}`,
        "",
        ...rows,
        lead.source ? `Source: ${lead.source}` : "",
        "",
        lead.description,
        "",
        `Open: ${site.url}/en/admin/leads/${id}`,
    ].join("\n");
    try {
        await resend.emails.send({
            from: getNewsletterFrom(),
            to: site.email,
            replyTo: lead.email!,
            subject: `New lead: ${OPTION_LABEL[lead.need!] ?? lead.need} — ${lead.name}`,
            text,
        });
    } catch (err) {
        console.error("[leads] notify failed:", (err as Error).message);
    }
}
