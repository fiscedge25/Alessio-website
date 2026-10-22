"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { track } from "@/lib/analytics";
import { BUNDLE, BUNDLE_FULL_PRICE, bundleValuesFor, gifts } from "@/lib/gifts";

/**
 * Form for the all-in-one dedication. One set of fields, previewed on any of
 * the animations through tabs — each tab shows what that animation will make
 * of the same words.
 */
export default function BundleBuilder() {
    const t = useTranslations("hub.gift");
    const locale = useLocale() === "it" ? "it" : "en";

    const [values, setValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(BUNDLE.fields.map((f) => [f.param, ""])),
    );
    const [active, setActive] = useState(gifts[0].slug);
    const [previewSrc, setPreviewSrc] = useState(`/api/gift/preview/${gifts[0].slug}`);
    const [state, setState] = useState<"idle" | "loading" | "missing" | "error">("idle");

    useEffect(() => {
        const id = setTimeout(() => {
            const gift = gifts.find((g) => g.slug === active) ?? gifts[0];
            const mapped = bundleValuesFor(
                gift,
                Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim())),
            );
            const qs = new URLSearchParams(mapped);
            setPreviewSrc(`/api/gift/preview/${gift.slug}${qs.size ? `?${qs}` : ""}`);
        }, 600);
        return () => clearTimeout(id);
    }, [values, active]);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((v) => ({ ...v, [key]: e.target.value }));

    async function buy(e: React.FormEvent) {
        e.preventDefault();
        if (BUNDLE.fields.some((f) => f.required && !values[f.param]?.trim())) {
            setState("missing");
            return;
        }
        setState("loading");
        track("gift_checkout", { slug: BUNDLE.slug });
        try {
            const res = await fetch("/api/gift/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: BUNDLE.slug, lang: locale, ...values }),
            });
            const data = await res.json();
            if (!res.ok || !data.url) throw new Error(data.error || "error");
            window.location.href = data.url;
        } catch {
            setState("error");
        }
    }

    const label = "font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-2 block";

    return (
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
            {/* Preview with a tab per animation */}
            <div className="lg:sticky lg:top-24 min-w-0">
                <p className={label}>{t("previewLabel")}</p>
                <div className="mb-3 flex flex-wrap gap-1.5" role="tablist">
                    {gifts.map((g) => (
                        <button
                            key={g.slug}
                            type="button"
                            role="tab"
                            aria-selected={active === g.slug}
                            onClick={() => setActive(g.slug)}
                            className="tag shrink-0 transition-colors"
                            style={
                                active === g.slug
                                    ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" }
                                    : undefined
                            }
                        >
                            {g.title[locale]}
                        </button>
                    ))}
                </div>
                <div
                    className="relative overflow-hidden rounded-xl border rule mx-auto"
                    style={{ aspectRatio: "9 / 16", maxHeight: "74vh", background: "#0B0B0F" }}
                >
                    <iframe
                        key={previewSrc}
                        src={previewSrc}
                        title={t("previewLabel")}
                        className="absolute inset-0 h-full w-full"
                        allow="autoplay"
                    />
                </div>
                <p className="mt-3 text-sm text-[color:var(--muted)] text-center">{t("bundlePreviewNote")}</p>
            </div>

            {/* Form */}
            <form onSubmit={buy} className="space-y-5">
                <h2 className="font-display text-2xl md:text-3xl text-[color:var(--ink)]">{t("formTitle")}</h2>

                {BUNDLE.fields.map((f) => {
                    const id = `b-${f.param}`;
                    const common = {
                        id,
                        className: "field",
                        value: values[f.param],
                        onChange: set(f.param),
                        maxLength: f.max,
                        placeholder: f.placeholder?.[locale],
                        required: f.required,
                    };
                    return (
                        <div key={f.param}>
                            <label htmlFor={id} className={label}>
                                {f.label[locale]}
                            </label>
                            {f.lines ? <textarea {...common} rows={f.lines} /> : <input {...common} autoComplete="off" />}
                            {f.hint && <p className="mt-1.5 text-xs text-[color:var(--muted)]">{f.hint[locale]}</p>}
                        </div>
                    );
                })}

                <div className="pt-2">
                    <button type="submit" className="btn btn-primary w-full" disabled={state === "loading"}>
                        {state === "loading" ? t("buying") : t("bundleBuy", { price: BUNDLE.price })}
                        {state !== "loading" && <ArrowUpRight size={16} />}
                    </button>
                    <p className="mt-3 text-center font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                        {t("bundleIncludes", { count: gifts.length, full: BUNDLE_FULL_PRICE })}
                    </p>
                    {state === "missing" && <p className="mt-3 text-sm text-center text-red-500">{t("missing")}</p>}
                    {state === "error" && <p className="mt-3 text-sm text-center text-red-500">{t("error")}</p>}
                </div>
            </form>
        </div>
    );
}
