import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function PrivacyPolicyPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: "privacy" });

    return (
        <main className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-5xl mb-8 font-medium" style={{ fontFamily: "var(--font-cormorant)", color: "var(--text-heading)" }}>
                {t("title")}
            </h1>

            <div className="space-y-8 text-base md:text-lg leading-relaxed" style={{ fontFamily: "var(--font-dm)", color: "var(--text-secondary)" }}>
                <section>
                    <h2 className="text-2xl mb-4 font-medium" style={{ color: "var(--text-primary)" }}>{t("section_1_title")}</h2>
                    <p>{t("section_1_text")}</p>
                </section>

                <section>
                    <h2 className="text-2xl mb-4 font-medium" style={{ color: "var(--text-primary)" }}>{t("section_2_title")}</h2>
                    <p>{t("section_2_text")}</p>
                </section>

                <section>
                    <h2 className="text-2xl mb-4 font-medium" style={{ color: "var(--text-primary)" }}>{t("section_3_title")}</h2>
                    <p>{t("section_3_text")}</p>
                </section>

                <section>
                    <h2 className="text-2xl mb-4 font-medium" style={{ color: "var(--text-primary)" }}>{t("section_4_title")}</h2>
                    <p>{t("section_4_text")}</p>
                </section>
            </div>
        </main>
    );
}
