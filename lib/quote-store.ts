import "server-only";
import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getNewsletterFrom, getResend } from "@/lib/resend";
import { site } from "@/lib/site";
import { eur, type Quote } from "@/lib/quotes";

/**
 * A paid deposit checkout → quote "paid", lead "won", heads-up to Alessio.
 * Called by both the quote page (on return from Stripe) and the webhook, so
 * it's idempotent: only the first call flips the status and sends the email.
 */
export async function fulfillQuoteSession(session: Stripe.Checkout.Session): Promise<Quote | null> {
    const quoteId = session.metadata?.quote_id;
    if (session.metadata?.kind !== "quote" || !quoteId || session.payment_status !== "paid") return null;

    const supabase = getSupabaseAdmin();
    if (!supabase) return null;

    const now = new Date().toISOString();
    const { data: updated, error } = await supabase
        .from("quotes")
        .update({
            status: "paid",
            paid_at: now,
            accepted_at: now,
            stripe_session_id: session.id,
            amount_paid: session.amount_total,
            updated_at: now,
        })
        .eq("id", quoteId)
        .neq("status", "paid")
        .select("*")
        .maybeSingle<Quote>();
    if (error) {
        console.error("[quotes] fulfil failed:", error.message);
        return null;
    }
    if (!updated) {
        // Already paid (the other caller got here first).
        const { data } = await supabase.from("quotes").select("*").eq("id", quoteId).maybeSingle<Quote>();
        return data?.stripe_session_id === session.id ? data : null;
    }

    await supabase.from("leads").update({ status: "won", updated_at: now }).eq("id", updated.lead_id);
    await notifyOwner(
        `Deposit paid: ${eur(session.amount_total ?? 0)} — ${updated.title}`,
        `${session.customer_details?.name || session.customer_details?.email || "The client"} paid the deposit for "${updated.title}".\n\n${site.url}/en/login/leads/${updated.lead_id}`,
    );
    return updated;
}

export async function notifyOwner(subject: string, text: string) {
    const resend = getResend();
    if (!resend) return;
    try {
        await resend.emails.send({ from: getNewsletterFrom(), to: site.email, subject, text });
    } catch (err) {
        console.error("[quotes] notify failed:", (err as Error).message);
    }
}
