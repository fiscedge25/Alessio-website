import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/site";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";
import BundleBuilder from "@/components/hub/BundleBuilder";

export async function generateStaticParams() {
    return [{ locale: "en" }, { locale: "it" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "hub.gift" });
    const url = `${site.url}/${locale}/gift/all`;
    return {
        title: `${t("bundleTitle")} — BuiltWithSabba`,
        description: t("bundleBody"),
        alternates: {
            canonical: url,
            languages: { en: `${site.url}/en/gift/all`, it: `${site.url}/it/gift/all` },
        },
        openGraph: { title: t("bundleTitle"), description: t("bundleBody"), url, type: "website", siteName: "BuiltWithSabba" },
    };
}

export default async function BundlePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: raw } = await params;
    const locale = raw === "it" ? "it" : "en";
    setRequestLocale(raw);
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
                        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-3">✦ {t("bundleEyebrow")}</p>
                        <h1
                            className="font-display text-[color:var(--ink)] uppercase"
                            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05 }}
                        >
                            {t("bundleTitle")}
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--muted)]">{t("bundleBody")}</p>
                    </Reveal>

                    <div className="mt-12">
                        <BundleBuilder />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
