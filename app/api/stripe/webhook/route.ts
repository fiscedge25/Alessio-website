import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { fulfillGiftSession } from "@/lib/gift-store";
import { fulfillQuoteSession } from "@/lib/quote-store";

/**
 * Stripe → checkout.session.completed, for gifts and quote deposits. The
 * success pages already fulfil when the buyer lands on them; this covers the
 * ones who close the tab before the redirect. Configure in Stripe → Developers → Webhooks with the
 * URL https://<site>/api/stripe/webhook and put its signing secret in
 * STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripe || !secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

    const signature = request.headers.get("stripe-signature");
    if (!signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret);
    } catch (err) {
        console.error("[stripe-webhook] bad signature:", (err as Error).message);
        return NextResponse.json({ error: "bad_signature" }, { status: 400 });
    }

    if (
        event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded"
    ) {
        const session = event.data.object;
        if (session.metadata?.kind === "quote") {
            const quote = await fulfillQuoteSession(session);
            if (!quote) console.warn("[stripe-webhook] no quote fulfilled for", session.id);
        } else {
            const gift = await fulfillGiftSession(session);
            if (!gift) console.warn("[stripe-webhook] no gift fulfilled for", session.id);
        }
    }

    return NextResponse.json({ received: true });
}
