import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/site";
import { gifts, getGift } from "@/lib/gifts";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";
import GiftBuilder from "@/components/hub/GiftBuilder";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateStaticParams() {
    return ["en", "it"].flatMap((locale) => gifts.map((g) => ({ locale, slug: g.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale: raw, slug } = await params;
    const locale = raw === "it" ? "it" : "en";
    const g = getGift(slug);
    if (!g) return {};
    const url = `${site.url}/${locale}/gift/${slug}`;
    return {
        title: `${g.title[locale]} — BuiltWithSabba`,
        description: g.tagline[locale],
        alternates: {
            canonical: url,
            languages: { en: `${site.url}/en/gift/${slug}`, it: `${site.url}/it/gift/${slug}` },
        },
        openGraph: { title: g.title[locale], description: g.tagline[locale], url, type: "website", siteName: "BuiltWithSabba" },
    };
}

export default async function GiftPage({ params }: { params: Params }) {
    const { locale: raw, slug } = await params;
    const locale = raw === "it" ? "it" : "en";
    setRequestLocale(raw);
    const g = getGift(slug);
    if (!g) notFound();

    const t = await getTranslations({ locale: raw, namespace: "hub.gift" });

    return (
        <>
            <Navbar />
            <main className="px-5 md:px-8 pt-28 md:pt-36 pb-20">
                <div className="max-w-6xl mx-auto">
                    <Reveal>
                        <Link
                            href={`/${locale}/gift`}
                            className="inline-flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors mb-8"
                        >
                            <ArrowLeft size={14} />
                            {t("back")}
                        </Link>
                        <h1
                            className="font-display text-[color:var(--ink)] uppercase"
                            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05 }}
                        >
                            {g.title[locale]}
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--muted)]">
                            {g.tagline[locale]}
                        </p>
                    </Reveal>

                    <div className="mt-12">
                        <GiftBuilder gift={g} />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
