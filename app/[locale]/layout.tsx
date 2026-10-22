import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import GDPRConsent from "@/components/GDPRConsent";
import BackdropGrid from "@/components/hub/BackdropGrid";
import "../globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

// Self-hosted (variable, latin): next/font/google's JetBrains Mono CSS now
// points at /l/font?kit=… URLs that Turbopack can't resolve, which broke the
// Vercel build. Source: @fontsource-variable/jetbrains-mono 5.3.0 (OFL 1.1).
const jetbrainsMono = localFont({
    src: "../fonts/JetBrainsMono-latin-var.woff2",
    weight: "100 800",
    variable: "--font-mono",
    display: "swap",
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isIt = locale === "it";

    const title = isIt
        ? "Alessio Sabatino — Founder & AI Builder | BuiltWithSabba"
        : "Alessio Sabatino — AI Builder, Founder & Developer | BuiltWithSabba";
    const description = isIt
        ? "Sono Alessio Sabatino. Costruisco prodotti AI, piattaforme digitali ed esperimenti tra tecnologia e imprenditorialità. Segui cosa sto costruendo su BuiltWithSabba."
        : "I'm Alessio Sabatino. I build AI products, digital platforms and experiments across technology and entrepreneurship. Follow what I'm building at BuiltWithSabba.";

    return {
        title,
        description,
        metadataBase: new URL(site.url),
        authors: [{ name: site.owner, url: site.url }],
        creator: site.owner,
        alternates: {
            canonical: `${site.url}/${locale}`,
            languages: {
                en: `${site.url}/en`,
                it: `${site.url}/it`,
            },
        },
        openGraph: {
            title,
            description,
            type: "website",
            locale: isIt ? "it_IT" : "en_US",
            url: `${site.url}/${locale}`,
            siteName: "BuiltWithSabba",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
        icons: { icon: "/favicon.ico" },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            data-theme="light"
            className={`${inter.variable} ${jetbrainsMono.variable}`}
            suppressHydrationWarning
        >
            <head>
                {/* Consent Mode v2 defaults, then Google Tag Manager. Must run before
                    anything else pushes to dataLayer. Storage stays denied until the
                    cookie banner is accepted (cookie set by GDPRConsent). */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
if(document.cookie.indexOf('${site.consentCookie}=true')>-1){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});}
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${site.gtm.id}');`,
                    }}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
                    }}
                />
                <link rel="alternate" hrefLang="en" href={`${site.url}/en`} />
                <link rel="alternate" hrefLang="it" href={`${site.url}/it`} />
                <link rel="alternate" hrefLang="x-default" href={`${site.url}/en`} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Person",
                            name: site.owner,
                            jobTitle: "AI Builder & Founder",
                            url: site.url,
                            email: site.email,
                            address: {
                                "@type": "PostalAddress",
                                addressLocality: "Roma",
                                addressCountry: "IT",
                            },
                            sameAs: [
                                site.linkedin.url,
                                site.github.url,
                                site.fiscedge.url,
                                site.fiscedge.academyUrl,
                            ],
                            knowsAbout: [
                                "AI products",
                                "Company building",
                                "Product development",
                                "Web engineering",
                            ],
                        }),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            name: "BuiltWithSabba",
                            url: site.url,
                            author: {
                                "@type": "Person",
                                name: site.owner,
                            },
                            inLanguage: ["en", "it"],
                        }),
                    }}
                />
            </head>
            <body className="antialiased">
                <noscript>
                    <iframe
                        src={`https://www.googletagmanager.com/ns.html?id=${site.gtm.id}`}
                        height="0"
                        width="0"
                        style={{ display: "none", visibility: "hidden" }}
                    />
                </noscript>
                <BackdropGrid />
                <NextIntlClientProvider messages={messages}>
                    {children}
                    <GDPRConsent />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
