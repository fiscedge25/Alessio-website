import { getPaidGift, renderGiftHtml } from "@/lib/gift-store";
import { site } from "@/lib/site";

/**
 * The link the buyer sends: a paid dedication, full screen, no watermark.
 * Lives outside [locale] (and the i18n middleware) so the URL stays short.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const gift = await getPaidGift(id);
    const html = gift ? renderGiftHtml(gift.animation, gift.fields) : null;
    if (!html) return Response.redirect(`${site.url}/gift`, 302);

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex",
        },
    });
}
