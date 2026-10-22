"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { track } from "@/lib/analytics";

export default function GiftShare({ url }: { url: string }) {
    const t = useTranslations("hub.gift");
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            track("gift_share", { via: "copy" });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard blocked — the link is still visible to copy by hand */
        }
    }

    const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${t("shareText")} ${url}`)}`;

    return (
        <div className="space-y-4">
            <div className="field font-mono text-sm break-all select-all">{url}</div>
            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={copy} className="btn btn-primary">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? t("copied") : t("copy")}
                </button>
                <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("gift_share", { via: "whatsapp" })}
                    className="btn btn-secondary"
                >
                    {t("whatsapp")}
                </a>
                <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    {t("openGift")} <ArrowUpRight size={16} />
                </a>
            </div>
        </div>
    );
}
