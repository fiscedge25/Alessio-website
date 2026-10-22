import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { site } from "@/lib/site";
import Navbar from "@/components/hub/Navbar";
import Footer from "@/components/hub/Footer";

// English-only, like the gift shop it covers: /it/terms redirects here
// (see next.config.ts). Draft — have it reviewed before relying on it.
const UPDATED = "October 22, 2026";

export async function generateStaticParams() {
    return [{ locale: "en" }, { locale: "it" }];
}

export const metadata: Metadata = {
    title: "Terms of Sale — BuiltWithSabba",
    description: "Terms for buying personalised gift animations on BuiltWithSabba, including our no-refund policy.",
    alternates: { canonical: `${site.url}/en/terms` },
};

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-28">
            <h2 className="font-display text-xl md:text-2xl text-[color:var(--ink)] mb-3">{title}</h2>
            <div className="space-y-3 leading-relaxed text-[color:var(--ink-2)]">{children}</div>
        </section>
    );
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <>
            <Navbar />
            <main className="px-5 md:px-8 pt-28 md:pt-36 pb-20">
                <article className="max-w-2xl mx-auto">
                    <p className="font-mono-meta text-[11px] uppercase text-[color:var(--muted)] mb-4">Last updated {UPDATED}</p>
                    <h1
                        className="font-display text-[color:var(--ink)] uppercase"
                        style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1.05 }}
                    >
                        Terms of Sale
                    </h1>
                    <p className="mt-4 mb-12 text-lg leading-relaxed text-[color:var(--muted)]">
                        These terms apply when you buy a personalised gift animation (&ldquo;dedication&rdquo;) on{" "}
                        {site.url.replace(/^https?:\/\//, "")}. By completing a purchase you accept them.
                    </p>

                    <div className="space-y-10">
                        <Section title="1. Who we are">
                            <p>
                                BuiltWithSabba is run by {site.owner}. Contact:{" "}
                                <a className="link-blue" href={`mailto:${site.email}`}>
                                    {site.email}
                                </a>
                                .
                            </p>
                            <p>
                                Payments are processed by Stripe, which acts as merchant of record: Stripe charges your
                                card, calculates and collects any applicable sales tax or VAT, and issues your receipt.
                            </p>
                        </Section>

                        <Section title="2. What you buy">
                            <p>
                                A digital, personalised version of one of our animations (or all of them, with the
                                bundle) showing the names and message you enter before paying, delivered as a private
                                link. Nothing physical is shipped. Prices are shown in USD before checkout; Stripe may
                                display them in your local currency.
                            </p>
                            <p>
                                The free preview shows exactly what you will get, minus the watermark. Please check your
                                spelling there: the text is fixed once you pay.
                            </p>
                        </Section>

                        <Section title="3. Delivery">
                            <p>
                                Your link (or links, for the bundle) appears immediately after payment on the
                                confirmation page. No email is sent: bookmark that page or copy your link. You can reopen
                                the same confirmation page at any time to find it again.
                            </p>
                            <p>
                                Links stay online for as long as BuiltWithSabba operates. Anyone you share a link with can
                                open it, so share it only with people you choose.
                            </p>
                        </Section>

                        <Section id="refunds" title="4. No refunds">
                            <p className="font-medium text-[color:var(--ink)]">
                                All sales are final. We do not offer refunds on dedications.
                            </p>
                            <p>
                                Because a dedication is digital content delivered immediately, before paying you are
                                asked to confirm that you want immediate delivery and that you acknowledge losing the
                                14-day right of withdrawal that applies to distance purchases in the EU/EEA and UK. Once
                                your link has been delivered, the purchase cannot be cancelled.
                            </p>
                            <p>
                                This does not affect your statutory rights. If a dedication you paid for does not load,
                                shows content different from your preview, or was never delivered because of a fault on
                                our side, write to us within 30 days with your receipt and we will fix it or issue a
                                working link.
                            </p>
                        </Section>

                        <Section title="5. What you write">
                            <p>
                                You are responsible for the names and message you enter. Don&rsquo;t use dedications to
                                harass, threaten or impersonate anyone, or to share content that is unlawful. We may
                                disable a link that breaks this rule, without refund.
                            </p>
                        </Section>

                        <Section title="6. Ownership">
                            <p>
                                The animations and their code remain ours. Your purchase gives you a personal,
                                non-commercial right to view and share your dedication link.
                            </p>
                        </Section>

                        <Section title="7. Privacy">
                            <p>
                                We store your dedication text and the email Stripe gives us, only to deliver and support
                                your purchase. See our{" "}
                                <Link className="link-blue" href="/en/privacy">
                                    privacy policy
                                </Link>
                                .
                            </p>
                        </Section>

                        <Section title="8. Changes and law">
                            <p>
                                We may update these terms; the version shown when you bought applies to your purchase.
                                These terms are governed by Italian law, without prejudice to the mandatory consumer
                                protections of the country where you live.
                            </p>
                        </Section>
                    </div>
                </article>
            </main>
            <Footer />
        </>
    );
}
