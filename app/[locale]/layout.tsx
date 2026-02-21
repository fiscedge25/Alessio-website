import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import GDPRConsent from "@/components/GDPRConsent";
import CustomCursor from "@/components/CustomCursor";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
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
            canonical: `https://www.alessiosabatino.it/${locale}`,
            languages: {
                en: "https://www.alessiosabatino.it/en",
                it: "https://www.alessiosabatino.it/it",
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
            className={`${spaceGrotesk.variable} ${dmSans.variable}`}
        >
            <head>
                <link
                    rel="alternate"
                    hrefLang="en"
                    href="https://www.alessiosabatino.it/en"
                />
                <link
                    rel="alternate"
                    hrefLang="it"
                    href="https://www.alessiosabatino.it/it"
                />
                <link
                    rel="alternate"
                    hrefLang="x-default"
                    href="https://www.alessiosabatino.it/en"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Person",
                            name: "Alessio Sabatino",
                            jobTitle: "Business Strategist & Developer",
                            url: "https://www.alessiosabatino.it",
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
            <body className="antialiased font-dm">
                <CustomCursor />
                <NextIntlClientProvider messages={messages}>
                    {children}
                    <GDPRConsent />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
