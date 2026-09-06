import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/ideas/suggest { name?, email?, idea }
export async function POST(request: Request) {
    let body: { name?: string; email?: string; idea?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const idea = String(body.idea || "").trim();
    const name = String(body.name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 254);

    if (idea.length < 3 || idea.length > 2000) {
        return NextResponse.json({ error: "invalid_idea" }, { status: 400 });
    }
    if (email && !EMAIL_RE.test(email)) {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    const { error } = await supabase
        .from("idea_suggestions")
        .insert({ name: name || null, email: email || null, idea });
    if (error) {
        console.error("[ideas/suggest] supabase error:", error.message);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
