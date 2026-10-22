import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type Stripe from "stripe";
import { getSupabaseAdmin } from "./supabase";
import { BUNDLE, bundleValuesFor, getGift, type GiftEntry, type Purchasable } from "./gifts";

/**
 * What the buyer typed, keyed by the animation's own query-string params
 * (e.g. { to, msg, from, style } for flowers, { her, me } for space).
 * Multi-line fields keep "\n" here and are joined only when rendered.
 */
export type GiftValues = Record<string, string>;

export interface GiftRow {
    id: string;
    /** An animation slug, or BUNDLE.slug for the all-in-one purchase. */
    animation: string;
    fields: GiftValues;
    status: "pending" | "paid";
}

const ID_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

/** Short, unguessable id for the share link: /g/<id>. */
export function newGiftId(length = 10): string {
    const bytes = randomBytes(length);
    let id = "";
    for (const b of bytes) id += ID_ALPHABET[b % ID_ALPHABET.length];
    return id;
}

/**
 * Normalise input against the gift's field definitions — unknown keys are
 * dropped, lengths capped. Returns null when a required field is empty,
 * unless `lenient` (the live preview, which renders while people type).
 */
export function parseGiftValues(
    body: Record<string, unknown>,
    gift: Purchasable,
    { lenient = false } = {},
): GiftValues | null {
    const out: GiftValues = {};
    for (const f of gift.fields) {
        const raw = typeof body[f.param] === "string" ? (body[f.param] as string) : "";
        const value = f.lines
            ? raw
                  .split("\n")
                  .map((l) => l.replace(/[ \t]+/g, " ").trim())
                  .filter(Boolean)
                  .slice(0, f.lines)
                  .join("\n")
                  .slice(0, f.max)
            : raw.replace(/\s+/g, " ").trim().slice(0, f.max);
        if (f.required && !value && !lenient) return null;
        if (value) out[f.param] = value;
    }
    if (gift.styleParam && gift.styles?.length) {
        const s = body[gift.styleParam];
        out[gift.styleParam] = gift.styles.some((x) => x.id === s) ? (s as string) : gift.styles[0].id;
    }
    return out;
}

/** The form + Payment Link behind a slug: one animation, or the bundle. */
export function getPurchasable(slug: string): Purchasable | undefined {
    return slug === BUNDLE.slug ? BUNDLE : getGift(slug);
}

/**
 * What one animation should show for a paid row. For a bundle row, the shared
 * fields are translated into that animation's params, then clamped to its limits.
 */
export function valuesForAnimation(row: GiftRow, gift: GiftEntry): GiftValues | null {
    if (row.animation === gift.slug) return row.fields;
    if (row.animation !== BUNDLE.slug) return null;
    return parseGiftValues(bundleValuesFor(gift, row.fields), gift, { lenient: true });
}

export async function createPendingGift(animation: string, fields: GiftValues): Promise<string | null> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;
    const id = newGiftId();
    const { error } = await supabase.from("gifts").insert({ id, animation, fields, status: "pending" });
    if (error) {
        console.error("[gifts] insert failed:", error.message);
        return null;
    }
    return id;
}

/**
 * Mark the gift behind a completed Checkout Session as paid. Called from both
 * the success page and the webhook, so it has to be idempotent. Returns the
 * gift when the session really paid for it, otherwise null.
 */
export async function fulfillGiftSession(session: Stripe.Checkout.Session): Promise<GiftRow | null> {
    const giftId = session.client_reference_id;
    const slug = session.metadata?.unlock_slug;
    if (!giftId || !slug || session.payment_status !== "paid") return null;

    const supabase = getSupabaseAdmin();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("gifts")
        .update({
            status: "paid",
            stripe_session_id: session.id,
            email: session.customer_details?.email ?? null,
            amount_total: session.amount_total,
            currency: session.currency,
            paid_at: new Date().toISOString(),
        })
        .eq("id", giftId)
        .eq("animation", slug)
        // Already paid by this same session (webhook + success page race) is fine;
        // a different session can't take over a gift.
        .or(`status.eq.pending,stripe_session_id.eq.${session.id}`)
        .select("id, animation, fields, status")
        .maybeSingle();

    if (error) {
        console.error("[gifts] fulfil failed:", error.message);
        return null;
    }
    return (data as GiftRow | null) ?? null;
}

export async function getPaidGift(id: string): Promise<GiftRow | null> {
    if (!/^[a-z0-9]{6,20}$/.test(id)) return null;
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;
    const { data } = await supabase
        .from("gifts")
        .select("id, animation, fields, status")
        .eq("id", id)
        .eq("status", "paid")
        .maybeSingle();
    return (data as GiftRow | null) ?? null;
}

/**
 * The animation's HTML with the dedication baked in. The animations read their
 * text from location.search, so we rewrite the query string before any of
 * their own scripts run — whatever is typed into the address bar is ignored.
 * Their built-in "make your own" editor is hidden.
 */
export function renderGiftHtml(slug: string, values: GiftValues | null, opts: { watermark?: string } = {}): string | null {
    const gift = getGift(slug);
    if (!gift) return null;

    const html = fs.readFileSync(path.join(process.cwd(), "content", "gifts", `${slug}.html`), "utf8");

    const qs = new URLSearchParams();
    if (values) {
        for (const f of gift.fields) {
            const v = values[f.param];
            if (v) qs.set(f.param, f.lines ? v.split("\n").join(f.joiner ?? "|") : v);
        }
        if (gift.styleParam && values[gift.styleParam]) qs.set(gift.styleParam, values[gift.styleParam]);
    }
    const search = JSON.stringify(qs.toString() ? `?${qs}` : "").replace(/</g, "\\u003c");

    const watermark = opts.watermark
        ? `<div style="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483647;` +
          `pointer-events:none;font:500 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;` +
          `text-transform:uppercase;color:rgba(255,255,255,.85);background:rgba(0,0,0,.45);` +
          `padding:9px 14px;border-radius:999px;backdrop-filter:blur(6px);white-space:nowrap">` +
          `${opts.watermark.replace(/[<>&"]/g, "")}</div>`
        : "";

    const inject =
        (gift.assetsBase ? `<base href="${gift.assetsBase}">` : "") +
        `<script>history.replaceState(null,"",location.pathname+${search});</script>` +
        (gift.hide.length ? `<style>${gift.hide.join(",")}{display:none!important}</style>` : "");

    return html.replace("<head>", `<head>${inject}`).replace("</body>", `${watermark}</body>`);
}
