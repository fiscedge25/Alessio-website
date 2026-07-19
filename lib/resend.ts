import { Resend } from "resend";

/**
 * Returns a Resend client, or null when RESEND_API_KEY is not configured
 * so callers can fail gracefully instead of throwing.
 */
export function getResend(): Resend | null {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    return new Resend(key);
}

/** The verified "from" address, e.g. "Alessio <news@alessiosabatino.it>". */
export function getNewsletterFrom(): string {
    return process.env.NEWSLETTER_FROM || "Alessio Sabatino <onboarding@resend.dev>";
}

/** Public site origin used to build unsubscribe links. */
export function getSiteUrl(): string {
    return (
        process.env.NEXT_PUBLIC_SITE_URL || "https://www.alessiosabatino.it"
    ).replace(/\/$/, "");
}
