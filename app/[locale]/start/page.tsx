import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
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
                        <p className="status-pill font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-6">
                            <span className="status-dot" aria-hidden="true" />
                            {t("status")}
                        </p>
                        <h1
                            className="font-display text-[color:var(--ink)]"
                            style={{ fontSize: "clamp(2.2rem, 6vw, 3.8rem)", lineHeight: 1.02 }}
                        >
                            {t("title")}
                        </h1>
                        <p className="mt-4 text-lg leading-relaxed text-[color:var(--muted)]">{t("intro")}</p>
                        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--ink-2)]">
                            {(["perk1", "perk2", "perk3"] as const).map((k) => (
                                <li key={k} className="inline-flex items-center gap-1.5">
                                    <Check size={15} className="text-[color:var(--accent)]" />
                                    {t(k)}
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                    <div className="mt-10">
                        <StartWizard />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
