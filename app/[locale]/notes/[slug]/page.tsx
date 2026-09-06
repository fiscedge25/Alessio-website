import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { sortedNotes, getProject, type Locale } from "@/lib/hub";
import { site } from "@/lib/site";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";
import NoteDiscussLink from "@/components/hub/NoteDiscuss";

export async function generateStaticParams() {
    return sortedNotes.flatMap((n) =>
        (["en", "it"] as const).map((locale) => ({ locale, slug: n.slug }))
    );
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
    const { locale, slug } = await params;
    const n = sortedNotes.find((x) => x.slug === slug);
    if (!n) return {};
    const l = (locale === "it" ? "it" : "en") as Locale;
    const url = `${site.url}/${locale}/notes/${slug}`;
    return {
        title: `${n.title[l]} — BuiltWithSabba`,
        description: n.description[l],
        alternates: {
            canonical: url,
            languages: {
                en: `${site.url}/en/notes/${slug}`,
                it: `${site.url}/it/notes/${slug}`,
            },
        },
        openGraph: {
            title: `${n.title[l]} — BuiltWithSabba`,
            description: n.description[l],
            url,
            type: "article",
            siteName: "BuiltWithSabba",
        },
        twitter: {
            card: "summary",
            title: `${n.title[l]} — BuiltWithSabba`,
            description: n.description[l],
        },
    };
}

export default async function NotePage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale: rawLocale, slug } = await params;
    const locale = (rawLocale === "it" ? "it" : "en") as Locale;
    setRequestLocale(rawLocale);
    const t = await getTranslations({ locale: rawLocale, namespace: "hub.notesPage" });
    const n = sortedNotes.find((x) => x.slug === slug);
    if (!n) notFound();
    const proj = n.project ? getProject(n.project) : undefined;

    return (
        <>
            <Navbar />
            <main className="px-5 md:px-8 pt-28 md:pt-36 pb-20">
                <article className="max-w-3xl mx-auto">
                    <Reveal>
                        <Link
                            href={`/${locale}/notes`}
                            className="inline-flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            <ArrowLeft size={14} />
                            {t("backToNotes")}
                        </Link>
                        <p className="mt-8 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                            <time dateTime={n.date}>
                                {new Date(n.date + "T00:00:00").toLocaleDateString(
                                    locale === "it" ? "it-IT" : "en-US",
                                    { year: "numeric", month: "long", day: "numeric" }
                                )}
                            </time>
                            {proj && <span> · {proj.title}</span>}
                        </p>
                        <h1
                            className="mt-4 font-display text-[color:var(--ink)]"
                            style={{ fontSize: "clamp(2rem, 6vw, 3.8rem)", lineHeight: 1.02 }}
                        >
                            {n.title[locale]}
                        </h1>
                    </Reveal>
                    <Reveal className="mt-8">
                        <p className="text-lg md:text-xl leading-relaxed text-[color:var(--ink-2)]">
                            {n.description[locale]}
                        </p>
                        {proj && (
                            <p className="mt-6">
                                <Link
                                    href={`/${locale}/projects/${proj.slug}`}
                                    className="u-link text-sm font-medium text-[color:var(--ink)]"
                                >
                                    {proj.title} →
                                </Link>
                            </p>
                        )}
                        {n.externalUrl && (
                            <p className="mt-6">
                                <NoteDiscussLink url={n.externalUrl} label={t("discuss")} />
                            </p>
                        )}
                        {n.tags && n.tags.length > 0 && (
                            <p className="mt-8 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                {n.tags.join(" · ")}
                            </p>
                        )}
                    </Reveal>
                </article>
            </main>
            <Footer />
        </>
    );
}
