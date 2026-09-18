import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    let body: { email?: string; lang?: string; source?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const email = (body.email || "").trim().toLowerCase();
    const lang = body.lang === "it" ? "it" : "en";
    // Which lead magnet this came through, e.g. "prompt:github-profile".
    // Constrained so the column cannot be used to store arbitrary text.
    const source =
        typeof body.source === "string" && /^[a-z0-9:_-]{1,64}$/.test(body.source)
            ? body.source
            : null;

    if (!EMAIL_RE.test(email) || email.length > 254) {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        // Env not configured yet — don't 500, surface a clear state.
        return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    let { error } = await supabase
        .from("subscribers")
        .insert(source ? { email, lang, source } : { email, lang });

    // The 'source' column is missing until supabase/subscribers-source.sql is
    // run. PostgREST reports that as PGRST204 (Postgres itself as 42703).
    // Keep the subscriber rather than lose them over attribution.
    if (source && (error?.code === "PGRST204" || error?.code === "42703")) {
        console.warn("[subscribe] 'source' column missing — run supabase/subscribers-source.sql");
        ({ error } = await supabase.from("subscribers").insert({ email, lang }));
    }

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
