import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BUNDLE, BUNDLE_FULL_PRICE, gifts, type GiftEntry } from "@/lib/gifts";

const EMOJI: Record<string, string> = {
    flowers: "🌹",
    garden: "🌸",
    bloom: "🌷",
    heart: "❤️",
    space: "🚀",
    love: "💌",
    moon: "🌙",
};

interface Labels {
    eyebrow: string;
    title: string;
    body: string;
    instead: string;
    cta: string;
}

/**
 * The all-in-one offer. Always dark, whatever the site theme — it sits among
 * the animations' own night palettes and reads as the "premium" option.
 */
export default function BundleCard({ locale, labels }: { locale: "en" | "it"; labels: Labels }) {
    return (
        <Link
            href={`/${locale}/gift/${BUNDLE.slug}`}
            className="group relative block overflow-hidden rounded-[28px] p-7 md:p-10 transition-transform duration-500 hover:-translate-y-1"
            style={{
                background:
                    "radial-gradient(120% 90% at 0% 0%, rgba(232,148,172,.32), transparent 55%)," +
                    "radial-gradient(90% 80% at 100% 100%, rgba(99,102,241,.38), transparent 60%)," +
                    "radial-gradient(60% 60% at 80% 10%, rgba(245,201,155,.22), transparent 70%), #0B0B0F",
                color: "#FDF6F0",
                boxShadow: "0 30px 80px -30px rgba(99,102,241,.45), inset 0 0 0 1px rgba(255,255,255,.08)",
            }}
        >
            {/* faint starfield */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                    backgroundImage:
                        "radial-gradient(1px 1px at 12% 22%, #fff, transparent)," +
                        "radial-gradient(1px 1px at 72% 18%, #fff, transparent)," +
                        "radial-gradient(1.5px 1.5px at 88% 62%, #fff, transparent)," +
                        "radial-gradient(1px 1px at 34% 78%, #fff, transparent)," +
                        "radial-gradient(1px 1px at 56% 44%, rgba(255,255,255,.7), transparent)," +
                        "radial-gradient(1px 1px at 6% 64%, rgba(255,255,255,.6), transparent)",
                }}
            />

            <div className="relative grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
                <div>
                    <p className="font-mono-meta text-[11px] uppercase tracking-[0.18em]" style={{ color: "#F5C99B" }}>
                        ✦ {labels.eyebrow}
                    </p>
                    <h2
                        className="mt-4 font-display uppercase"
                        style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 0.98 }}
                    >
                        {labels.title}
                    </h2>
                    <p className="mt-4 max-w-md leading-relaxed" style={{ color: "rgba(253,246,240,.72)" }}>
                        {labels.body}
                    </p>

                    <ul className="mt-6 flex flex-wrap gap-2">
                        {gifts.map((g: GiftEntry) => (
                            <li
                                key={g.slug}
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px]"
                                style={{
                                    background: "rgba(255,255,255,.07)",
                                    border: "1px solid rgba(255,255,255,.12)",
                                    backdropFilter: "blur(6px)",
                                }}
                            >
                                <span aria-hidden="true">{EMOJI[g.slug] ?? "✨"}</span>
                                {g.title[locale]}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="md:text-right">
                    <p className="font-mono-meta text-[12px] uppercase" style={{ color: "rgba(253,246,240,.55)" }}>
                        {labels.instead} <span className="line-through">{BUNDLE_FULL_PRICE}</span>
                    </p>
                    <p className="font-display mt-1" style={{ fontSize: "clamp(3rem, 8vw, 4.75rem)", lineHeight: 1 }}>
                        {BUNDLE.price}
                    </p>
                    <span
                        className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium transition-colors"
                        style={{ background: "#FDF6F0", color: "#0B0B0F" }}
                    >
                        {labels.cta}
                        <ArrowUpRight size={16} className="arrow-shift" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
