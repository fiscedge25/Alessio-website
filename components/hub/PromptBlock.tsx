"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, Download, Lock } from "lucide-react";
import { track } from "@/lib/analytics";

// ─── Prompt block ────────────────────────────────────────────────────────────
// The prompt in a terminal panel. The first `freeLines` are readable; the rest
// sits behind an email gate that subscribes through /api/subscribe with the
// prompt as `source`. Once unlocked, the choice is remembered per prompt.
//
// The gate is a courtesy, not a lock: the full text is in the page. That is
// deliberate — search engines and people with blocked scripts still get it.

export type PromptBlockLabels = {
    unlockTitle: string;
    unlockBody: string;
    emailPlaceholder: string;
    unlockCta: string;
    unlocking: string;
    invalid: string;
    error: string;
    copy: string;
    copied: string;
    download: string;
    lines: string;
    privacy: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function storageKey(slug: string) {
    return `prompt-unlocked:${slug}`;
}

function readUnlocked(slug: string) {
    try {
        return localStorage.getItem(storageKey(slug)) === "1";
    } catch {
        return false; // storage blocked: the gate simply shows again
    }
}

const noop = () => () => {};

export default function PromptBlock({
    slug,
    text,
    freeLines,
    locale,
    labels,
}: {
    slug: string;
    text: string;
    freeLines: number;
    locale: "en" | "it";
    labels: PromptBlockLabels;
}) {
    const lines = text.replace(/\n$/, "").split("\n");
    // Unlocked on an earlier visit (localStorage), or just now in this one.
    const stored = useSyncExternalStore(noop, () => readUnlocked(slug), () => false);
    const [justUnlocked, setJustUnlocked] = useState(false);
    const unlocked = stored || justUnlocked || freeLines >= lines.length;
    const [email, setEmail] = useState("");
    const [state, setState] = useState<"idle" | "loading" | "invalid" | "error">("idle");
    const [copied, setCopied] = useState(false);

    const unlock = () => {
        setJustUnlocked(true);
        try {
            localStorage.setItem(storageKey(slug), "1");
        } catch {
            /* fine */
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = email.trim();
        if (!EMAIL_RE.test(value)) {
            setState("invalid");
            return;
        }
        setState("loading");
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: value, lang: locale, source: `prompt:${slug}` }),
            });
            // 503 = newsletter not configured. Never lock people out of the
            // prompt over our own setup: losing a lead beats losing a visitor.
            if (res.ok || res.status === 503) {
                track("prompt_unlock", { slug });
                unlock();
                setState("idle");
            } else if (res.status === 400) {
                setState("invalid");
            } else {
                setState("error");
            }
        } catch {
            setState("error");
        }
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Older browsers / insecure contexts: fall back to a hidden textarea.
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
        }
        track("prompt_copy", { slug });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const download = () => {
        const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slug}-prompt.md`;
        a.click();
        URL.revokeObjectURL(url);
        track("prompt_download", { slug });
    };

    return (
        <div
            className="overflow-hidden rounded-xl border"
            style={{ background: "#0d1117", borderColor: "#21262d" }}
        >
            {/* Title bar */}
            <div
                className="flex items-center gap-2 px-4 h-10 border-b"
                style={{ background: "#161b22", borderColor: "#21262d" }}
            >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} aria-hidden="true" />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} aria-hidden="true" />
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} aria-hidden="true" />
                <span className="ml-2 font-mono text-[11px]" style={{ color: "#6e7681" }}>
                    {slug}.md · {lines.length} {labels.lines}
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                    {unlocked && (
                        <>
                            <button
                                type="button"
                                onClick={download}
                                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors hover:bg-white/10"
                                style={{ color: "#c9d1d9" }}
                                aria-label={labels.download}
                            >
                                <Download size={13} />
                                <span className="hidden sm:inline">{labels.download}</span>
                            </button>
                            <button
                                type="button"
                                onClick={copy}
                                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-mono text-[11px] font-semibold transition-colors"
                                style={{
                                    background: copied ? "#238636" : "#6366f1",
                                    color: "#ffffff",
                                }}
                            >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? labels.copied : labels.copy}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="relative">
                <pre
                    className="overflow-x-auto py-4 text-[12.5px] leading-[1.65] font-mono"
                    style={{ color: "#c9d1d9" }}
                >
                    <code>
                        {lines.map((line, i) => {
                            const hidden = !unlocked && i >= freeLines;
                            return (
                                <div
                                    key={i}
                                    className="flex"
                                    style={
                                        hidden
                                            ? { filter: "blur(4px)", opacity: 0.55, userSelect: "none" }
                                            : undefined
                                    }
                                >
                                    <span
                                        className="select-none shrink-0 w-12 pr-4 text-right"
                                        style={{ color: "#484f58" }}
                                    >
                                        {i + 1}
                                    </span>
                                    <span className="pr-6 whitespace-pre">
                                        {line.startsWith("## ") ? (
                                            <span style={{ color: "#a5b4fc", fontWeight: 600 }}>{line}</span>
                                        ) : (
                                            line || " "
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </code>
                </pre>

                {/* Gate */}
                {!unlocked && (
                    <div
                        className="absolute inset-x-0 bottom-0 flex items-end justify-center px-4 pb-8"
                        style={{
                            top: `calc(${freeLines} * 1.65 * 12.5px + 1rem)`,
                            background:
                                "linear-gradient(to bottom, rgba(13,17,23,0) 0%, rgba(13,17,23,0.92) 18%, #0d1117 40%)",
                        }}
                    >
                        <form
                            onSubmit={submit}
                            className="w-full max-w-md rounded-xl border p-5 md:p-6 text-center"
                            style={{ background: "#161b22", borderColor: "#30363d" }}
                        >
                            <span
                                className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full"
                                style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}
                                aria-hidden="true"
                            >
                                <Lock size={16} />
                            </span>
                            <p className="font-semibold text-[15px]" style={{ color: "#f0f6fc" }}>
                                {labels.unlockTitle}
                            </p>
                            <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "#8b949e" }}>
                                {labels.unlockBody}
                            </p>
                            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                <label htmlFor={`email-${slug}`} className="sr-only">
                                    {labels.emailPlaceholder}
                                </label>
                                <input
                                    id={`email-${slug}`}
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (state !== "loading") setState("idle");
                                    }}
                                    placeholder={labels.emailPlaceholder}
                                    className="flex-1 rounded-lg border px-3.5 py-2.5 text-[14px] outline-none focus:ring-2"
                                    style={{
                                        background: "#0d1117",
                                        borderColor: state === "invalid" ? "#f85149" : "#30363d",
                                        color: "#f0f6fc",
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={state === "loading"}
                                    className="rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-opacity disabled:opacity-60"
                                    style={{ background: "#6366f1", color: "#ffffff" }}
                                >
                                    {state === "loading" ? labels.unlocking : labels.unlockCta}
                                </button>
                            </div>
                            <p
                                className="mt-2.5 text-[12px] min-h-[1.25rem]"
                                style={{ color: state === "invalid" || state === "error" ? "#f85149" : "#6e7681" }}
                                aria-live="polite"
                            >
                                {state === "invalid"
                                    ? labels.invalid
                                    : state === "error"
                                      ? labels.error
                                      : labels.privacy}
                            </p>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
