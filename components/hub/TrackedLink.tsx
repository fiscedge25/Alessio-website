"use client";

// Anchor wrapper that fires a lightweight analytics event on external clicks.
import type { ReactNode } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

export default function TrackedLink({
    href,
    event,
    detail,
    className,
    children,
}: {
    href: string;
    event: AnalyticsEvent;
    detail?: Record<string, string>;
    className?: string;
    children: ReactNode;
}) {
    const onClick = () => track(event, { href, ...detail });
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
            {children}
        </a>
    );
}
