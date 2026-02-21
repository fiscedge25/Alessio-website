# PROMPT RAFFINAMENTO — Typography Contrast + Multi-Lingua

---

## PROMPT 1: TYPOGRAPHY CONTRAST & GERARCHIA VISIVA

```
Il design system attuale è ottimo. NON cambiare palette, animazioni, 
layout o struttura componenti. Intervieni SOLO sulla tipografia 
per aumentare il contrasto e la gerarchia visiva.

MODIFICHE RICHIESTE:

1. HEADING WEIGHT
   - h1 (Hero nome): Cormorant Garamond peso 600 invece di 300.
     Il nome "Alessio Sabatino" deve avere più presenza e impatto.
     Mantieni l'italic solo sulla parte in accento.
   - h2 (section titles come "Bridging Strategy & Technology"): 
     peso 500 invece di 300. Devono staccarsi dal body text.
   - h3 (card titles, timeline titles): peso 500.

2. SIZE SCALE PIÙ AGGRESSIVA
   - Hero h1: da clamp(3rem, 8vw, 6.5rem) a clamp(3.5rem, 9vw, 7rem)
   - Section titles h2: da clamp(2rem, 4vw, 3.2rem) a clamp(2.2rem, 5vw, 3.6rem)
   - Body text: resta 0.95rem — non toccare
   - Section labels ("01 — About"): resta 0.7rem — non toccare
   Il delta tra heading e body deve essere più marcato.

3. LETTER-SPACING DIFFERENZIATO
   - Hero h1: letter-spacing -0.03em (più stretto = più premium)
   - Section titles: letter-spacing -0.02em
   - Section labels uppercase: letter-spacing 0.3em (già ok)
   - Body: letter-spacing 0 (naturale)

4. COLORE HEADING
   - Tutti gli heading: colore #ffffff puro invece di #f0efe9.
     Il body text resta #f0efe9. Questo crea un sottile 
     contrasto caldo/freddo tra titoli e paragrafi.
   - In light mode: heading #0a0a0a, body #2a2a2a

5. LINE-HEIGHT
   - h1: line-height 1.0 (compatto, potente)
   - h2: line-height 1.1
   - Body: line-height 1.75 (resta invariato)

6. STAT NUMBERS
   - I numeri nelle stat card (4+, 3, 3): Cormorant Garamond 
     peso 300, size 3rem (più grande), colore accento #c8c0b0.
     Devono essere l'elemento visivo dominante della card.

NON TOCCARE: palette colori, animazioni, Framer Motion, 
particle background, grain, layout, struttura componenti, 
navbar, footer, card structure.
```

---

## PROMPT 2: SISTEMA MULTI-LINGUA (IT/EN)

```
Aggiungi un sistema di internazionalizzazione (i18n) al progetto.
Lingue supportate: Italiano (it) e English (en). Default: English.

APPROCCIO TECNICO:
Usa next-intl (npm install next-intl).

STRUTTURA FILE:

/messages
  en.json        → tutti i testi in inglese
  it.json        → tutti i testi in italiano

/app
  [locale]
    layout.tsx   → wrapper con NextIntlClientProvider
    page.tsx     → pagina principale
  middleware.ts  → redirect basato su locale

/lib
  i18n.ts        → configurazione next-intl
  data.ts        → AGGIORNA: ogni campo testuale diventa 
                   una chiave di traduzione

CONTENUTI DA TRADURRE (prendi dal file .md allegato):
- Hero: tagline, bio breve, CTA buttons
- About: bio completa (Sezione 2 del .md ha già IT e EN), stat labels
- Education: titoli degree, nomi istituti, periodi
- Projects: tag, nomi, descrizioni, stack labels
- Skills: nomi competenze, titoli gruppi
- Contact: titolo, sottotitolo, link labels
- Footer: copyright
- Navbar: link labels
- Section labels ("01 — About" → "01 — Chi Sono")

MAPPING SEZIONI IT:
- "About" → "Chi Sono"
- "Education" → "Formazione"
- "Projects" → "Progetti"
- "Skills" → "Competenze"
- "Contact" → "Contatti"
- "Built from Scratch" → "Costruiti da Zero"
- "Let's Build Something Together" → "Costruiamo Qualcosa Insieme"
- "View Projects" → "Vedi Progetti"
- "Get in Touch" → "Contattami"

UI TOGGLE LINGUA:
- Nella navbar, accanto al theme toggle, aggiungi un selettore lingua.
- Stile: testo "EN" / "IT" separati da slash, quello attivo in 
  colore #ffffff, quello inattivo in #555555. Click per switchare.
- NO dropdown, NO bandiere. Solo testo minimale coerente col design.
- Su mobile: visibile nell'hamburger menu.

ROUTING:
- /en → versione inglese (default)
- /it → versione italiana
- Middleware: detecta Accept-Language header per prima visita,
  poi rispetta la scelta dell'utente.

URL SEO:
- Ogni lingua ha il suo canonical URL
- Hreflang tags nel <head> per entrambe le lingue
- Metadata (title, description, og tags) tradotti per lingua

NON TOCCARE: design, animazioni, componenti visivi, palette, 
typography (usa le modifiche del Prompt 1 se già applicate).
Cambia SOLO il layer dei contenuti testuali.
```

---

## PROMPT 3: APPLICARE ENTRAMBI INSIEME

```
Leggi il file .md allegato "Alessio_Sabatino_Landing_Page_Blueprint.md".

Applica queste due modifiche al progetto Next.js esistente:

1. TYPOGRAPHY — Aumenta il contrasto visivo degli heading:
   - h1 peso 600, h2 peso 500, heading color #ffffff puro
   - Scale size più aggressiva: h1 clamp(3.5rem,9vw,7rem), 
     h2 clamp(2.2rem,5vw,3.6rem)
   - Letter-spacing negativo su heading (-0.03em h1, -0.02em h2)
   - Line-height compatto (1.0 h1, 1.1 h2)
   - Stat numbers: 3rem, peso 300, accento
   - Body text invariato

2. MULTI-LINGUA (IT/EN) — Implementa next-intl:
   - /messages/en.json e /messages/it.json con tutti i testi
   - Route /[locale]/page.tsx
   - Toggle "EN / IT" nella navbar (testo minimale, no bandiere)
   - Metadata SEO per lingua + hreflang
   - Contenuti IT e EN dal file .md allegato (Sezione 2)

Non modificare palette, animazioni, particle background, 
struttura layout o logica componenti. Solo tipografia e testi.
```

---

## COME USARE

**Se hai già il progetto funzionante:**
- Usa Prompt 1 → poi Prompt 2 (separati, uno alla volta)

**Se vuoi applicare tutto in un colpo:**
- Usa Prompt 3 (combinato)

**In tutti i casi:** allega sempre il file .md blueprint
