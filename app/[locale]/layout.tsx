import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
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
                <BackdropGrid />
                <NextIntlClientProvider messages={messages}>
                    {children}
                    <GDPRConsent />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
