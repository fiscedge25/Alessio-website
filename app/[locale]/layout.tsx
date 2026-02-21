import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    style: ["normal", "italic"],
    variable: "--font-cormorant",
    display: "swap",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500"],
    variable: "--font-dm",
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

    return {
        title: isIt
            ? "Alessio Sabatino — Business Strategist & Sviluppatore"
            : "Alessio Sabatino — Business Strategist & Developer",
        description: isIt
            ? "Business strategist e sviluppatore autodidatta che costruisce piattaforme digitali all'intersezione di innovazione, tecnologia e imprenditorialità. Con base a Roma, costruisco globalmente."
            : "Business strategist and self-taught developer building digital platforms at the intersection of innovation, technology, and entrepreneurship. Based in Rome, building globally.",
        keywords: [
            "Alessio Sabatino",
            "business strategist",
            "developer",
            "Rome",
            "React",
            "innovation",
            "digital platforms",
        ],
        authors: [{ name: "Alessio Sabatino" }],
        alternates: {
            canonical: `https://alessiosabatino.com/${locale}`,
            languages: {
                en: "https://alessiosabatino.com/en",
                it: "https://alessiosabatino.com/it",
            },
        },
        openGraph: {
            title: isIt
                ? "Alessio Sabatino — Business Strategist & Sviluppatore"
                : "Alessio Sabatino — Business Strategist & Developer",
            description: isIt
                ? "Strategia, Innovazione & Sistemi Digitali."
                : "Strategy, Innovation & Digital Systems.",
            type: "website",
            locale: isIt ? "it_IT" : "en_US",
            siteName: "Alessio Sabatino",
        },
        twitter: {
            card: "summary_large_image",
            title: isIt
                ? "Alessio Sabatino — Business Strategist & Sviluppatore"
                : "Alessio Sabatino — Business Strategist & Developer",
            description: isIt
                ? "Strategia, Innovazione & Sistemi Digitali."
                : "Strategy, Innovation & Digital Systems.",
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
            data-theme="dark"
            className={`${cormorant.variable} ${dmSans.variable}`}
        >
            <head>
                <link
                    rel="alternate"
                    hrefLang="en"
                    href="https://alessiosabatino.com/en"
                />
                <link
                    rel="alternate"
                    hrefLang="it"
                    href="https://alessiosabatino.com/it"
                />
                <link
                    rel="alternate"
                    hrefLang="x-default"
                    href="https://alessiosabatino.com/en"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Person",
                            name: "Alessio Sabatino",
                            jobTitle: "Business Strategist & Developer",
                            url: "https://academy.fiscedge.com",
                            email: "alessio.sabatino29@gmail.com",
                            telephone: "+39 345 125 1902",
                            address: {
                                "@type": "PostalAddress",
                                addressLocality: "Roma",
                                addressCountry: "IT",
                            },
                            sameAs: [
                                "https://www.linkedin.com/in/alessio-sabatino29",
                                "https://academy.fiscedge.com",
                            ],
                            knowsLanguage: ["Italian", "English", "Spanish"],
                            alumniOf: [
                                {
                                    "@type": "CollegeOrUniversity",
                                    name: "Rome Business School",
                                },
                                {
                                    "@type": "CollegeOrUniversity",
                                    name: "Università La Sapienza",
                                },
                            ],
                        }),
                    }}
                />
            </head>
            <body className="antialiased">
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
