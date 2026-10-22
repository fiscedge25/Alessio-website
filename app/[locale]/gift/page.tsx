import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { gifts } from "@/lib/gifts";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";
import { SectionHeading } from "@/components/hub/primitives";
import BundleCard from "@/components/hub/BundleCard";

export async function generateStaticParams() {
    return [{ locale: "en" }, { locale: "it" }];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "hub.gift" });
    const url = `${site.url}/${locale}/gift`;
    return {
        title: `${t("eyebrow")} — BuiltWithSabba`,
        description: t("intro"),
        alternates: {
            canonical: url,
            languages: { en: `${site.url}/en/gift`, it: `${site.url}/it/gift` },
        },
        openGraph: { title: t("eyebrow"), description: t("intro"), url, type: "website", siteName: "BuiltWithSabba" },
    };
}

export default async function GiftIndex({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: raw } = await params;
    const locale = raw === "it" ? "it" : "en";
    setRequestLocale(raw);
    const t = await getTranslations({ locale: raw, namespace: "hub.gift" });

    return (
        <>
            <Navbar />
            <main className="px-5 md:px-8 pt-28 md:pt-36 pb-20">
                <div className="max-w-4xl mx-auto">
                    <Reveal>
                        <Link
                            href={`/${locale}`}
                            className="inline-flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors mb-10"
                        >
                            <ArrowLeft size={14} />
                            {t("home")}
                        </Link>
                        <SectionHeading index="//" eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
                    </Reveal>

                    <Reveal className="mb-14">
                        <BundleCard
                            locale={locale}
                            labels={{
                                eyebrow: t("bundleEyebrow"),
                                title: t("bundleTitle"),
                                body: t("bundleBody"),
                                instead: t("bundleInstead"),
                                cta: t("bundleCta"),
                            }}
                        />
                    </Reveal>

                    <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-4">{t("singles")}</p>
                    <ul className="border-t rule">
                        {gifts.map((g, i) => (
                            <Reveal as="li" key={g.slug} delay={i * 80} className="border-b rule">
                                <Link
                                    href={`/${locale}/gift/${g.slug}`}
                                    className="project-row group grid gap-4 py-8 md:grid-cols-[3rem_1fr_auto] md:items-center"
                                >
                                    <span className="font-mono-meta text-[11px] text-[color:var(--muted)]">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <div>
                                        <h2 className="font-display text-2xl md:text-3xl text-[color:var(--ink)]">
                                            {g.title[locale]}
                                        </h2>
                                        <p className="mt-2 text-[color:var(--muted)] leading-relaxed">
                                            {g.tagline[locale]}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                            <span className="tag">
                                                {t("from")} {g.price}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 font-mono-meta text-[12px] uppercase text-[color:var(--ink)]">
                                        {t("open")} <ArrowUpRight size={14} className="arrow-shift" />
                                    </span>
                                </Link>
                            </Reveal>
                        ))}
                    </ul>
                </div>
            </main>
            <Footer />
        </>
    );
}
