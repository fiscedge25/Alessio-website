import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { site } from "@/lib/site";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";
import StartWizard from "@/components/hub/StartWizard";

export async function generateStaticParams() {
    return [{ locale: "en" }, { locale: "it" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "hub.start" });
    const url = `${site.url}/${locale}/start`;
    return {
        title: `${t("title")} — BuiltWithSabba`,
        description: t("intro"),
        alternates: { canonical: url, languages: { en: `${site.url}/en/start`, it: `${site.url}/it/start` } },
        openGraph: { title: t("title"), description: t("intro"), url, type: "website", siteName: "BuiltWithSabba" },
    };
}

export default async function StartPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: "hub.start" });

    return (
        <>
            <Navbar />
            <main className="px-5 md:px-8 pt-28 md:pt-36 pb-20">
                <div className="max-w-3xl mx-auto">
                    <Reveal>
                        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--accent)] mb-5">
                            {t("eyebrow")}
                        </p>
                        <h1
                            className="font-display max-w-2xl text-[color:var(--ink)]"
                            style={{ fontSize: "clamp(2.5rem, 7vw, 4.8rem)", lineHeight: 0.98 }}
                        >
                            {t("title")}<span className="start-cursor" aria-hidden="true">_</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-[color:var(--muted)]">{t("intro")}</p>
                    </Reveal>
                    <div className="mt-8 md:mt-10">
                        <StartWizard />
                    </div>
                    <Reveal className="mt-8">
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-[color:var(--muted)]">
                            <span>{t("proof")}</span>
                            {[["Atlantos", "atlantos"], ["Fiscedge", "fiscedge"], ["Fiscedge Academy", "fiscedge-academy"], ["Giurimi", "giurimi"]].map(([name, slug]) => (
                                <Link key={slug} href={`/${locale}/projects/${slug}`} className="u-link font-medium text-[color:var(--ink)]">
                                    {name}
                                </Link>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </main>
            <Footer />
        </>
    );
}
