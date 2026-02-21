# Alessio Sabatino — Personal Landing Page

A premium, responsive personal landing page built with modern web technologies.

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Background**: tsparticles (particle network)
- **i18n**: next-intl (English / Italian)
- **Forms**: react-hook-form + zod + Formspree
- **Fonts**: Cormorant Garamond + DM Sans

## Features

- 🌗 Dark / Light mode toggle
- 🌍 Multi-language (EN / IT) with automatic locale detection
- ✨ Particle network background with mouse interaction
- 📱 Fully responsive (mobile-first)
- 🎯 Active section highlighting in navbar
- 🖼️ Project cards with abstract preview images
- 📧 Contact form with validation
- 🔍 SEO optimized (Open Graph, JSON-LD, hreflang, sitemap)

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Configuration

- **Formspree**: Replace `YOUR_FORM_ID` in `components/Contact.tsx` with your Formspree endpoint ID
- **Domain**: Update canonical URLs in `app/[locale]/layout.tsx` when you have your final domain
- **Profile photo**: Replace the placeholder in `components/Hero.tsx` with your image in `/public/profile.jpg`

## Deploy on Vercel

1. Push to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Vercel auto-detects Next.js — no configuration needed
4. Set custom domain in Vercel dashboard → Settings → Domains

## License

MIT
