# Newsletter

Two independent pieces:

## 1. Collect subscribers (live)
- Form in the hero → `POST /api/subscribe` → Supabase table `subscribers`.
- Setup: run `supabase/subscribers.sql` then `supabase/subscribers-unsubscribe.sql` in the Supabase SQL editor.
- Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Send a newsletter (Resend)
- Env: `RESEND_API_KEY`, `NEWSLETTER_FROM`, `NEWSLETTER_ADMIN_SECRET`, `NEXT_PUBLIC_SITE_URL`.
- To send real email you must **verify your domain in Resend** (resend.com → Domains) and set
  `NEWSLETTER_FROM` to an address on that domain, e.g. `Alessio Sabatino <news@alessiosabatino.it>`.
  Before verifying, you can only send from `onboarding@resend.dev` to your own address.

### Send a test to yourself
```bash
curl -X POST http://localhost:3000/api/newsletter/send \
  -H "Authorization: Bearer $NEWSLETTER_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Hello","html":"<h2>Ciao!</h2><p>Prima newsletter.</p>","testEmail":"you@example.com"}'
```

### Send to all active subscribers
```bash
curl -X POST http://localhost:3000/api/newsletter/send \
  -H "Authorization: Bearer $NEWSLETTER_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Monthly update","html":"<h2>Novità</h2><p>...</p>"}'
```

- Each recipient gets a personal unsubscribe link (`/api/unsubscribe?id=<uuid>`), added to the footer
  and to the `List-Unsubscribe` header. Unsubscribed users are skipped on the next send.
- Sends are batched (100 per Resend call).

> The `NEWSLETTER_ADMIN_SECRET` protects the send endpoint — anyone with it can email your whole list.
> Keep it only in `.env.local` / your host's env vars. Never commit it.
