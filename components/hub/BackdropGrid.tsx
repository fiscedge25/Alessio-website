"use client";

// ─── Backdrop grid ──────────────────────────────────────────────────────────
// A fixed engineering grid behind the whole page, revealed only by a soft
// spotlight that follows the pointer. Nothing is visible where the pointer
// isn't, so the page still reads as plain white/black — the texture is a
// reward for moving, not wallpaper.
//
// Cost control: one passive listener, one rAF per frame, and we write CSS
// custom properties instead of re-rendering React.
import { useEffect, useRef } from "react";

export default function BackdropGrid() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respect the user's motion preference: leave the static centred
        // reveal from CSS in place and never attach the listener.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        // Coarse pointers (touch) have no hover position to track — the slow
        // CSS drift alone carries the movement there.
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        let frame = 0;
        let x = window.innerWidth / 2;
        let y = window.innerHeight * 0.3;

        const paint = () => {
            frame = 0;
            el.style.setProperty("--mx", `${x}px`);
            el.style.setProperty("--my", `${y}px`);
        };

        const onMove = (e: PointerEvent) => {
            x = e.clientX;
            y = e.clientY;
            if (!frame) frame = requestAnimationFrame(paint);
        };

        el.style.setProperty("--reveal", "1");
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
            window.removeEventListener("pointermove", onMove);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return <div ref={ref} className="backdrop-grid" aria-hidden="true" />;
}
