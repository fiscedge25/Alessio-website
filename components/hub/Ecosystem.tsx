import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { SectionHeading } from "./primitives";
import Reveal from "./Reveal";
import TrackedLink from "./TrackedLink";

export default function Ecosystem({
    index,
    eyebrow,
    title,
    intro,
    exploreFiscedge,
    exploreAcademy,
}: {
    index: string;
    eyebrow: string;
    title: string;
    intro: string;
    exploreFiscedge: string;
    exploreAcademy: string;
}) {
    return (
        <section aria-label={title} className="px-5 md:px-8 py-20 md:py-28">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <SectionHeading index={index} eyebrow={eyebrow} title={title} intro={intro} />
                </Reveal>

                <Reveal>
                    {/* Minimal ecosystem diagram: pure type + hairlines, no boxes-of-color */}
                    <div className="border rule rounded-sm px-6 py-10 md:px-12 md:py-14 text-center">
                        <p className="font-display uppercase text-[color:var(--ink)]" style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)" }}>
                            Fiscedge
                        </p>
                        <div aria-hidden="true" className="mx-auto my-6 h-10 w-px bg-[color:var(--line)]" />
                        <div className="grid gap-8 md:grid-cols-2 md:gap-0 max-w-3xl mx-auto">
                            <div className="md:border-r rule md:pr-10">
                                <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                    Company building
                                </p>
                                <p className="mt-2 font-display text-xl text-[color:var(--ink)]">
                                    FiscedgeOS
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                                    AI workflows · expert network · execution
                                </p>
                                <TrackedLink
                                    href={site.fiscedge.url}
                                    event="fiscedge_click"
                                    className="u-link mt-4 inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                                >
                                    {exploreFiscedge}
                                    <ArrowUpRight size={15} className="arrow-shift" />
                                </TrackedLink>
                            </div>
                            <div className="md:pl-10">
                                <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                    Education
                                </p>
                                <p className="mt-2 font-display text-xl text-[color:var(--ink)]">
                                    Fiscedge Academy
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                                    Masterclasses · applied projects · faculty
                                </p>
                                <TrackedLink
                                    href={site.fiscedge.academyUrl}
                                    event="academy_click"
                                    className="u-link mt-4 inline-flex items-center gap-1 text-sm font-medium text-[color:var(--ink)]"
                                >
                                    {exploreAcademy}
                                    <ArrowUpRight size={15} className="arrow-shift" />
                                </TrackedLink>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

