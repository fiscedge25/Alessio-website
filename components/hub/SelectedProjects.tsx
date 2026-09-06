import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { selectedProjects, type Locale, type Project } from "@/lib/hub";
import { StatusBadge, SectionHeading, TechTags } from "./primitives";
import Reveal from "./Reveal";

function ProjectCard({
    p,
    locale,
    view,
}: {
    p: Project;
    locale: Locale;
    view: string;
}) {
    return (
        <article className="project-row group border-t rule py-8 md:py-10 px-2 md:px-4 -mx-2 md:-mx-4 rounded-sm grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
            <div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h3 className="font-display text-2xl md:text-[2rem] text-[color:var(--ink)] uppercase leading-none">
                        <Link
                            href={`/${locale}/projects/${p.slug}`}
                            className="group-hover:underline underline-offset-8 decoration-1"
                        >
                            {p.title}
                        </Link>
                    </h3>
                    <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                    {p.category[locale]} · {p.year}
                </p>
                <p className="mt-4 max-w-2xl leading-relaxed text-[color:var(--muted)]">
                    {p.description[locale]}
                </p>
                <div className="mt-4">
                    <TechTags items={p.tech} />
                </div>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                    <Link
                        href={`/${locale}/projects/${p.slug}`}
                        className="u-link inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                    >
                        {view}
                        <ArrowUpRight size={15} className="arrow-shift" />
                    </Link>
                    {p.website && (
                        <a
                            href={p.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="u-link inline-flex items-center gap-1 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            Website
                            <ArrowUpRight size={15} className="arrow-shift" />
                        </a>
                    )}
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
            </div>
        </article>
    );
}

export default function SelectedProjects({
    locale,
    index,
    eyebrow,
    title,
    intro,
    view,
}: {
    locale: Locale;
    index: string;
    eyebrow: string;
    title: string;
    intro: string;
    view: string;
}) {
    return (
        <section id="projects" aria-label={title} className="px-5 md:px-8 py-20 md:py-28 scroll-mt-16">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <SectionHeading index={index} eyebrow={eyebrow} title={title} intro={intro} />
                </Reveal>
                <div>
                    {selectedProjects.map((p) => (
                        <Reveal key={p.slug}>
                            <ProjectCard p={p} locale={locale} view={view} />
                        </Reveal>
                    ))}
                </div>
                <div className="border-b rule" aria-hidden="true" />
            </div>
        </section>
    );
}
