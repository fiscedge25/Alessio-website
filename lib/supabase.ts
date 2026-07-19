import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service-role key.
 * NEVER import this in a client component — the service role bypasses RLS.
 * Returns null when env vars are missing so callers can fail gracefully.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        return null;
    }

    return createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
