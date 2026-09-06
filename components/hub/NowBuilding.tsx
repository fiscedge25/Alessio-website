import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { flagshipProjects, type Locale } from "@/lib/hub";
import { site } from "@/lib/site";
import { SectionHeading, StatusBadge, TechTags } from "./primitives";
import Reveal from "./Reveal";

export default function NowBuilding({
    locale,
    index,
    eyebrow,
    title,
    intro,
    explore,
    visit,
    viewAll,
}: {
    locale: Locale;
    index: string;
    eyebrow: string;
    title: string;
    intro: string;
    explore: string;
    visit: string;
    viewAll: string;
}) {
    return (
        <section id="building" aria-label={title} className="px-5 md:px-8 py-20 md:py-28 scroll-mt-16">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <SectionHeading index={index} eyebrow={eyebrow} title={title} intro={intro} />
                </Reveal>

                <ol className="border-t rule">
                    {flagshipProjects.map((p, i) => {
                        const num = String(i + 1).padStart(2, "0");
                        return (
                            <li key={p.slug} className="border-b rule">
                                <Reveal>
                                    <article className="project-row grid gap-4 md:gap-6 py-10 md:py-14 md:grid-cols-[64px_1fr_auto] md:items-start px-2 md:px-4 -mx-2 md:-mx-4 rounded-sm">
                                        <p
                                            aria-hidden="true"
                                            className="font-mono-meta text-sm text-[color:var(--muted)] pt-1"
                                        >
                                            {num}
                                        </p>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
                                                <h3
                                                    className="project-title font-display text-[color:var(--ink)] uppercase"
                                                    style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)", lineHeight: 1 }}
                                                >
                                                    {p.title}
                                                </h3>
                                                <StatusBadge status={p.status} />
                                            </div>
                                            <p className="max-w-2xl text-base md:text-lg leading-relaxed text-[color:var(--muted)]">
                                                {p.description[locale]}
                                            </p>
                                            <div className="mt-5">
                                                <TechTags items={p.tech} />
                                            </div>
                                        </div>
                                        <div className="flex flex-row md:flex-col gap-x-6 gap-y-3 md:items-end md:pt-2">
                                            <Link
                                                href={`/${locale}/projects/${p.slug}`}
                                                className="u-link inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                                            >
                                                {explore}
                                                <ArrowUpRight size={15} className="arrow-shift" />
                                            </Link>
                                            {p.website && (
                                                <a
                                                    href={p.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="u-link inline-flex items-center gap-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                                                >
                                                    {visit}
                                                    <ArrowUpRight size={15} className="arrow-shift" />
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
                        href={`/${locale}#projects`}
                        className="u-link inline-flex items-center gap-1.5 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                    >
                        {viewAll}
                        <ArrowUpRight size={15} className="arrow-shift" />
                    </Link>
                    <span className="sr-only"> · {site.fiscedge.url}</span>
                </Reveal>
            </div>
        </section>
    );
}
