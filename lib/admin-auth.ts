import "server-only";
import { cache } from "react";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";

// Single-owner auth for the /login dashboard: one password in ADMIN_PASSWORD
// (set it on Vercel). Each login gets a random session token; only its hash
// is stored (supabase/leads-v2.sql → admin_sessions), so one device or all of
// them can be logged out. Changing the password also logs every device out.
export const ADMIN_COOKIE = "bws_session";
export const SESSION_DAYS = 30;

const MAX_FAILS_PER_IP = 5;
const MAX_FAILS_GLOBAL = 30;
const LOCK_MINUTES = 15;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Fingerprint of the current password; null when it's missing or too short. */
function passwordFp(): string | null {
    const pw = process.env.ADMIN_PASSWORD;
    if (!pw || pw.length < 12) return null;
    return createHmac("sha256", pw).update("bws-admin-v2").digest("hex").slice(0, 32);
}

function same(a: string, b: string) {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
}

export function adminConfigured(): boolean {
    return passwordFp() !== null;
}

export function checkPassword(input: string): boolean {
    const pw = process.env.ADMIN_PASSWORD;
    if (!passwordFp() || !pw) return false;
    // Compare fixed-length digests so the check takes the same time for any input.
    return same(sha256(`bws:${input}`), sha256(`bws:${pw}`));
}

export async function clientInfo() {
    const h = await headers();
    return {
        ip: (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim().slice(0, 64),
        userAgent: (h.get("user-agent") || "").slice(0, 300),
    };
}

/**
 * "locked" while this IP (or everyone, against IP rotation) has too many
 * recent failures; "setup" when the tables from leads-v2.sql are missing.
 */
export async function loginGate(ip: string): Promise<"ok" | "locked" | "setup"> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return "setup";
    const since = new Date(Date.now() - LOCK_MINUTES * 60_000).toISOString();
    const [byIp, all] = await Promise.all([
        supabase.from("admin_login_attempts").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", since),
        supabase.from("admin_login_attempts").select("id", { count: "exact", head: true }).gte("created_at", since),
    ]);
    if (byIp.error || all.error) {
        console.error("[admin-auth] attempts lookup failed:", (byIp.error || all.error)!.message);
        return "setup";
    }
    return (byIp.count ?? 0) < MAX_FAILS_PER_IP && (all.count ?? 0) < MAX_FAILS_GLOBAL ? "ok" : "locked";
}

export async function recordFailure(ip: string) {
    const supabase = getSupabaseAdmin();
    await supabase?.from("admin_login_attempts").insert({ ip });
}

/** Creates a session row and returns the raw token for the cookie. */
export async function createSession(ip: string, userAgent: string): Promise<string | null> {
    const fp = passwordFp();
    const supabase = getSupabaseAdmin();
    if (!fp || !supabase) return null;
    const token = randomBytes(32).toString("base64url");
    const { error } = await supabase
        .from("admin_sessions")
        .insert({ id: sha256(token), ip, user_agent: userAgent, pw_fp: fp });
    if (error) {
        console.error("[admin-auth] session insert failed:", error.message);
        return null;
    }
    // A successful login clears this IP's failures; old rows are pruned as we go.
    await supabase.from("admin_login_attempts").delete().eq("ip", ip);
    await supabase
        .from("admin_login_attempts")
        .delete()
        .lt("created_at", new Date(Date.now() - 86_400_000).toISOString());
    return token;
}

/** The current device's session id (hashed token), when it's valid. */
export const currentSessionId = cache(async (): Promise<string | null> => {
    const fp = passwordFp();
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    const supabase = getSupabaseAdmin();
    if (!fp || !token || !supabase) return null;
    const id = sha256(token);
    const { data } = await supabase.from("admin_sessions").select("id, pw_fp, created_at, last_seen_at").eq("id", id).maybeSingle();
    if (!data || data.pw_fp !== fp) return null;
    if (Date.now() - new Date(data.created_at).getTime() > SESSION_DAYS * 86_400_000) return null;
    // Touch at most every 10 minutes so the device list shows recent activity.
    if (Date.now() - new Date(data.last_seen_at).getTime() > 600_000) {
        await supabase.from("admin_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", id);
    }
    return id;
});

export async function isAdmin(): Promise<boolean> {
    return (await currentSessionId()) !== null;
}

export async function revokeSession(id: string) {
    await getSupabaseAdmin()?.from("admin_sessions").delete().eq("id", id);
}

export async function revokeAllSessions() {
    // Every row: ids are hex hashes, never empty.
    await getSupabaseAdmin()?.from("admin_sessions").delete().neq("id", "");
}

export interface AdminSession {
    id: string;
    created_at: string;
    last_seen_at: string;
    user_agent: string | null;
    ip: string | null;
}

export async function listSessions(): Promise<AdminSession[]> {
    const fp = passwordFp();
    const { data } = (await getSupabaseAdmin()
        ?.from("admin_sessions")
        .select("id, created_at, last_seen_at, user_agent, ip")
        .eq("pw_fp", fp ?? "")
        .order("last_seen_at", { ascending: false })) ?? { data: null };
    return (data ?? []) as AdminSession[];
}
