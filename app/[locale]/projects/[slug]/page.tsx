import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { getProject, projects, type Locale } from "@/lib/hub";
import { site } from "@/lib/site";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";
import { StatusBadge } from "@/components/hub/primitives";
import TrackedLink from "@/components/hub/TrackedLink";

export async function generateStaticParams() {
    return projects.flatMap((p) =>
        (["en", "it"] as const).map((locale) => ({ locale, slug: p.slug }))
    );
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const p = getProject(slug);
    if (!p) return {};
    const l = (locale === "it" ? "it" : "en") as Locale;
    const url = `${site.url}/${locale}/projects/${slug}`;
    return {
        title: `${p.title} — BuiltWithSabba`,
        description: p.description[l],
        alternates: {
            canonical: url,
            languages: {
                en: `${site.url}/en/projects/${slug}`,
                it: `${site.url}/it/projects/${slug}`,
            },
        },
        openGraph: {
            title: `${p.title} — BuiltWithSabba`,
            description: p.description[l],
            url,
            type: "article",
            siteName: "BuiltWithSabba",
        },
        twitter: {
            card: "summary",
            title: `${p.title} — BuiltWithSabba`,
            description: p.description[l],
        },
    };
}

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale: rawLocale, slug } = await params;
    const locale = (rawLocale === "it" ? "it" : "en") as Locale;
    setRequestLocale(rawLocale);
    const t = await getTranslations({ locale: rawLocale, namespace: "hub.project" });
    const p = getProject(slug);
    if (!p) notFound();

    const blocks: { label: string; body?: string }[] = [
        { label: t("thesis"), body: p.thesis?.[locale] },
        { label: t("what"), body: p.longDescription?.[locale] ?? p.description[locale] },
        { label: t("problem"), body: p.problem?.[locale] },
        { label: t("built"), body: p.built?.[locale] },
        { label: t("learnings"), body: p.learnings?.[locale] },
    ].filter((b) => b.body);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: p.title,
        description: p.description[locale],
        applicationCategory: p.category[locale],
        operatingSystem: "Web",
        ...(p.website ? { url: p.website } : {}),
        author: { "@type": "Person", name: site.owner, url: site.url },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />
            <main className="px-5 md:px-8 pt-28 md:pt-36 pb-20">
                <article className="max-w-3xl mx-auto">
                    <Reveal>
                        <Link
                            href={`/${locale}#projects`}
                            className="inline-flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            <ArrowLeft size={14} />
                            {t("back")}
                        </Link>
                    </Reveal>

                    <Reveal className="mt-8">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                            <StatusBadge status={p.status} />
                            <span className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                {p.year} · {p.category[locale]}
                            </span>
                        </div>
                        <h1
                            className="mt-5 font-display uppercase text-[color:var(--ink)]"
                            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 0.98 }}
                        >
                            {p.title}
                        </h1>
                        <p className="mt-6 text-lg md:text-xl leading-relaxed text-[color:var(--ink-2)]">
                            {p.thesis?.[locale] ?? p.description[locale]}
                        </p>
                        <p className="mt-4 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                            {p.tech.join(" · ")}
                        </p>
                        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
                            {p.website && (
                                <TrackedLink
                                    href={p.website}
                                    event="project_external_click"
                                    detail={{ project: p.slug }}
                                    className="u-link inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                                >
                                    {t("live")}
                                    <ArrowUpRight size={15} className="arrow-shift" />
                                </TrackedLink>
                            )}
                            {p.github && (
                                <TrackedLink
                                    href={p.github}
                                    event="github_click"
                                    detail={{ from: `project-${p.slug}` }}
                                    className="u-link inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                                >
                                    GitHub
                                    <ArrowUpRight size={15} className="arrow-shift" />
                                </TrackedLink>
                            )}
                        </div>
                    </Reveal>

                    <div className="mt-14 border-t rule">
                        {blocks.map((b) => (
                            <Reveal key={b.label}>
                                <section className="border-b rule py-8">
                                    <h2 className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-3">
                                        {b.label}
                                    </h2>
                                    <p className="leading-relaxed text-[color:var(--ink-2)] text-base md:text-lg">
                                        {b.body}
                                    </p>
                                </section>
                            </Reveal>
                        ))}
                    </div>

                    {/* Contextual mini-CTA */}
                    <Reveal>
                        <aside className="mt-12 border rule rounded-sm p-7 md:p-8 bg-[color:var(--paper-elevated)]">
                            <p className="font-display text-xl text-[color:var(--ink)]">
                                {t("ctaTitle")}
                            </p>
                            <p className="mt-2 text-[color:var(--muted)] leading-relaxed">
                                {t("ctaIntro")}
                            </p>
                            <Link
                                href={`/${locale}/build-with-me`}
                                className="u-link mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink)]"
                            >
                                {t("ctaLink")}
                                <ArrowRight size={15} className="arrow-shift" />
                            </Link>
                        </aside>
                    </Reveal>
                </article>
            </main>
            <Footer />
        </>
    );
}
