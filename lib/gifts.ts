// ─── Paid gift animations ────────────────────────────────────────────────────
// One entry = one animation people can personalise and buy as a dedication.
// The free preview at /[locale]/gift/[slug] carries a watermark; paying
// unlocks a permanent link at /g/[id] with the buyer's own words.
//
// The animation itself lives in content/gifts/<slug>.html, copied unchanged
// from its buildwithsabba/<repo> repo. Each one already reads its text from
// the query string — `param` says which key. The server writes that query
// string before the page's own scripts run, so it can't be forged by hand,
// and `hide` removes the page's built-in "make your own" editor.
//
// Payment Links live in the BuiltWithSabba Stripe account (LIVE mode). Each
// carries metadata unlock_slug=<slug> and redirects to
// /unlock/<slug>/success?session_id={CHECKOUT_SESSION_ID} — without that
// metadata the success page and webhook can't unlock anything.

import type { Localized } from "./hub";

export interface GiftField {
    /** Query-string key the animation reads. */
    param: string;
    label: Localized;
    placeholder?: Localized;
    hint?: Localized;
    max: number;
    /** Textarea; lines are joined with `joiner` (default "|") in the URL. */
    lines?: number;
    joiner?: string;
    required?: boolean;
}

export interface GiftStyle {
    id: string;
    label: Localized;
}

/** Anything with its own form and Payment Link: one animation, or the bundle. */
export interface Purchasable {
    slug: string;
    /** Display price — the real one is set on the Stripe Price. */
    price: string;
    paymentLink: string;
    fields: GiftField[];
    /** Query-string key for the visual theme, when the animation has one. */
    styleParam?: string;
    styles?: GiftStyle[];
}

/** The bundle's shared fields, which each animation maps onto its own params. */
export type BundleKey = "to" | "from" | "occasion" | "msg";

export interface GiftEntry extends Purchasable {
    /** Instagram keyword whose ManyChat DM points here. */
    keyword: string;
    repo: string;
    title: Localized;
    tagline: Localized;
    /** CSS selectors of the animation's own editor / share-your-own UI. */
    hide: string[];
    /** For multi-file animations: where their assets are served from /public. */
    assetsBase?: string;
    /** Animation param ← bundle field, for the all-in-one dedication. */
    bundle: Record<string, BundleKey>;
    /** Fallbacks for params the animation needs but the bundle may leave empty. */
    bundleDefaults?: Record<string, string>;
}

const L = (en: string, it: string): Localized => ({ en, it });

const TO = (max: number, required = true): GiftField => ({
    param: "to",
    label: L("To", "Per"),
    placeholder: L("e.g. My Love, Emma…", "es. Amore mio, Giulia…"),
    max,
    required,
});
const FROM = (max: number, required = false): GiftField => ({
    param: "from",
    label: required ? L("From", "Da") : L("From (optional)", "Da (facoltativo)"),
    placeholder: L("Your name", "Il tuo nome"),
    max,
    required,
});

export const gifts: GiftEntry[] = [
    {
        slug: "flowers",
        keyword: "Flower",
        repo: "https://github.com/buildwithsabba/flowers",
        title: L("A rose garden", "Un giardino di rose"),
        tagline: L(
            "Roses and sunflowers bloom one by one, then your message writes itself in.",
            "Rose e girasoli sbocciano uno a uno, poi il tuo messaggio si scrive da solo.",
        ),
        price: "$1.99",
        paymentLink: "https://buy.stripe.com/7sYeVdgf16ok0tOgQt1B605",
        fields: [
            TO(40),
            { param: "occasion", label: L("Occasion", "Occasione"), placeholder: L("e.g. Forever & Always", "es. Per sempre"), max: 40 },
            {
                param: "msg",
                label: L("Message", "Messaggio"),
                hint: L("Up to 5 lines. {n} = number of roses, {s} = sunflowers.", "Fino a 5 righe. {n} = numero di rose, {s} = girasoli."),
                max: 220,
                lines: 5,
            },
            FROM(40),
        ],
        styleParam: "style",
        styles: [
            { id: "garden", label: L("Night garden", "Giardino notturno") },
            { id: "paper", label: L("Love letter", "Lettera d'amore") },
            { id: "blueprint", label: L("Starry blueprint", "Progetto stellato") },
            { id: "code", label: L("Code of love", "Codice d'amore") },
        ],
        hide: ["#edit", "#panel"],
        bundle: { to: "to", occasion: "occasion", msg: "msg", from: "from" },
    },
    {
        slug: "garden",
        keyword: "Garden",
        repo: "https://github.com/buildwithsabba/garden",
        title: L("An enchanted garden", "Un giardino incantato"),
        tagline: L(
            "A meadow that blooms at a touch, with a letter card that opens on your words.",
            "Un prato che sboccia al tocco, con una lettera che si apre sulle tue parole.",
        ),
        price: "$1.99",
        paymentLink: "https://buy.stripe.com/dRmbJ1e6T2841xS0Rv1B607",
        fields: [
            TO(24),
            { param: "occasion", label: L("Occasion", "Occasione"), placeholder: L("e.g. just because", "es. senza motivo"), max: 40 },
            { param: "msg", label: L("Message", "Messaggio"), hint: L("Up to 4 lines.", "Fino a 4 righe."), max: 140, lines: 4 },
            // Left empty, the animation signs it "Alessio" — so it's required.
            FROM(24, true),
        ],
        styleParam: "style",
        styles: [
            { id: "midnight", label: L("Midnight", "Mezzanotte") },
            { id: "morning", label: L("Morning", "Mattino") },
            { id: "vintage", label: L("Vintage", "Vintage") },
            { id: "enchanted", label: L("Enchanted", "Incantato") },
        ],
        hide: ["#createBtn", "#sheet", "#scrim"],
        bundle: { to: "to", occasion: "occasion", msg: "msg", from: "from" },
    },
    {
        slug: "bloom",
        keyword: "bloom",
        repo: "https://github.com/buildwithsabba/bloom",
        title: L("Bloom", "Bloom"),
        tagline: L(
            "Plant something small and watch a whole botanical world bloom for them.",
            "Pianta qualcosa di piccolo e guarda un intero mondo botanico sbocciare per lei.",
        ),
        price: "$1.99",
        paymentLink: "https://buy.stripe.com/cNieVd3sfbIEfoIeIl1B606",
        fields: [
            TO(32),
            { param: "message", label: L("Message", "Messaggio"), placeholder: L("You are loved", "Sei amata"), max: 90, required: true },
            FROM(32),
        ],
        styleParam: "type",
        styles: [
            { id: "love", label: L("Love", "Amore") },
            { id: "friendship", label: L("Friendship", "Amicizia") },
            { id: "birthday", label: L("Birthday", "Compleanno") },
        ],
        hide: ["#openGiftModalBtn", "#introPlantForSomeoneLink", "#giftModalOverlay", "#finalSendBloomBtn"],
        bundle: { to: "to", message: "msg", from: "from" },
        // Bloom only personalises when both `to` and `message` are set.
        bundleDefaults: { message: "You are loved ♡" },
    },
    {
        slug: "heart",
        keyword: "Heart",
        repo: "https://github.com/buildwithsabba/heart",
        title: L("My heart, coded", "Il mio cuore, in codice"),
        tagline: L("She asked for my heart. So I coded it — hold to reveal your message.", "Mi ha chiesto il cuore. Così l'ho programmato: tieni premuto per svelare il messaggio."),
        price: "$1.99",
        paymentLink: "https://buy.stripe.com/eVq5kD5An9Aw1xS43H1B603",
        fields: [
            TO(40),
            { param: "msg", label: L("Message", "Messaggio"), placeholder: L("You already had it.", "Ce l'avevi già."), max: 110 },
            FROM(40),
        ],
        hide: [".personalize"],
        bundle: { to: "to", msg: "msg", from: "from" },
    },
    {
        slug: "space",
        keyword: "SPACE",
        repo: "https://github.com/buildwithsabba/space",
        title: L("A date in space", "Un appuntamento nello spazio"),
        tagline: L(
            "An interstellar journey for two — both your names on the crew manifest.",
            "Un viaggio interstellare per due: i vostri nomi sul manifesto dell'equipaggio.",
        ),
        price: "$1.99",
        paymentLink: "https://buy.stripe.com/fZudR9d2P3c8ekE43H1B604",
        fields: [
            { param: "her", label: L("Her name", "Il suo nome"), placeholder: L("e.g. Emma", "es. Giulia"), max: 18, required: true },
            { param: "me", label: L("Your name", "Il tuo nome"), placeholder: L("e.g. Alex", "es. Marco"), max: 18, required: true },
        ],
        hide: ["#crew-editor"],
        assetsBase: "/gifts/space/",
        bundle: { her: "to", me: "from" },
    },
    {
        slug: "love",
        keyword: "Love",
        repo: "https://github.com/buildwithsabba/loveme",
        title: L("Encrypted love message", "Messaggio d'amore criptato"),
        tagline: L(
            "A love letter as a hacking sequence — decrypted only for the name you choose.",
            "Una lettera d'amore come una sequenza di hacking, decifrata solo per il nome che scegli.",
        ),
        price: "$1.99",
        paymentLink: "https://buy.stripe.com/8x2cN56Er6ok1xScAd1B602",
        fields: [TO(28)],
        hide: [".cyberInputWrapper", 'label[for="recipientInput"]'],
        bundle: { to: "to" },
    },
    {
        slug: "moon",
        keyword: "Moon",
        repo: "https://github.com/buildwithsabba/moon",
        title: L("Get her the moon", "Portale la luna"),
        tagline: L("A launch mission to bring the moon back — dedicated to one name.", "Una missione di lancio per portarle la luna, dedicata a un solo nome."),
        price: "$1.99",
        paymentLink: "https://buy.stripe.com/5kQcN5gf1bIE2BWbw91B601",
        fields: [TO(28)],
        hide: [".inputInnerWrapper", 'label[for="recipientInput"]'],
        bundle: { to: "to" },
    },
    {
        slug: "bouquet",
        keyword: "Flowers",
        repo: "https://github.com/buildwithsabba/flowers1",
        title: L("Flowers for you", "Fiori per te"),
        tagline: L(
            "A cinematic heart of flowers grows out of the dark, then dedicates itself by name.",
            "Un cuore di fiori cinematografico cresce dal buio, poi si dedica per nome.",
        ),
        price: "$1.99",
        // TODO: live Payment Link (unlock_slug=bouquet) — still missing.
        paymentLink: "",
        fields: [TO(24), FROM(24)],
        // Name personalisation is added in our copy (content/gifts/bouquet.html);
        // the original repo has no editor to hide.
        hide: [],
        assetsBase: "/gifts/bouquet/",
        bundle: { to: "to", from: "from" },
    },
];

export function getGift(slug: string): GiftEntry | undefined {
    return gifts.find((g) => g.slug === slug);
}

/**
 * Every animation in one purchase: the buyer writes once, and gets one link
 * per animation. Each animation picks what it can show from these fields
 * (see `bundle` on each entry) — space only takes the two names, etc.
 */
export const BUNDLE: Purchasable = {
    slug: "all",
    price: "$5.99",
    paymentLink: "https://buy.stripe.com/28E5kD9QD2846Sc6bP1B600",
    fields: [
        TO(18),
        // Required: garden would otherwise sign it "Alessio", space needs both names.
        FROM(18, true),
        { param: "occasion", label: L("Occasion (optional)", "Occasione (facoltativa)"), placeholder: L("e.g. Forever & Always", "es. Per sempre"), max: 40 },
        {
            param: "msg",
            label: L("Message (optional)", "Messaggio (facoltativo)"),
            hint: L(
                "Up to 4 lines. Left empty, each animation uses its own words.",
                "Fino a 4 righe. Se lo lasci vuoto, ogni animazione usa le sue parole.",
            ),
            max: 140,
            lines: 4,
        },
    ],
};

/** Full price of all animations bought one by one, for the "save" line. */
export const BUNDLE_FULL_PRICE = `$${(gifts.length * 1.99).toFixed(2)}`;

/** The bundle's shared values, translated into one animation's own params. */
export function bundleValuesFor(gift: GiftEntry, shared: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = { ...gift.bundleDefaults };
    for (const [param, key] of Object.entries(gift.bundle)) {
        if (shared[key]) out[param] = shared[key];
    }
    return out;
}
