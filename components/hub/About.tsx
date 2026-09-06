import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { type Locale } from "@/lib/hub";
import { SectionHeading } from "./primitives";
import Reveal from "./Reveal";
import TrackedLink from "./TrackedLink";

export default function About({
    locale,
    index,
    eyebrow,
    title,
    paragraphs,
    based,
}: {
    locale: Locale;
    index: string;
    eyebrow: string;
    title: string;
    paragraphs: string[];
    based: string;
}) {
    void locale;
    return (
        <section id="about" aria-label={title} className="px-5 md:px-8 py-20 md:py-28 scroll-mt-16">
            <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
                <Reveal>
                    <SectionHeading index={index} eyebrow={eyebrow} title={title} />
                    <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                        {based}
                    </p>
                </Reveal>
                <Reveal delay={100}>
                    <div className="flex flex-col gap-5 text-base md:text-lg leading-relaxed text-[color:var(--muted)]">
                        {paragraphs.map((p, i) => (
                            <p key={i} className={i === 0 ? "text-[color:var(--ink-2)] text-lg md:text-xl" : ""}>
                                {p}
                            </p>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
                        <TrackedLink
                            href={site.linkedin.url}
                            event="linkedin_click"
                            detail={{ from: "about" }}
                            className="u-link inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                        >
                            LinkedIn
                            <ArrowUpRight size={15} className="arrow-shift" />
                        </TrackedLink>
                        <TrackedLink
                            href={site.github.url}
                            event="github_click"
                            detail={{ from: "about" }}
                            className="u-link inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                        >
                            GitHub
                            <ArrowUpRight size={15} className="arrow-shift" />
                        </TrackedLink>
                        <TrackedLink
                            href={site.fiscedge.url}
                            event="fiscedge_click"
                            detail={{ from: "about" }}
                            className="u-link inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                        >
                            Fiscedge
                            <ArrowUpRight size={15} className="arrow-shift" />
                        </TrackedLink>
                        <a
                            href={`mailto:${site.email}`}
                            className="u-link inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                        >
                            Email
                            <ArrowUpRight size={15} className="arrow-shift" />
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

export function BuildTogether({
    locale,
    title,
    intro,
    detail,
    approach,
    cta,
}: {
    locale: Locale;
    title: string;
    intro: string;
    detail: string;
    approach: string;
    cta: string;
}) {
    return (
        <section aria-label={title} className="px-5 md:px-8 py-20 md:py-28">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <div className="border rule rounded-sm px-6 py-10 md:px-12 md:py-14 grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end bg-[color:var(--paper-elevated)]">
                        <div>
                            <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-4">
                                09 — Collaboration
                            </p>
                            <h2
                                className="font-display text-[color:var(--ink)] uppercase"
                                style={{ fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)", lineHeight: 1.02 }}
                            >
                                {title}
                            </h2>
                            <p className="mt-5 leading-relaxed text-[color:var(--muted)] max-w-xl">
                                {intro}
                            </p>
                            <p className="mt-3 leading-relaxed text-[color:var(--muted)] max-w-xl">
                                {detail}
                            </p>
                            <p className="mt-5 border-l-2 border-[color:var(--ink)] pl-4 text-[color:var(--ink-2)] leading-relaxed max-w-xl">
                                {approach}
                            </p>
                        </div>
                        <div className="flex md:justify-end">
                            <Link
                                href={`/${locale}/build-with-me`}
                                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] px-7 py-3.5 text-sm font-medium hover:opacity-85 transition-opacity"
                            >
                                {cta}
                                <ArrowRight size={16} className="arrow-shift" />
                            </Link>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
