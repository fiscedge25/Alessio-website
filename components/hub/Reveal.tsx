"use client";

// Reveal-on-scroll wrapper: subtle, plays once, respects reduced motion via CSS.
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function Reveal({
    children,
    className = "",
    as: Tag = "div",
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    as?: "div" | "section" | "article" | "li" | "span";
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    // Static deps on purpose: the observer callback (not the effect body)
    // flips state, and reduced motion is handled purely in CSS
    // (.reveal is forced visible under prefers-reduced-motion).
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        setVisible(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <Tag
            // @ts-expect-error polymorphic ref is fine for these tags
            ref={ref}
            className={`reveal ${visible ? "is-visible" : ""} ${className}`}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </Tag>
    );
}
