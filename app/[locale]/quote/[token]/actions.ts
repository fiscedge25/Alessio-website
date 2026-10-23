"use server";

import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { site } from "@/lib/site";
import { notifyOwner } from "@/lib/quote-store";
import { QUOTE_TOKEN_RE, eur, isExpired, type Quote } from "@/lib/quotes";

/**
 * The client accepts the quote. With a deposit they go to Stripe Checkout and
 * the quote turns "paid" when they come back (or via the webhook); without
 * one it's accepted right away.
 */
export async function acceptQuote(formData: FormData) {
    const token = String(formData.get("token") || "");
    if (!QUOTE_TOKEN_RE.test(token)) redirect("/");
    const supabase = getSupabaseAdmin();
    if (!supabase) throw new Error("not configured");

    const { data: quote } = await supabase.from("quotes").select("*").eq("token", token).maybeSingle<Quote>();
    const loc = quote?.locale === "en" ? "en" : "it";
    const page = `/${loc}/quote/${token}`;
    if (!quote || quote.status !== "sent" || isExpired(quote)) redirect(page);
    if (formData.get("consent") !== "on") redirect(`${page}?error=consent#accept`);

    const { data: lead } = await supabase.from("leads").select("name, email").eq("id", quote.lead_id).single();

    if (quote.deposit_cents === 0) {
        const now = new Date().toISOString();
        await supabase.from("quotes").update({ status: "accepted", accepted_at: now, updated_at: now }).eq("id", quote.id).eq("status", "sent");
        await supabase.from("leads").update({ status: "won", updated_at: now }).eq("id", quote.lead_id);
        await notifyOwner(
            `Quote accepted: ${eur(quote.total_cents)} — ${quote.title}`,
            `${lead?.name ?? "The client"} accepted "${quote.title}".\n\n${site.url}/en/login/leads/${quote.lead_id}`,
        );
        redirect(`${page}?done=1`);
    }

    const stripe = getStripe();
    let url: string | null = null;
    try {
        const name = loc === "it" ? `Acconto — ${quote.title}` : `Deposit — ${quote.title}`;
        const session = await stripe!.checkout.sessions.create({
            mode: "payment",
            locale: loc,
            customer_email: lead?.email,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "eur",
                        unit_amount: quote.deposit_cents,
                        product_data: {
                            name,
                            description:
                                loc === "it"
                                    ? `${quote.deposit_pct}% di ${eur(quote.total_cents, "it")}, scalato dal totale`
                                    : `${quote.deposit_pct}% of ${eur(quote.total_cents, "en")}, deducted from the total`,
                        },
                    },
                },
            ],
            metadata: { kind: "quote", quote_id: quote.id },
            payment_intent_data: { description: name, metadata: { kind: "quote", quote_id: quote.id } },
            success_url: `${site.url}${page}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${site.url}${page}#accept`,
        });
        url = session.url;
    } catch (err) {
        console.error("[quote] checkout failed:", (err as Error).message);
    }
    redirect(url ?? `${page}?error=pay#accept`);
}
