"use client";

import CookieConsent from "react-cookie-consent";
import { useTranslations } from "next-intl";

export default function GDPRConsent() {
    const t = useTranslations("contact");

    return (
        <CookieConsent
            location="bottom"
            buttonText={t("gdpr_accept")}
            cookieName="alessiosabatino-gdpr-consent"
            style={{
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-dm)",
                fontSize: "14px",
                borderTop: "1px solid var(--border)",
                alignItems: "center",
                padding: "10px 20px"
            }}
            buttonStyle={{
                backgroundColor: "var(--accent)",
                color: "var(--bg-primary)",
                fontSize: "14px",
                fontWeight: 500,
                borderRadius: "30px",
                padding: "8px 24px",
                fontFamily: "var(--font-dm)",
            }}
            expires={150}
        >
            {t("gdpr_text")}
        </CookieConsent>
    );
}
