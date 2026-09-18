import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { site } from "@/lib/site";
import { prompts } from "@/lib/prompts";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";
import { SectionHeading } from "@/components/hub/primitives";

export async function generateStaticParams() {
    return [{ locale: "en" }, { locale: "it" }];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "hub.prompts" });
    const url = `${site.url}/${locale}/prompts`;
    return {
        title: `${t("eyebrow")} — BuiltWithSabba`,
        description: t("intro"),
        alternates: {
            canonical: url,
            languages: { en: `${site.url}/en/prompts`, it: `${site.url}/it/prompts` },
        },
        openGraph: { title: t("eyebrow"), description: t("intro"), url, type: "website", siteName: "BuiltWithSabba" },
    };
}

export default async function PromptsIndex({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: raw } = await params;
    const locale = raw === "it" ? "it" : "en";
    setRequestLocale(raw);
    const t = await getTranslations({ locale: raw, namespace: "hub.prompts" });

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

                    <ul className="border-t rule">
                        {prompts.map((p, i) => (
                            <Reveal as="li" key={p.slug} delay={i * 80} className="border-b rule">
                                <Link
                                    href={`/${locale}/prompts/${p.slug}`}
                                    className="project-row group grid gap-4 py-8 md:grid-cols-[3rem_1fr_auto] md:items-center"
                                >
                                    <span className="font-mono-meta text-[11px] text-[color:var(--muted)]">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <div>
                                        <h2 className="font-display text-2xl md:text-3xl text-[color:var(--ink)]">
                                            {p.title[locale]}
                                        </h2>
                                        <p className="mt-2 text-[color:var(--muted)] leading-relaxed">
                                            {p.tagline[locale]}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                            <span className="tag inline-flex items-center gap-1">
                                                <Clock size={11} /> ~{p.minutes} {t("minutes")}
                                            </span>
                                            {p.worksWith.slice(0, 3).map((w) => (
                                                <span key={w} className="tag">
                                                    {w}
                                                </span>
                                            ))}
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
