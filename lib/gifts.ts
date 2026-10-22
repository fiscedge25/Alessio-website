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
// Payment Links live in the BuiltWithSabba Stripe account. The URLs below
// are TEST mode: swap them for the live ones before launch. Each redirects to
// /unlock/<slug>/success?session_id={CHECKOUT_SESSION_ID}.

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

export interface GiftEntry {
    slug: string;
    /** Instagram keyword whose ManyChat DM points here. */
    keyword: string;
    repo: string;
    title: Localized;
    tagline: Localized;
    /** Display price — the real one is set on the Stripe Price. */
    price: string;
    paymentLink: string;
    fields: GiftField[];
    /** Query-string key for the visual theme, when the animation has one. */
    styleParam?: string;
    styles?: GiftStyle[];
    /** CSS selectors of the animation's own editor / share-your-own UI. */
    hide: string[];
    /** For multi-file animations: where their assets are served from /public. */
    assetsBase?: string;
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
        paymentLink: "https://buy.stripe.com/test_00w5kDh0m2eggR2bQg2go00",
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
        paymentLink: "https://buy.stripe.com/test_dRmfZh11o8CE6co5rS2go04",
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
        paymentLink: "https://buy.stripe.com/test_7sY8wPfWif12asEaMc2go02",
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
    },
    {
        slug: "heart",
        keyword: "Heart",
        repo: "https://github.com/buildwithsabba/heart",
        title: L("My heart, coded", "Il mio cuore, in codice"),
        tagline: L("She asked for my heart. So I coded it — hold to reveal your message.", "Mi ha chiesto il cuore. Così l'ho programmato: tieni premuto per svelare il messaggio."),
        price: "$1.99",
        paymentLink: "https://buy.stripe.com/test_dRm6oH7pM4mo0S45rS2go01",
        fields: [
            TO(40),
            { param: "msg", label: L("Message", "Messaggio"), placeholder: L("You already had it.", "Ce l'avevi già."), max: 110 },
            FROM(40),
        ],
        hide: [".personalize"],
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
        paymentLink: "https://buy.stripe.com/test_5kQ7sLeSe9GIgR24nO2go05",
        fields: [
            { param: "her", label: L("Her name", "Il suo nome"), placeholder: L("e.g. Emma", "es. Giulia"), max: 18, required: true },
            { param: "me", label: L("Your name", "Il tuo nome"), placeholder: L("e.g. Alex", "es. Marco"), max: 18, required: true },
        ],
        hide: ["#crew-editor"],
        assetsBase: "/gifts/space/",
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
        paymentLink: "https://buy.stripe.com/test_cNi6oH5hE8CE9oA8E42go06",
        fields: [TO(28)],
        hide: [".cyberInputWrapper", 'label[for="recipientInput"]'],
    },
    {
        slug: "moon",
        keyword: "Moon",
        repo: "https://github.com/buildwithsabba/moon",
        title: L("Get her the moon", "Portale la luna"),
        tagline: L("A launch mission to bring the moon back — dedicated to one name.", "Una missione di lancio per portarle la luna, dedicata a un solo nome."),
        price: "$1.99",
        paymentLink: "https://buy.stripe.com/test_fZuaEX8tQ1acfMY7A02go07",
        fields: [TO(28)],
        hide: [".inputInnerWrapper", 'label[for="recipientInput"]'],
    },
];

export function getGift(slug: string): GiftEntry | undefined {
    return gifts.find((g) => g.slug === slug);
}
