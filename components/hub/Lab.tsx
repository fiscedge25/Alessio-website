import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { labProjects, type Locale } from "@/lib/hub";
import { StatusBadge, SectionHeading } from "./primitives";
import Reveal from "./Reveal";

export default function Lab({
    locale,
    index,
    eyebrow,
    title,
    intro,
    line2,
    view,
}: {
    locale: Locale;
    index: string;
    eyebrow: string;
    title: string;
    intro: string;
    line2: string;
    view: string;
}) {
    return (
        <section id="lab" aria-label={title} className="px-5 md:px-8 py-20 md:py-28 scroll-mt-16">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <SectionHeading
                        index={index}
                        eyebrow={eyebrow}
                        title={title}
                        intro={`${intro} ${line2}`}
                    />
                </Reveal>

                <div className="grid gap-px border rule bg-[color:var(--line)] sm:grid-cols-2">
                    {labProjects.map((p) => (
                        <Reveal key={p.slug}>
                            <article className="h-full bg-[color:var(--paper)] p-7 md:p-9 flex flex-col hover:bg-[color:var(--paper-elevated)] transition-colors">
                                <StatusBadge status={p.status} />
                                <h3 className="mt-4 font-display text-2xl text-[color:var(--ink)] uppercase">
                                    {p.title}
                                </h3>
                                <p className="mt-1 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                    {p.category[locale]} · {p.year}
                                </p>
                                <p className="mt-4 leading-relaxed text-[color:var(--muted)] flex-1">
                                    {p.description[locale]}
                                </p>
                                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                                    <Link
                                        href={`/${locale}/projects/${p.slug}`}
                                        className="u-link inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                                    >
                                        {view}
                                        <ArrowUpRight size={15} className="arrow-shift" />
                                    </Link>
                                    {p.github && (
                                        <a
                                            href={p.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="u-link inline-flex items-center gap-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                                        >
                                            GitHub
                                            <ArrowUpRight size={15} className="arrow-shift" />
                                        </a>
                                    )}
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
