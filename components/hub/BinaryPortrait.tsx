"use client";

import { useEffect, useRef } from "react";
import { PORTRAIT } from "@/lib/portrait-data";

// ─── Binary portrait ─────────────────────────────────────────────────────────
// The face as 0s and 1s on a canvas. Cells start as random bits and settle
// into the portrait top to bottom; afterwards a few bits keep flickering,
// and bits near the pointer scramble. Brightness drives opacity, and bright
// cells lean towards "1", so the face reads even at small sizes.
//
// Always drawn on its own dark terminal panel: light glyphs need a dark
// ground, and the panel keeps it identical in the site's light and dark
// themes — the same reasoning as the GitHub profile art it comes from.

const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";
const CELL_ASPECT = 0.62; // glyph width / line height — matches the data script
const ONE = "165, 180, 252"; // indigo-300: the 1s
const ZERO = "201, 209, 217"; // GitHub dark foreground: the 0s
const REVEAL_MS = 1700;
const SCRAMBLE_RADIUS = 5; // in cells

// Deterministic per-cell noise, so the settled face is identical every load.
function hash(i: number) {
    let x = (i + 1) * 374761393;
    x = (x ^ (x >>> 13)) * 1274126177;
    return ((x ^ (x >>> 16)) >>> 0) / 4294967295;
}

type Cell = { i: number; col: number; row: number; level: number; bit: string; delay: number };

export default function BinaryPortrait({
    title = "sabba@builtwithsabba: ~/whoami",
    className = "",
}: {
    title?: string;
    className?: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrap = wrapRef.current;
        if (!canvas || !wrap) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { cols, rows, data } = PORTRAIT;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Only cells with ink are ever drawn; the background costs nothing.
        const cells: Cell[] = [];
        for (let i = 0; i < data.length; i++) {
            const level = data.charCodeAt(i) - 48;
            if (level < 2) continue;
            const row = Math.floor(i / cols);
            cells.push({
                i,
                col: i % cols,
                row,
                level,
                bit: hash(i) < level / 10 ? "1" : "0",
                // top-to-bottom sweep, loosened with noise so it shimmers in
                delay: (row / rows) * REVEAL_MS * 0.7 + hash(i * 7) * REVEAL_MS * 0.3,
            });
        }

        let cw = 0;
        let lh = 0;
        const pointer = { x: -1e4, y: -1e4 };
        const flicker = new Map<number, number>(); // cell index -> expiry time
        let start = performance.now();
        let raf = 0;
        let visible = true;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = canvas.clientWidth;
            if (!w) return;
            cw = w / cols;
            lh = cw / CELL_ASPECT;
            const h = lh * rows;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            // Height only. Width stays 100% from CSS: writing a pixel width
            // back would let the canvas widen its own grid column, which the
            // ResizeObserver then measures as wider, forever.
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = `600 ${Math.max(7, cw * 1.45)}px ${MONO}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
        };

        const draw = (now: number) => {
            const t = reduced ? Infinity : now - start;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Idle life: a handful of bright cells briefly flip.
            if (!reduced && t > REVEAL_MS && Math.random() < 0.35) {
                const c = cells[Math.floor(Math.random() * cells.length)];
                if (c.level > 4) flicker.set(c.i, now + 140 + Math.random() * 220);
            }

            for (const c of cells) {
                const x = (c.col + 0.5) * cw;
                const y = (c.row + 0.5) * lh;
                const dx = (x - pointer.x) / cw;
                const dy = (y - pointer.y) / lh;
                const near = dx * dx + dy * dy < SCRAMBLE_RADIUS * SCRAMBLE_RADIUS;

                let bit = c.bit;
                // Gamma < 1 lifts the midtones, where most of the face lives;
                // a linear ramp leaves it reading as a faint ghost.
                let alpha = 0.22 + 0.78 * Math.pow(c.level / 9, 0.6);

                if (t < c.delay) {
                    // not decoded yet: faint random bits
                    bit = Math.random() < 0.5 ? "1" : "0";
                    alpha *= 0.28;
                } else if (near) {
                    bit = Math.random() < 0.5 ? "1" : "0";
                    alpha = Math.min(1, alpha + 0.35);
                } else {
                    const until = flicker.get(c.i);
                    if (until !== undefined) {
                        if (until > now) bit = c.bit === "1" ? "0" : "1";
                        else flicker.delete(c.i);
                    }
                }

                ctx.fillStyle = `rgba(${bit === "1" ? ONE : ZERO}, ${alpha})`;
                ctx.fillText(bit, x, y);
            }

            if (visible && !reduced) raf = requestAnimationFrame(draw);
        };

        resize();
        raf = requestAnimationFrame(draw);

        const ro = new ResizeObserver(() => {
            resize();
            if (reduced) draw(performance.now());
        });
        ro.observe(wrap);

        // Stop drawing entirely while off screen.
        const io = new IntersectionObserver(([entry]) => {
            const was = visible;
            visible = entry.isIntersecting;
            if (visible && !was && !reduced) raf = requestAnimationFrame(draw);
        });
        io.observe(canvas);

        const onMove = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect();
            pointer.x = e.clientX - r.left;
            pointer.y = e.clientY - r.top;
        };
        const onLeave = () => {
            pointer.x = pointer.y = -1e4;
        };
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerleave", onLeave);

        // Replay the decode when the tab comes back after a long absence.
        const onVis = () => {
            if (document.visibilityState === "visible" && performance.now() - start > 60_000) {
                start = performance.now();
            }
        };
        document.addEventListener("visibilitychange", onVis);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerleave", onLeave);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, []);

    return (
        <figure
            className={`min-w-0 overflow-hidden rounded-xl border ${className}`}
            style={{ background: "#0d1117", borderColor: "#21262d" }}
        >
            <div
                className="flex items-center gap-2 px-4 h-8 border-b"
                style={{ background: "#161b22", borderColor: "#21262d" }}
                aria-hidden="true"
            >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
                <span className="flex-1 text-center font-mono text-[11px]" style={{ color: "#6e7681" }}>
                    {title}
                </span>
                <span className="w-[46px]" />
            </div>
            <div ref={wrapRef} className="px-4 py-5 md:px-6 md:py-6">
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label="Portrait of Alessio Sabatino drawn in zeros and ones"
                    className="block w-full cursor-crosshair"
                />
            </div>
        </figure>
    );
}
