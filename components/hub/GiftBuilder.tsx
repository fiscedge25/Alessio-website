"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { track } from "@/lib/analytics";
import type { GiftEntry } from "@/lib/gifts";

export default function GiftBuilder({ gift }: { gift: GiftEntry }) {
    const t = useTranslations("hub.gift");
    const locale = useLocale() === "it" ? "it" : "en";

    // Keyed by the animation's own query params, plus the style param if any.
    const [values, setValues] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        for (const f of gift.fields) init[f.param] = "";
        if (gift.styleParam && gift.styles?.length) init[gift.styleParam] = gift.styles[0].id;
        return init;
    });
    const [previewSrc, setPreviewSrc] = useState(`/api/gift/preview/${gift.slug}`);
    const [state, setState] = useState<"idle" | "loading" | "missing" | "error">("idle");

    // Reload the preview once typing pauses — each reload replays the animation.
    useEffect(() => {
        const id = setTimeout(() => {
            const qs = new URLSearchParams(Object.entries(values).filter(([, v]) => v.trim()));
            setPreviewSrc(`/api/gift/preview/${gift.slug}${qs.size ? `?${qs}` : ""}`);
        }, 700);
        return () => clearTimeout(id);
    }, [values, gift.slug]);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setValues((v) => ({ ...v, [key]: e.target.value }));

    async function buy(e: React.FormEvent) {
        e.preventDefault();
        if (gift.fields.some((f) => f.required && !values[f.param]?.trim())) {
            setState("missing");
            return;
        }
        setState("loading");
        track("gift_checkout", { slug: gift.slug });
        try {
            const res = await fetch("/api/gift/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: gift.slug, lang: locale, ...values }),
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
            {/* Preview */}
            <div className="lg:sticky lg:top-24">
                <p className={label}>{t("previewLabel")}</p>
                <div
                    className="relative overflow-hidden rounded-xl border rule mx-auto"
                    style={{ aspectRatio: "9 / 16", maxHeight: "78vh", background: "#0B0B0F" }}
                >
                    <iframe
                        key={previewSrc}
                        src={previewSrc}
                        title={t("previewLabel")}
                        className="absolute inset-0 h-full w-full"
                        allow="autoplay"
                    />
                </div>
                <p className="mt-3 text-sm text-[color:var(--muted)] text-center">{t("previewNote")}</p>
            </div>

            {/* Form */}
            <form onSubmit={buy} className="space-y-5">
                <h2 className="font-display text-2xl md:text-3xl text-[color:var(--ink)]">{t("formTitle")}</h2>

                {gift.fields.map((f) => {
                    const id = `g-${f.param}`;
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
                            {f.lines ? (
                                <textarea {...common} rows={f.lines} />
                            ) : (
                                <input {...common} autoComplete="off" />
                            )}
                            {f.hint && <p className="mt-1.5 text-xs text-[color:var(--muted)]">{f.hint[locale]}</p>}
                        </div>
                    );
                })}

                {gift.styleParam && gift.styles && gift.styles.length > 1 && (
                    <div>
                        <label htmlFor="g-style" className={label}>
                            {t("style")}
                        </label>
                        <select id="g-style" className="field" value={values[gift.styleParam]} onChange={set(gift.styleParam)}>
                            {gift.styles.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.label[locale]}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="pt-2">
                    <button type="submit" className="btn btn-primary w-full" disabled={state === "loading"}>
                        {state === "loading" ? t("buying") : t("buy", { price: gift.price })}
                        {state !== "loading" && <ArrowUpRight size={16} />}
                    </button>
                    <p className="mt-3 text-center font-mono-meta text-[11px] uppercase text-[color:var(--muted)]">
                        {t("includes")}
                    </p>
                    {state === "missing" && <p className="mt-3 text-sm text-center text-red-500">{t("missing")}</p>}
                    {state === "error" && <p className="mt-3 text-sm text-center text-red-500">{t("error")}</p>}
                </div>
            </form>
        </div>
    );
}
