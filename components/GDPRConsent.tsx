"use client";

import CookieConsent from "react-cookie-consent";
import { useTranslations } from "next-intl";
import { site } from "@/lib/site";

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

/** Grant Google Consent Mode storage after the visitor accepts. */
function grantConsent() {
    window.gtag?.("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
    });
}

export default function GDPRConsent() {
    const t = useTranslations("contact");

    return (
        <CookieConsent
            location="bottom"
            buttonText={t("gdpr_accept")}
            enableDeclineButton
            declineButtonText={t("gdpr_decline")}
            onAccept={grantConsent}
            cookieName={site.consentCookie}
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
            declineButtonStyle={{
                background: "transparent",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                fontSize: "14px",
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
