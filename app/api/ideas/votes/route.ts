import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ideas } from "@/lib/hub";

// GET /api/ideas/votes → { votes: { [ideaId]: count } }
// Counts only exist when Supabase is configured; otherwise {} and the UI
// falls back to seeded base counts. Never errors.
export async function GET() {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ votes: {} });
    }
    try {
        const ids = ideas.map((i) => i.id);
        const { data, error } = await supabase
            .from("idea_votes")
            .select("idea_id")
            .in("idea_id", ids);
        if (error) throw error;
        const votes: Record<string, number> = {};
        for (const row of data ?? []) {
            const id = (row as { idea_id: string }).idea_id;
            votes[id] = (votes[id] || 0) + 1;
        }
        return NextResponse.json({ votes });
    } catch (err) {
        console.error("[ideas/votes] supabase error:", err);
        return NextResponse.json({ votes: {} });
    }
}
