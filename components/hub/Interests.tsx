import { interests, stack, type Locale } from "@/lib/hub";
import { SectionHeading } from "./primitives";
import Reveal from "./Reveal";

export default function Interests({
    locale,
    index,
    eyebrow,
    title,
}: {
    locale: Locale;
    index: string;
    eyebrow: string;
    title: string;
}) {
    return (
        <section aria-label={title} className="px-5 md:px-8 py-20 md:py-28">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <SectionHeading index={index} eyebrow={eyebrow} title={title} />
                </Reveal>
                <Reveal>
                    <ul className="border-t rule">
                        {interests.map((item) => (
                            <li
                                key={item.en}
                                className="border-b rule py-4 md:py-5 text-lg md:text-2xl font-display text-[color:var(--ink-2)]"
                            >
                                {item[locale]}
                            </li>
                        ))}
                    </ul>
                </Reveal>
            </div>
        </section>
    );
}

export function StackRow({ title }: { title: string }) {
    return (
        <section aria-label={title} className="px-5 md:px-8 pb-20 md:pb-28">
            <div className="max-w-6xl mx-auto">
                <Reveal>
                    <h2 className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-6">
                        {title}
                    </h2>
                    <p className="font-mono-meta text-[13px] md:text-sm uppercase leading-loose text-[color:var(--ink-2)]">
                        {stack.join("  ·  ")}
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
