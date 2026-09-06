"use client";

// Project inquiry form: "What are you trying to build?" first, budget last & optional.
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

const PROJECT_TYPES = ["new", "mvp", "ai", "internal", "automation", "improve", "unsure"] as const;
const STAGES = ["idea", "exploring", "designed", "prototype", "existing", "production"] as const;
const BUDGETS = ["figuring", "lt5", "5to15", "15to30", "30plus", "discuss"] as const;

export default function ProjectForm() {
    const t = useTranslations("hub.buildWithMe");
    const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (state === "loading") return;
        setState("loading");
        const fd = new FormData(e.currentTarget);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: String(fd.get("name") || ""),
                    email: String(fd.get("email") || ""),
                    company: String(fd.get("company") || ""),
                    message: String(fd.get("message") || ""),
                    projectType: String(fd.get("projectType") || ""),
                    stage: String(fd.get("stage") || ""),
                    budget: String(fd.get("budget") || ""),
                }),
            });
            if (res.ok) {
                setState("done");
                track("contact_submit", {});
            } else {
                setState("error");
            }
        } catch {
            setState("error");
        }
    };

    if (state === "done") {
        return (
            <p className="flex items-start gap-3 border rule rounded-sm p-6 text-lg text-[color:var(--ink-2)] bg-[color:var(--paper-elevated)]">
                <Check size={20} className="mt-1 shrink-0" />
                {t("success")}
            </p>
        );
    }

    const labelCls =
        "font-mono-meta text-[11px] uppercase text-[color:var(--muted)]";
    const inputCls =
        "mt-1.5 w-full border rule rounded-sm bg-transparent px-3.5 py-2.5 text-[15px] text-[color:var(--ink)] outline-none focus:border-[color:var(--ink)] placeholder:text-[color:var(--muted)]";

    return (
        <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="cf-name" className={labelCls}>
                        {t("name")}
                    </label>
                    <input id="cf-name" name="name" type="text" required autoComplete="name" className={inputCls} />
                </div>
                <div>
                    <label htmlFor="cf-email" className={labelCls}>
                        {t("email")}
                    </label>
                    <input id="cf-email" name="email" type="email" required autoComplete="email" className={inputCls} />
                </div>
            </div>

            <div>
                <label htmlFor="cf-company" className={labelCls}>
                    {t("company")}
                </label>
                <input id="cf-company" name="company" type="text" autoComplete="organization" className={inputCls} />
            </div>

            <div>
                <label htmlFor="cf-message" className={labelCls}>
                    {t("messageLabel")}
                </label>
                <textarea
                    id="cf-message"
                    name="message"
                    required
                    rows={5}
                    maxLength={5000}
                    placeholder={t("messagePh")}
                    className={`${inputCls} resize-y`}
                />
            </div>

            <fieldset>
                <legend className={labelCls}>{t("typeLabel")}</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                    {PROJECT_TYPES.map((v) => (
                        <label
                            key={v}
                            className="cursor-pointer font-mono-meta text-[11px] uppercase border rule rounded-full px-3.5 py-2 text-[color:var(--muted)] has-checked:bg-[color:var(--ink)] has-checked:text-[color:var(--paper)] has-checked:border-[color:var(--ink)] transition-colors"
                        >
                            <input type="radio" name="projectType" value={v} className="sr-only" />
                            {t(`types.${v}`)}
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset>
                <legend className={labelCls}>{t("stageLabel")}</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                    {STAGES.map((v) => (
                        <label
                            key={v}
                            className="cursor-pointer font-mono-meta text-[11px] uppercase border rule rounded-full px-3.5 py-2 text-[color:var(--muted)] has-checked:bg-[color:var(--ink)] has-checked:text-[color:var(--paper)] has-checked:border-[color:var(--ink)] transition-colors"
                        >
                            <input type="radio" name="stage" value={v} className="sr-only" />
                            {t(`stages.${v}`)}
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset>
                <legend className={labelCls}>
                    {t("budgetLabel")}{" "}
                    <span className="normal-case">({t("optional")})</span>
                </legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                    {BUDGETS.map((v) => (
                        <label
                            key={v}
                            className="cursor-pointer font-mono-meta text-[11px] uppercase border rule rounded-full px-3.5 py-2 text-[color:var(--muted)] has-checked:bg-[color:var(--ink)] has-checked:text-[color:var(--paper)] has-checked:border-[color:var(--ink)] transition-colors"
                        >
                            <input type="radio" name="budget" value={v} className="sr-only" />
                            {t(`budgets.${v}`)}
                        </label>
                    ))}
                </div>
            </fieldset>

            {state === "error" && (
                <p role="alert" className="text-sm text-red-600">
                    {t("error")}
                </p>
            )}

            <button
                type="submit"
                disabled={state === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] px-7 py-3.5 text-sm font-medium hover:opacity-85 transition-opacity disabled:opacity-60 sm:self-start sm:min-w-56"
            >
                {state === "loading" && <Loader2 size={15} className="animate-spin" />}
                {t("send")}
                {state !== "loading" && <ArrowRight size={15} className="arrow-shift" />}
            </button>
        </form>
    );
}
