import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";
import ProjectForm from "@/components/hub/ProjectForm";

export async function generateStaticParams() {
    return [{ locale: "en" }, { locale: "it" }];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "hub.buildWithMe" });
    const url = `${site.url}/${locale}/build-with-me`;
    return {
        title: `${t("title")} — BuiltWithSabba`,
        description: t("intro"),
        alternates: {
            canonical: url,
            languages: {
                en: `${site.url}/en/build-with-me`,
                it: `${site.url}/it/build-with-me`,
            },
        },
        openGraph: {
            title: `${t("title")} — BuiltWithSabba`,
            description: t("intro"),
            url,
            type: "website",
            siteName: "BuiltWithSabba",
        },
    };
}

export default async function BuildWithMePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale = rawLocale === "it" ? "it" : "en";
    setRequestLocale(rawLocale);
    const t = await getTranslations({ locale: rawLocale, namespace: "hub.buildWithMe" });

    const scenarios: string[] = [t("s1"), t("s2"), t("s3"), t("s4"), t("s5")];
    const steps = [
        { n: "01", title: t("step1t"), body: t("step1d") },
        { n: "02", title: t("step2t"), body: t("step2d") },
        { n: "03", title: t("step3t"), body: t("step3d") },
        { n: "04", title: t("step4t"), body: t("step4d") },
    ];

    return (
        <>
            <Navbar />
            <main className="px-5 md:px-8 pt-28 md:pt-36 pb-20">
                <div className="max-w-3xl mx-auto">
                    <Reveal>
                        <Link
                            href={`/${locale}`}
                            className="inline-flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            <ArrowLeft size={14} />
                            {t("back")}
                        </Link>
                        <h1
                            className="mt-6 font-display uppercase text-[color:var(--ink)]"
                            style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: 0.98 }}
                        >
                            {t("hero")}
                        </h1>
                        <p className="mt-5 text-lg leading-relaxed text-[color:var(--muted)]">
                            {t("intro")}
                        </p>
                        <p className="mt-3 leading-relaxed text-[color:var(--muted)]">
                            {t("detail")}
                        </p>
                    </Reveal>

                    {/* Scenarios */}
                    <Reveal className="mt-14">
                        <h2 className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-2">
                            {t("scenariosTitle")}
                        </h2>
                        <ul className="border-t rule">
                            {scenarios.map((s) => (
                                <li
                                    key={s}
                                    className="border-b rule py-4 leading-relaxed text-[color:var(--ink-2)]"
                                >
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    {/* Process */}
                    <div className="mt-14">
                        <Reveal>
                            <h2 className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-2">
                                {t("processTitle")}
                            </h2>
                        </Reveal>
                        <ol className="grid gap-px border rule bg-[color:var(--line)] sm:grid-cols-2">
                            {steps.map((s) => (
                                <li key={s.n} className="bg-[color:var(--paper)] p-6">
                                    <p className="font-mono-meta text-[11px] text-[color:var(--muted)]">
                                        {s.n}
                                    </p>
                                    <p className="mt-2 font-display text-lg uppercase text-[color:var(--ink)]">
                                        {s.title}
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                                        {s.body}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Form */}
                    <Reveal className="mt-14">
                        <h2
                            className="font-display text-[color:var(--ink)]"
                            style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
                        >
                            {t("title")}
                        </h2>
                        <p className="mt-3 leading-relaxed text-[color:var(--muted)]">
                            {t("formIntro")}
                        </p>
                        <div className="mt-8">
                            <ProjectForm />
                        </div>
                        <a
                            href={site.linkedin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="u-link mt-8 inline-flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            {t("linkedinAlt")}
                            <ArrowUpRight size={14} className="arrow-shift" />
                        </a>
                    </Reveal>
                </div>
            </main>
            <Footer />
        </>
    );
}
