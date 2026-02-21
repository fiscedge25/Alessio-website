"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { identity } from "@/lib/data";
import { Mail, Linkedin, Globe, MessageCircle } from "lucide-react";

export default function Contact() {
    const t = useTranslations("contact");

    // Replace with your actual WhatsApp number including country code (e.g., 39 for Italy)
    const whatsappNumber = "393451251902"; // Example: +39 327 856 4175. Replace with actual number
    const whatsappMessage = encodeURIComponent("Ciao Alessio, vorrei parlarti di un progetto!");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
        <section id="contact" className="relative z-10 py-28 px-6">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
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
                        className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
                        style={{
                            fontFamily: "var(--font-dm)",
                            color: "var(--text-secondary)",
                            fontWeight: 300,
                        }}
                    >
                        {t("subtitle")}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full flex justify-center mb-16"
                >
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,211,102,0.4)]"
                        style={{
                            backgroundColor: "#25D366", // WhatsApp brand color
                            color: "#ffffff",
                        }}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <MessageCircle size={24} className="relative z-10" />
                        <span
                            className="relative z-10 text-base sm:text-lg tracking-wide font-medium"
                            style={{ fontFamily: "var(--font-dm)" }}
                        >
                            {t("whatsapp_btn")}
                        </span>
                    </a>
                </motion.div>

                {/* Additional Links Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6"
                >
                    <a
                        href={`mailto:${identity.email}`}
                        className="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 group"
                        style={{
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-[var(--accent)] group-hover:bg-opacity-10" style={{ backgroundColor: "var(--bg-elevated)" }}>
                            <Mail size={20} className="transition-colors duration-300 group-hover:text-[var(--accent)]" style={{ color: "var(--text-muted)" }} />
                        </div>
                        <p className="text-sm mb-1" style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}>{t("email_label")}</p>
                        <p className="text-base" style={{ fontFamily: "var(--font-dm)", color: "var(--text-primary)" }}>{identity.email}</p>
                    </a>

                    <a
                        href={identity.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 group"
                        style={{
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-[#0A66C2] group-hover:bg-opacity-10" style={{ backgroundColor: "var(--bg-elevated)" }}>
                            <Linkedin size={20} className="transition-colors duration-300 group-hover:text-[#0A66C2]" style={{ color: "var(--text-muted)" }} />
                        </div>
                        <p className="text-sm mb-1" style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}>LinkedIn</p>
                        <p className="text-base" style={{ fontFamily: "var(--font-dm)", color: "var(--text-primary)" }}>alessio-sabatino29</p>
                    </a>

                    <a
                        href={identity.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 group"
                        style={{
                            backgroundColor: "var(--bg-surface)",
                            border: "1px solid var(--border)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-[var(--accent)] group-hover:bg-opacity-10" style={{ backgroundColor: "var(--bg-elevated)" }}>
                            <Globe size={20} className="transition-colors duration-300 group-hover:text-[var(--accent)]" style={{ color: "var(--text-muted)" }} />
                        </div>
                        <p className="text-sm mb-1" style={{ fontFamily: "var(--font-dm)", color: "var(--text-muted)" }}>Portfolio</p>
                        <p className="text-base break-words w-full px-2" style={{ fontFamily: "var(--font-dm)", color: "var(--text-primary)" }}>{identity.portfolio.replace('https://', '')}</p>
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
