import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ideas } from "@/lib/hub";

// POST /api/ideas/vote { ideaId, voter }
// One vote per (idea, voter) enforced by unique constraint. Without Supabase
// configured we still return ok so the UI counts the vote locally.
export async function POST(request: Request) {
    let body: { ideaId?: string; voter?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const ideaId = String(body.ideaId || "");
    const voter = String(body.voter || "anonymous").slice(0, 64);
    if (!ideas.some((i) => i.id === ideaId)) {
        return NextResponse.json({ error: "unknown_idea" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ ok: true, persisted: false });
    }

    const { error } = await supabase
        .from("idea_votes")
        .insert({ idea_id: ideaId, voter });
    if (error) {
        // 23505 = already voted → still fine, treat as success.
        if (error.code === "23505") {
            return NextResponse.json({ ok: true, status: "already" });
        }
        // Missing table (42P01) or RLS issue → don't break the UI.
        console.error("[ideas/vote] supabase error:", error.message);
        return NextResponse.json({ ok: true, persisted: false });
    }
    return NextResponse.json({ ok: true, persisted: true });
}
