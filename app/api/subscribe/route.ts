import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    let body: { email?: string; lang?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const email = (body.email || "").trim().toLowerCase();
    const lang = body.lang === "it" ? "it" : "en";

    if (!EMAIL_RE.test(email) || email.length > 254) {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        // Env not configured yet — don't 500, surface a clear state.
        return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    const { error } = await supabase
        .from("subscribers")
        .insert({ email, lang });

    if (error) {
        // 23505 = unique_violation → already subscribed, treat as success.
        if (error.code === "23505") {
            return NextResponse.json({ ok: true, status: "already" });
        }
        console.error("[subscribe] supabase error:", error.message);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "subscribed" });
}
