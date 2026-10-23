import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Single-owner auth for /admin: one password in ADMIN_PASSWORD (set it on
// Vercel). The cookie holds an HMAC of it, never the password itself, and
// changing the password logs every device out.
export const ADMIN_COOKIE = "bws_admin";

function token(): string | null {
    const pw = process.env.ADMIN_PASSWORD;
    if (!pw || pw.length < 12) return null;
    return createHmac("sha256", pw).update("bws-admin-v1").digest("hex");
}

function same(a: string, b: string) {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
}

export function adminConfigured(): boolean {
    return token() !== null;
}

export function checkPassword(input: string): string | null {
    const expected = token();
    if (!expected) return null;
    const given = createHmac("sha256", input).update("bws-admin-v1").digest("hex");
    return same(given, expected) ? expected : null;
}

export async function isAdmin(): Promise<boolean> {
    const expected = token();
    if (!expected) return false;
    const value = (await cookies()).get(ADMIN_COOKIE)?.value;
    return !!value && same(value, expected);
}
