"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { track } from "@/lib/analytics";

// ─── Share bar ───────────────────────────────────────────────────────────────
// Native share sheet first — on a phone that is where Instagram, WhatsApp
// and Telegram live — then direct links for desktop, then copy-link.

export type ShareLabels = {
    title: string;
    native: string;
    copyLink: string;
    copied: string;
};

const noop = () => () => {};

export default function ShareBar({
    url,
    text,
    slug,
    labels,
}: {
    url: string;
    text: string;
    slug: string;
    labels: ShareLabels;
}) {
    // Browser capability, read without an effect: false on the server, real
    // value on the client, and no hydration mismatch.
    const canNative = useSyncExternalStore(
        noop,
        () => typeof navigator.share === "function",
        () => false,
    );
    const [copied, setCopied] = useState(false);

    const u = encodeURIComponent(url);
    const t = encodeURIComponent(text);
    const targets = [
        { name: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
        { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
        { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
        { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}` },
    ];

    const native = async () => {
        try {
            await navigator.share({ title: text, text, url });
            track("prompt_share", { slug, via: "native" });
        } catch {
            /* user dismissed the sheet */
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            track("prompt_share", { slug, via: "copy" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard blocked */
        }
    };

    const chip =
        "inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] px-4 py-2 font-mono-meta text-[12px] uppercase text-[color:var(--ink)] transition-colors hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] hover:border-[color:var(--ink)]";

    return (
        <div>
            <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-3">
                {labels.title}
            </p>
            <div className="flex flex-wrap gap-2">
                {canNative && (
                    <button type="button" onClick={native} className={chip}>
                        <Share2 size={13} />
                        {labels.native}
                    </button>
                )}
                {targets.map((s) => (
                    <a
                        key={s.name}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track("prompt_share", { slug, via: s.name.toLowerCase() })}
                        className={chip}
                    >
                        {s.name}
                    </a>
                ))}
                <button type="button" onClick={copyLink} className={chip}>
                    {copied ? <Check size={13} /> : <Link2 size={13} />}
                    {copied ? labels.copied : labels.copyLink}
                </button>
            </div>
        </div>
    );
}
