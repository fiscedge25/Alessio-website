// ─── Quotes — built in the /login dashboard, read by the client ─────────────
// Types and formatting only: safe to import from client components.

export interface QuoteItem {
    label: string;
    detail?: string;
    amount_cents: number;
}

/** Public link id: 18 random bytes, base64url. */
export const QUOTE_TOKEN_RE = /^[A-Za-z0-9_-]{20,40}$/;

export const QUOTE_STATUSES = ["draft", "sent", "accepted", "paid", "void"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
    draft: "Draft",
    sent: "Sent",
    accepted: "Accepted",
    paid: "Deposit paid",
    void: "Withdrawn",
};

export interface Quote {
    id: string;
    token: string;
    lead_id: string;
    created_at: string;
    updated_at: string;
    title: string;
    items: QuoteItem[];
    total_cents: number;
    deposit_pct: number;
    deposit_cents: number;
    delivery: string | null;
    notes: string | null;
    valid_until: string | null;
    locale: string | null;
    status: QuoteStatus;
    sent_at: string | null;
    viewed_at: string | null;
    accepted_at: string | null;
    paid_at: string | null;
    stripe_session_id: string | null;
    amount_paid: number | null;
}

export const eur = (cents: number, locale = "it") =>
    new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-IE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    }).format(cents / 100);

/** Deposit rounded to whole euros, so the client sees a clean number. */
export const depositFor = (totalCents: number, pct: number) => Math.round((totalCents * pct) / 100 / 100) * 100;

/** A quote past its validity date can't be accepted any more. */
export const isExpired = (q: Pick<Quote, "valid_until" | "status">) =>
    !!q.valid_until && ["draft", "sent"].includes(q.status) && new Date(`${q.valid_until}T23:59:59+01:00`) < new Date();
