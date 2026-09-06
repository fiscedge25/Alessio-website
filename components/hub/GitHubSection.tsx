import { ArrowUpRight, Star } from "lucide-react";
import { getCuratedRepos } from "@/lib/github";
import { site } from "@/lib/site";
import { SectionHeading } from "./primitives";
import Reveal from "./Reveal";

export default async function GitHubSection({
    index,
    eyebrow,
    title,
    intro,
    explore,
    updated,
}: {
    index: string;
    eyebrow: string;
    title: string;
    intro: string;
    explore: string;
    updated: string;
}) {
    const { repos } = await getCuratedRepos();

    return (
        <section aria-label={title} className="px-5 md:px-8 py-20 md:py-28">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <SectionHeading index={index} eyebrow={eyebrow} title={title} intro={intro} />
                </Reveal>

                <ul className="border-t rule">
                    {repos.map((r) => (
                        <li key={r.name} className="border-b rule">
                            <Reveal>
                                <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-row group grid gap-1.5 md:gap-6 py-6 md:grid-cols-[1fr_auto] md:items-baseline px-2 md:px-4 -mx-2 md:-mx-4 rounded-sm"
                                >
                                    <div>
                                        <p className="font-mono-meta text-sm text-[color:var(--ink)]">
                                            {r.name}
                                        </p>
                                        {r.description && (
                                            <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)] max-w-2xl">
                                                {r.description}
                                            </p>
                                        )}
                                        <p className="mt-2 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                            {r.language && <span>{r.language} · </span>}
                                            {updated}{" "}
                                            {new Date(r.updatedAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                year: "numeric",
                                            })}
                                            {r.stars > 0 && (
                                                <span className="inline-flex items-center gap-1 ml-3">
                                                    <Star size={11} /> {r.stars}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <ArrowUpRight
                                        size={17}
                                        className="arrow-shift hidden md:block text-[color:var(--muted)] group-hover:text-[color:var(--ink)]"
                                    />
                                </a>
                            </Reveal>
                        </li>
                    ))}
                </ul>

                <Reveal className="mt-8">
                    <a
                        href={site.github.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="u-link inline-flex items-center gap-1.5 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-colors"
                    >
                        {explore}
                        <ArrowUpRight size={15} className="arrow-shift" />
                    </a>
                </Reveal>
            </div>
        </section>
    );
}
