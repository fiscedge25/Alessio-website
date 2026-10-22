import { getGift, gifts } from "@/lib/gifts";
import { getPaidGift, renderGiftHtml, valuesForAnimation } from "@/lib/gift-store";
import { site } from "@/lib/site";

/**
 * The link the buyer sends: a paid dedication, full screen, no watermark.
 * Lives outside [locale] (and the i18n middleware) so the URL stays short.
 * A bundle has one link per animation (/g/<id>/<slug>); its bare id opens
 * the first one.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const row = await getPaidGift(id);
    const gift = row ? getGift(row.animation) : undefined;
    if (row && !gift) return Response.redirect(`${site.url}/g/${row.id}/${gifts[0].slug}`, 302);

    const values = row && gift ? valuesForAnimation(row, gift) : null;
    const html = gift && values ? renderGiftHtml(gift.slug, values) : null;
    if (!html) return Response.redirect(`${site.url}/gift`, 302);

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex",
        },
    });
}
