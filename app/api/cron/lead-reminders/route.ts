import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { site } from "@/lib/site";
import { notifyOwner } from "@/lib/quote-store";
import { callWhen, sendLeadEmail } from "@/lib/lead-mail";
import { OPTION_LABEL, type Lead } from "@/lib/leads";

/**
 * Daily Vercel Cron (vercel.json, 07:00 UTC = 8–9 in Rome):
 * - reminds each lead with a call today, with the meeting link;
 * - one digest to Alessio listing leads still "new" 48h after they arrived.
 * Each lead is reminded once (call_reminded_at / reminded_at), so even an
 * unauthenticated call can't spam. With CRON_SECRET set on Vercel, only
 * Vercel's own cron calls (Authorization: Bearer <secret>) get through.
 */
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: "not_configured" }, { status: 503 });

    const calls = await remindTodaysCalls();

    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("status", "new")
        .is("reminded_at", null)
        .lt("created_at", new Date(Date.now() - 48 * 3_600_000).toISOString())
        .order("created_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const leads = (data ?? []) as Lead[];
    if (leads.length === 0) return NextResponse.json({ reminded: 0, calls });

    const lines = leads.map((l) => {
        const days = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86_400_000);
        return `• ${l.name} — ${OPTION_LABEL[l.need] ?? l.need}${l.budget ? `, ${OPTION_LABEL[l.budget] ?? l.budget}` : ""} — ${days} days\n  ${site.url}/en/login/leads/${l.id}`;
    });
    await notifyOwner(
        leads.length === 1 ? `1 lead waiting for 48h+: ${leads[0].name}` : `${leads.length} leads waiting for 48h+`,
        `These requests are still "New". A quick reply keeps them warm:\n\n${lines.join("\n\n")}\n\n${site.url}/en/login`,
    );
    await supabase
        .from("leads")
        .update({ reminded_at: new Date().toISOString() })
        .in("id", leads.map((l) => l.id));
    return NextResponse.json({ reminded: leads.length, calls });
}

const romeDay = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });

async function remindTodaysCalls(): Promise<number> {
    const supabase = getSupabaseAdmin()!;
    const now = new Date();
    const { data } = await supabase
        .from("leads")
        .select("*")
        .is("call_reminded_at", null)
        .gt("call_at", now.toISOString())
        .lt("call_at", new Date(now.getTime() + 24 * 3_600_000).toISOString());
    const today = ((data ?? []) as Lead[]).filter((l) => romeDay(new Date(l.call_at!)) === romeDay(now) && !["lost", "declined"].includes(l.status));
    for (const l of today) {
        const it = l.locale !== "en";
        const first = l.name.split(" ")[0];
        const time = new Date(l.call_at!).toLocaleTimeString("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" });
        await sendLeadEmail({
            leadId: l.id,
            kind: "call_reminder",
            to: l.email,
            subject: it ? `Oggi alle ${time}: la nostra call` : `Today at ${time}: our call`,
            text: it
                ? `Ciao ${first},\n\npromemoria veloce: ci sentiamo oggi alle ${time} (ora italiana) qui:\n${l.call_link ?? ""}\n\nSe hai un imprevisto rispondi a questa email.\n\nA dopo,\nAlessio`
                : `Hi ${first},\n\nquick reminder: we're talking today, ${callWhen(new Date(l.call_at!), "en")} (Rome time), here:\n${l.call_link ?? ""}\n\nIf something comes up, just reply to this email.\n\nSee you soon,\nAlessio`,
        });
        await supabase.from("leads").update({ call_reminded_at: now.toISOString() }).eq("id", l.id);
    }
    return today.length;
}
