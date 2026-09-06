"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type State = "idle" | "loading" | "success" | "error";

export default function Newsletter() {
    const t = useTranslations("newsletter");
    const locale = useLocale();
    const [email, setEmail] = useState("");
    const [state, setState] = useState<State>("idle");
    const [message, setMessage] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (state === "loading") return;
        setState("loading");
        setMessage("");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, lang: locale }),
            });
            const data = await res.json();

            if (res.ok) {
                setState("success");
                setMessage(
                    data.status === "already" ? t("already") : t("success")
                );
                setEmail("");
            } else if (data.error === "invalid_email") {
                setState("error");
                setMessage(t("invalid"));
            } else if (data.error === "not_configured") {
                setState("error");
                setMessage(t("soon"));
            } else {
                setState("error");
                setMessage(t("error"));
            }
        } catch {
            setState("error");
            setMessage(t("error"));
        }
    };

    const success = state === "success";

    return (
        <div className="w-full max-w-md">
            <form
                onSubmit={submit}
                className="relative flex items-center rounded-full p-1.5 transition-all duration-300"
                style={{
                    backgroundColor: "var(--paper-elevated)",
                    border: "1px solid var(--line)",
                }}
                onFocusCapture={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-hover)")
                }
                onBlurCapture={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                }
            >
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (state !== "idle") setState("idle");
                    }}
                    disabled={state === "loading" || success}
                    placeholder={t("placeholder")}
                    aria-label={t("placeholder")}
                    className="flex-1 bg-transparent outline-none px-5 py-2.5 text-sm disabled:opacity-60"
                    style={{
                        fontFamily: "var(--font-dm)",
                        color: "var(--text-primary)",
                    }}
                />
                <button
                    type="submit"
                    disabled={state === "loading" || success}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm tracking-wider uppercase font-medium transition-all duration-300 hover:scale-[1.03] disabled:opacity-80 shrink-0"
                    style={{
                        fontFamily: "var(--font-sans)",
                        background: "var(--ink)",
                        color: "var(--paper)",
                    }}
                >
                    {state === "loading" ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : success ? (
                        <Check size={16} />
                    ) : (
                        <>
                            <span className="hidden sm:inline">{t("cta")}</span>
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            {/* Status / helper line */}
            <p
                className="mt-3 text-xs px-2 min-h-[1rem]"
                style={{
                    fontFamily: "var(--font-dm)",
                    color: state === "error" ? "#ef4444" : "var(--text-muted)",
                }}
            >
                {message || t("hint")}
            </p>
        </div>
    );
}
