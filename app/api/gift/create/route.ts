import { NextResponse } from "next/server";
import { createPendingGift, getPurchasable, parseGiftValues } from "@/lib/gift-store";

/**
 * Save the dedication as 'pending' and hand back the Stripe Payment Link for
 * it. The gift id rides along as client_reference_id, so the Checkout Session
 * tells us which dedication was paid for.
 */
export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const gift = typeof body.slug === "string" ? getPurchasable(body.slug) : undefined;
    if (!gift) return NextResponse.json({ error: "unknown_gift" }, { status: 404 });

    const values = parseGiftValues(body, gift);
    if (!values) return NextResponse.json({ error: "empty" }, { status: 400 });

    const id = await createPendingGift(gift.slug, values);
    if (!id) return NextResponse.json({ error: "not_configured" }, { status: 503 });

    const url = new URL(gift.paymentLink);
    url.searchParams.set("client_reference_id", id);
    url.searchParams.set("locale", body.lang === "it" ? "it" : "en");
    return NextResponse.json({ ok: true, url: url.toString() });
}
