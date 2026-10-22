import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { site } from "@/lib/site";
import { BUNDLE, gifts } from "@/lib/gifts";
import { getStripe } from "@/lib/stripe";
import { fulfillGiftSession, type GiftRow } from "@/lib/gift-store";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import GiftShare from "@/components/hub/GiftShare";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Params = Promise<{ locale: string; slug: string }>;
type Search = Promise<{ session_id?: string }>;

/**
 * Where the Stripe Payment Link sends the buyer. The session id in the URL is
 * checked against Stripe before anything is unlocked, so the page can't be
 * reached by guessing — and it unlocks the gift itself in case the webhook
 * hasn't arrived yet.
 */
async function resolveGift(slug: string, sessionId: string | undefined): Promise<GiftRow | null> {
    if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
    const stripe = getStripe();
    if (!stripe) return null;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.metadata?.unlock_slug !== slug) return null;
        return await fulfillGiftSession(session);
    } catch (err) {
        console.error("[unlock] session lookup failed:", (err as Error).message);
        return null;
    }
}

export default async function UnlockSuccess({ params, searchParams }: { params: Params; searchParams: Search }) {
    const { locale: raw, slug } = await params;
    const { session_id } = await searchParams;
    const locale = raw === "it" ? "it" : "en";
    setRequestLocale(raw);
    const t = await getTranslations({ locale: raw, namespace: "hub.gift" });

    const gift = await resolveGift(slug, session_id);

    return (
        <>
            <Navbar />
            <main className="px-5 md:px-8 pt-28 md:pt-36 pb-20">
                <div className="max-w-2xl mx-auto">
                    {gift ? (
                        <>
                            <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-4">
                                {t("successEyebrow")}
                            </p>
                            <h1
                                className="font-display text-[color:var(--ink)] uppercase"
                                style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1.05 }}
                            >
                                {t("successTitle")}
                            </h1>
                            <p className="mt-4 mb-10 text-lg leading-relaxed text-[color:var(--muted)]">
                                {t("successIntro")}
                            </p>
                            {gift.animation === BUNDLE.slug ? (
                                <ul className="space-y-10">
                                    {gifts.map((g) => (
                                        <li key={g.slug}>
                                            <p className="font-display text-xl text-[color:var(--ink)] mb-3">{g.title[locale]}</p>
                                            <GiftShare url={`${site.url}/g/${gift.id}/${g.slug}`} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <GiftShare url={`${site.url}/g/${gift.id}`} />
                            )}
                        </>
                    ) : (
                        <>
                            <h1
                                className="font-display text-[color:var(--ink)] uppercase"
                                style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1.05 }}
                            >
                                {t("pendingTitle")}
                            </h1>
                            <p className="mt-4 mb-10 text-lg leading-relaxed text-[color:var(--muted)]">
                                {t("pendingIntro")}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={`/${locale}/unlock/${slug}/success${session_id ? `?session_id=${encodeURIComponent(session_id)}` : ""}`}
                                    className="btn btn-primary"
                                >
                                    {t("refresh")}
                                </Link>
                                <a href={`mailto:${site.email}`} className="btn btn-secondary">
                                    {t("contact")}
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
