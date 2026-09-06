import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { sortedNotes, getProject, formatNoteDate, type Locale } from "@/lib/hub";
import { SectionHeading } from "./primitives";
import Reveal from "./Reveal";

export default function BuildLog({
    locale,
    index,
    eyebrow,
    title,
    intro,
    viewAll,
    discuss,
}: {
    locale: Locale;
    index: string;
    eyebrow: string;
    title: string;
    intro: string;
    viewAll: string;
    discuss: string;
}) {
    const notes = sortedNotes.slice(0, 3);
    return (
        <section id="notes" aria-label={title} className="px-5 md:px-8 py-20 md:py-28 scroll-mt-16">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <SectionHeading index={index} eyebrow={eyebrow} title={title} intro={intro} />
                </Reveal>

                <ol className="border-t rule">
                    {notes.map((n) => {
                        const proj = n.project ? getProject(n.project) : undefined;
                        return (
                            <li key={n.slug} className="border-b rule">
                                <Reveal>
                                    <article className="project-row grid gap-2 md:gap-6 py-7 md:py-8 md:grid-cols-[110px_1fr_auto] md:items-baseline px-2 md:px-4 -mx-2 md:-mx-4 rounded-sm">
                                        <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                            <time dateTime={n.date}>{formatNoteDate(n.date, locale)}</time>
                                        </p>
                                        <div>
                                            <h3 className="text-lg md:text-xl font-medium text-[color:var(--ink)] leading-snug">
                                                <Link
                                                    href={`/${locale}/notes/${n.slug}`}
                                                    className="hover:underline underline-offset-4 decoration-1"
                                                >
                                                    {n.title[locale]}
                                                </Link>
                                            </h3>
                                            <p className="mt-1.5 leading-relaxed text-[color:var(--muted)]">
                                                {n.description[locale]}
                                            </p>
                                            {proj && (
                                                <p className="mt-2 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                                    {proj.title}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-5 md:flex-col md:items-end md:gap-2">
                                            <Link
                                                href={`/${locale}/notes/${n.slug}`}
                                                aria-label={n.title[locale]}
                                                className="inline-flex items-center gap-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                                            >
                                                <ArrowRight size={16} className="arrow-shift" />
                                            </Link>
                                            {n.externalUrl && (
                                                <a
                                                    href={n.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="u-link inline-flex items-center gap-1 font-mono-meta text-[11px] uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                                                >
                                                    {discuss}
                                                    <ArrowUpRight size={13} className="arrow-shift" />
                                                </a>
                                            )}
                                        </div>
                                    </article>
                                </Reveal>
                            </li>
                        );
                    })}
                </ol>

                <Reveal className="mt-8">
                    <Link
                        href={`/${locale}/notes`}
                        className="u-link inline-flex items-center gap-1.5 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                    >
                        {viewAll}
                        <ArrowUpRight size={15} className="arrow-shift" />
                    </Link>
                </Reveal>
            </div>
        </section>
    );
}
