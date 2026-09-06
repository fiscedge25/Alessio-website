import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { type Locale } from "@/lib/hub";
import Reveal from "./Reveal";

export default function OpenTo({
    locale,
    index,
    eyebrow,
    title,
    intro,
    topics,
    cta,
}: {
    locale: Locale;
    index: string;
    eyebrow: string;
    title: string;
    intro: string;
    topics: string[];
    cta: string;
}) {
    return (
        <section aria-label={title} className="px-5 md:px-8 py-20 md:py-28">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-4">
                        {index} — {eyebrow}
                    </p>
                    <h2
                        className="font-display text-[color:var(--ink)] max-w-3xl"
                        style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)", lineHeight: 1.02 }}
                    >
                        {title}
                    </h2>
                    <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-[color:var(--muted)]">
                        {intro}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2" aria-label={title}>
                        {topics.map((topic) => (
                            <li
                                key={topic}
                                className="font-mono-meta text-[11px] uppercase border rule rounded-full px-3.5 py-1.5 text-[color:var(--muted)]"
                            >
                                {topic}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <Link
                            href={`/${locale}/build-with-me`}
                            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] px-7 py-3.5 text-sm font-medium hover:opacity-85 transition-opacity"
                        >
                            {cta}
                            <ArrowRight size={16} className="arrow-shift" />
                        </Link>
                        <a
                            href={site.linkedin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="u-link inline-flex items-center gap-1.5 font-mono-meta text-xs uppercase text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                        >
                            LinkedIn
                            <ArrowUpRight size={14} className="arrow-shift" />
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
