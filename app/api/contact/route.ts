import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact — project inquiry from /build-with-me.
// Budget is optional and never required. Stored for personal follow-up only.
export async function POST(request: Request) {
    let body: Record<string, string>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const name = String(body.name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 254);
    const company = String(body.company || "").trim().slice(0, 160);
    const message = String(body.message || "").trim();
    const projectType = String(body.projectType || "").slice(0, 40);
    const stage = String(body.stage || "").slice(0, 40);
    const budget = String(body.budget || "").slice(0, 40);

    if (!name || !EMAIL_RE.test(email)) {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    if (message.length < 10 || message.length > 5000) {
        return NextResponse.json({ error: "invalid_message" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    const { error } = await supabase.from("project_inquiries").insert({
        name,
        email,
        company: company || null,
        message,
        project_type: projectType || null,
        stage: stage || null,
        budget: budget || null,
    });
    if (error) {
        console.error("[contact] supabase error:", error.message);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
