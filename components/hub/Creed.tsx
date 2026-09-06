import Image from "next/image";
import { site } from "@/lib/site";
import Reveal from "./Reveal";

// ─── Creed ──────────────────────────────────────────────────────────────────
// The one place the site says who is behind it, out loud: portrait + the
// operating principle. Sits on a surface band so it reads as a pause between
// the work above and the story below.
export default function Creed({
    eyebrow,
    line1,
    line2,
    role,
    alt,
}: {
    eyebrow: string;
    line1: string;
    line2: string;
    role: string;
    alt: string;
}) {
    return (
        <section className="band" aria-label={`${line1} ${line2}`}>
            <div className="max-w-5xl mx-auto px-5 md:px-8 py-24 md:py-36">
                <Reveal>
                    <div className="grid gap-10 md:gap-16 md:grid-cols-[248px_1fr] md:items-center">
                        <div className="mx-auto w-[200px] md:mx-0 md:w-[248px]">
                            <div
                                className="card relative aspect-square overflow-hidden"
                                style={{ borderRadius: "var(--radius-card)" }}
                            >
                                <Image
                                    src="/images/profile.jpg"
                                    alt={alt}
                                    fill
                                    sizes="(max-width: 768px) 200px, 248px"
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        <figure className="text-center md:text-left">
                            <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                {eyebrow}
                            </p>
                            <blockquote
                                className="font-display mt-5"
                                style={{
                                    fontSize: "clamp(1.9rem, 5.4vw, 3.6rem)",
                                    lineHeight: 1.04,
                                }}
                            >
                                <span className="block text-[color:var(--ink)]">
                                    {line1}
                                </span>
                                <span className="block text-[color:var(--muted)]">
                                    {line2}
                                </span>
                            </blockquote>
                            <figcaption className="mt-7 font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                                {site.owner}
                                <span className="mx-2 opacity-40">·</span>
                                {role}
                            </figcaption>
                        </figure>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
