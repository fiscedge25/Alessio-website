import { getGift } from "@/lib/gifts";
import { getPaidGift, renderGiftHtml, valuesForAnimation } from "@/lib/gift-store";
import { site } from "@/lib/site";

/** One animation out of a paid bundle: /g/<id>/<slug>. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; slug: string }> }) {
    const { id, slug } = await params;
    const gift = getGift(slug);
    const row = gift ? await getPaidGift(id) : null;
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
