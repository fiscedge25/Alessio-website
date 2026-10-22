import "server-only";
import Stripe from "stripe";

/**
 * Server-side Stripe client for the BuiltWithSabba account.
 * Returns null when STRIPE_SECRET_KEY is missing so callers can fail gracefully.
 */
export function getStripe(): Stripe | null {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    return new Stripe(key);
}
