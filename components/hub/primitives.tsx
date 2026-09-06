// ─── Shared hub primitives ─────────────────────────────────────────────────
import type { ProjectStatus } from "@/lib/hub";

export const STATUS_STYLE: Record<ProjectStatus, string> = {
    LIVE: "LIVE",
    BUILDING: "BUILDING",
    EXPERIMENT: "EXPERIMENT",
    ARCHIVED: "ARCHIVED",
};

// Tone maps to the badge variants in globals.css. Only LIVE and BUILDING
// carry colour — everything else stays monochrome on purpose.
const BADGE_TONE: Record<ProjectStatus, string> = {
    LIVE: "badge-live",
    BUILDING: "badge-building",
    EXPERIMENT: "",
    ARCHIVED: "",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
    const pulsing = status === "BUILDING" || status === "LIVE";
    return (
        <span className={`badge ${BADGE_TONE[status]}`}>
            <span
                className={
                    pulsing
                        ? "status-dot"
                        : "inline-block h-1.5 w-1.5 rounded-full border border-current opacity-60"
                }
                aria-hidden="true"
            />
            {STATUS_STYLE[status]}
        </span>
    );
}

/** Tech stack as chips instead of a "·"-joined string. */
export function TechTags({ items }: { items: string[] }) {
    return (
        <ul className="flex flex-wrap gap-1.5">
            {items.map((t) => (
                <li key={t} className="tag">
                    {t}
                </li>
            ))}
        </ul>
    );
}

export function SectionHeading({
    index,
    eyebrow,
    title,
    intro,
}: {
    index: string;
    eyebrow: string;
    title: string;
    intro?: string;
}) {
    return (
        <div className="mb-10 md:mb-14">
            <span className="accent-bar mb-5" aria-hidden="true" />
            <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-4">
                <span className="index-num">{index}</span>
                <span className="mx-2 opacity-40">—</span>
                {eyebrow}
            </p>
            <h2
                className="font-display text-[color:var(--ink)]"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05 }}
            >
                {title}
            </h2>
            {intro && (
                <p className="mt-4 max-w-xl text-base md:text-lg leading-relaxed text-[color:var(--muted)]">
                    {intro}
                </p>
            )}
        </div>
    );
}
