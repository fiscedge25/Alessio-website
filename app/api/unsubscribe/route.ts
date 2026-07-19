import { getSupabaseAdmin } from "@/lib/supabase";

function page(title: string, message: string) {
    return `<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>
  :root{color-scheme:light dark}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    background:#f6f7fc;color:#12122b}
  @media(prefers-color-scheme:dark){body{background:#070712;color:#e9edf7}}
  .card{max-width:420px;padding:40px 32px;text-align:center}
  h1{font-size:1.4rem;margin:0 0 12px;font-weight:600}
  p{margin:0;color:#566074;line-height:1.6}
  @media(prefers-color-scheme:dark){p{color:#99a2b8}}
  .dot{width:44px;height:44px;border-radius:50%;margin:0 auto 20px;
    background:linear-gradient(135deg,#2563eb,#0ea5e9)}
</style></head>
<body><div class="card"><div class="dot"></div><h1>${title}</h1><p>${message}</p></div></body></html>`;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const html = (title: string, msg: string, status = 200) =>
        new Response(page(title, msg), {
            status,
            headers: { "Content-Type": "text/html; charset=utf-8" },
        });

    if (!id) {
        return html("Link non valido", "Il link di disiscrizione non è corretto.", 400);
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return html("Servizio non disponibile", "Riprova più tardi.", 503);
    }

    const { error } = await supabase
        .from("subscribers")
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        return html("Qualcosa è andato storto", "Non è stato possibile disiscriverti. Riprova.", 500);
    }

    return html(
        "Disiscrizione completata",
        "Non riceverai più email. Ci dispiace vederti andare — puoi reiscriverti quando vuoi dal sito."
    );
}
