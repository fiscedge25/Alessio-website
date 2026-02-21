"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { identity } from "@/lib/data";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Check, Loader2, Mail, Linkedin, Globe } from "lucide-react";

export default function Contact() {
    const t = useTranslations("contact");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const contactSchema = z.object({
        name: z.string().min(2, t("validation_name")),
        email: z.string().email(t("validation_email")),
        message: z.string().min(10, t("validation_message")),
    });

    type ContactData = z.infer<typeof contactSchema>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactData>({ resolver: zodResolver(contactSchema) });

    const onSubmit = async (data: ContactData) => {
        setStatus("loading");
        try {
            const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setStatus("success");
                reset();
                setTimeout(() => setStatus("idle"), 4000);
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    const inputStyle: React.CSSProperties = {
        fontFamily: "var(--font-dm)",
        backgroundColor: "transparent",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
        transition: "border-color 0.3s ease",
    };

    return (
        <section id="contact" className="relative z-10 py-28 px-6">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <p
                        className="text-sm tracking-[0.3em] uppercase mb-3"
                        style={{ fontFamily: "var(--font-dm)", color: "var(--accent)" }}
                    >
                        {t("label")}
                    </p>
                    <h2
                        className="mb-4"
                        style={{
                            fontFamily: "var(--font-cormorant)",
                            color: "var(--text-heading)",
                            fontWeight: 500,
                            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.1,
                        }}
                    >
                        {t("title")}
                    </h2>
                    <p
                        className="text-base max-w-lg mx-auto"
                        style={{
                            fontFamily: "var(--font-dm)",
                            color: "var(--text-secondary)",
                            fontWeight: 300,
                        }}
                    >
                        {t("subtitle")}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <motion.form
                        onSubmit={handleSubmit(onSubmit)}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-5"
                    >
                        <div>
                            <input
                                {...register("name")}
                                placeholder={t("name_placeholder")}
                                className="w-full px-5 py-3.5 rounded-xl text-sm outline-none focus:ring-1"
                                style={{
                                    ...inputStyle,
                                    ...(errors.name ? { borderColor: "#c75050" } : {}),
                                }}
                                onFocus={(e) =>
                                    (e.currentTarget.style.borderColor = "var(--accent)")
                                }
                                onBlur={(e) =>
                                    (e.currentTarget.style.borderColor = "var(--border)")
                                }
                            />
                            {errors.name && (
                                <p className="text-xs mt-1.5" style={{ color: "#c75050" }}>
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                {...register("email")}
                                placeholder={t("email_placeholder")}
                                type="email"
                                className="w-full px-5 py-3.5 rounded-xl text-sm outline-none focus:ring-1"
                                style={{
                                    ...inputStyle,
                                    ...(errors.email ? { borderColor: "#c75050" } : {}),
                                }}
                                onFocus={(e) =>
                                    (e.currentTarget.style.borderColor = "var(--accent)")
                                }
                                onBlur={(e) =>
                                    (e.currentTarget.style.borderColor = "var(--border)")
                                }
                            />
                            {errors.email && (
                                <p className="text-xs mt-1.5" style={{ color: "#c75050" }}>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <textarea
                                {...register("message")}
                                placeholder={t("message_placeholder")}
                                rows={5}
                                className="w-full px-5 py-3.5 rounded-xl text-sm outline-none resize-none focus:ring-1"
                                style={{
                                    ...inputStyle,
                                    ...(errors.message ? { borderColor: "#c75050" } : {}),
                                }}
                                onFocus={(e) =>
                                    (e.currentTarget.style.borderColor = "var(--accent)")
                                }
                                onBlur={(e) =>
                                    (e.currentTarget.style.borderColor = "var(--border)")
                                }
                            />
                            {errors.message && (
                                <p className="text-xs mt-1.5" style={{ color: "#c75050" }}>
                                    {errors.message.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status === "loading" || status === "success"}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105 disabled:opacity-60"
                            style={{
                                fontFamily: "var(--font-dm)",
                                backgroundColor:
                                    status === "success" ? "#4a9960" : "var(--accent)",
                                color: "var(--bg-primary)",
                                fontWeight: 500,
                            }}
                        >
                            {status === "idle" && (
                                <>
                                    {t("send")} <Send size={14} />
                                </>
                            )}
                            {status === "loading" && (
                                <>
                                    {t("sending")} <Loader2 size={14} className="animate-spin" />
                                </>
                            )}
                            {status === "success" && (
                                <>
                                    {t("sent")} <Check size={14} />
                                </>
                            )}
                            {status === "error" && t("error")}
                        </button>
                    </motion.form>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <a
                            href={`mailto:${identity.email}`}
                            className="flex items-center gap-4 p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <Mail size={20} style={{ color: "var(--accent)" }} />
                            <div>
                                <p className="text-sm" style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}>Email</p>
                                <p className="text-base" style={{ fontFamily: "var(--font-dm)" }}>{identity.email}</p>
                            </div>
                        </a>

                        <a
                            href={identity.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <Linkedin size={20} style={{ color: "var(--accent)" }} />
                            <div>
                                <p className="text-sm" style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}>LinkedIn</p>
                                <p className="text-base" style={{ fontFamily: "var(--font-dm)" }}>linkedin.com/in/alessio-sabatino29</p>
                            </div>
                        </a>

                        <a
                            href={identity.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <Globe size={20} style={{ color: "var(--accent)" }} />
                            <div>
                                <p className="text-sm" style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}>Portfolio</p>
                                <p className="text-base" style={{ fontFamily: "var(--font-dm)" }}>academy.fiscedge.com</p>
                            </div>
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
