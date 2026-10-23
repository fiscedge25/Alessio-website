import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { site } from "@/lib/site";
import { notifyOwner } from "@/lib/quote-store";
import { OPTION_LABEL, type Lead } from "@/lib/leads";

/**
 * Daily Vercel Cron (vercel.json): one digest email listing leads still "new"
 * 48h after they arrived. Each lead is nudged once (reminded_at), so even an
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

    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("status", "new")
        .is("reminded_at", null)
        .lt("created_at", new Date(Date.now() - 48 * 3_600_000).toISOString())
        .order("created_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const leads = (data ?? []) as Lead[];
    if (leads.length === 0) return NextResponse.json({ reminded: 0 });

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
    return NextResponse.json({ reminded: leads.length });
}
