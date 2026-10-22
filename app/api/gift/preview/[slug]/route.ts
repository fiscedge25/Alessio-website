import { getGift } from "@/lib/gifts";
import { parseGiftValues, renderGiftHtml } from "@/lib/gift-store";

/**
 * Free, watermarked preview for the gift page's iframe. It takes the text being
 * typed in the form so the buyer sees their own words — the watermark is what
 * the payment removes.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const gift = getGift(slug);
    if (!gift) return new Response("Not found", { status: 404 });

    const q = new URL(request.url).searchParams;
    const values = parseGiftValues(Object.fromEntries(q), gift, { lenient: true });
    const html = renderGiftHtml(slug, values, { watermark: "Preview · builtwithsabba.com" });
    if (!html) return new Response("Not found", { status: 404 });

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "X-Frame-Options": "SAMEORIGIN",
            "X-Robots-Tag": "noindex",
        },
    });
}
