import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { sortedNotes, getProject, formatNoteDate, type Locale } from "@/lib/hub";
import { site } from "@/lib/site";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";
import Reveal from "@/components/hub/Reveal";

export async function generateStaticParams() {
    return ["en", "it"].flatMap((locale) => [{ locale }]);
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "hub.notesPage" });
    const url = `${site.url}/${locale}/notes`;
    return {
        title: `${t("title")} — BuiltWithSabba`,
        description: t("intro"),
        alternates: {
            canonical: url,
            languages: { en: `${site.url}/en/notes`, it: `${site.url}/it/notes` },
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

export default async function NotesIndex({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale: rawLocale } = await params;
    const locale = (rawLocale === "it" ? "it" : "en") as Locale;
    setRequestLocale(rawLocale);
    const t = await getTranslations({ locale: rawLocale, namespace: "hub.notesPage" });

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
                            style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)", lineHeight: 1 }}
                        >
                            {t("title")}
                        </h1>
                        <p className="mt-4 text-lg leading-relaxed text-[color:var(--muted)]">
                            {t("intro")}
                        </p>
                    </Reveal>

                    <ol className="mt-12 border-t rule">
                        {sortedNotes.map((n) => {
                            const proj = n.project ? getProject(n.project) : undefined;
                            return (
                                <li key={n.slug} className="border-b rule">
                                    <Reveal>
                                        <article className="project-row grid gap-2 md:grid-cols-[110px_1fr] md:gap-6 py-7 px-2 md:px-4 -mx-2 md:-mx-4 rounded-sm">
                                            <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] md:pt-1.5">
                                                <time dateTime={n.date}>
                                                    {formatNoteDate(n.date, locale)}
                                                </time>
                                            </p>
                                            <div>
                                                <h2 className="text-xl font-medium text-[color:var(--ink)] leading-snug">
                                                    <Link
                                                        href={`/${locale}/notes/${n.slug}`}
                                                        className="hover:underline underline-offset-4 decoration-1"
                                                    >
                                                        {n.title[locale]}
                                                    </Link>
                                                </h2>
                                                <p className="mt-1.5 leading-relaxed text-[color:var(--muted)]">
                                                    {n.description[locale]}
                                                </p>
                                                {proj && (
                                                    <p className="mt-2 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                                        {proj.title}
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    </Reveal>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </main>
            <Footer />
        </>
    );
}



