/**
 * Transactional email via the Resend REST API.
 *
 * We use Resend's HTTP API directly (fetch) instead of the `resend` npm
 * SDK, because the SDK relies on Node APIs that are unavailable on the
 * Cloudflare Workers runtime. fetch is globally available on Workers,
 * same approach we already use for the Bex API (see server/utils/bex.ts).
 *
 * Secrets (via .dev.vars locally, `wrangler secret put` in prod):
 *   RESEND_API_KEY   - "re_xxxxxxxxx"
 *   MAIL_FROM         - sender address, default "hello@elorikids.rs"
 *
 * The sending domain (elorikids.rs) is verified once in the Resend
 * dashboard; any address on it works (hello@, kontakt@, porudzbine@...).
 */
import type { H3Event } from "h3";

export interface MailConfig {
  apiKey: string;
  from: string;
}

/**
 * Read Resend config from the Cloudflare env (production) or process.env
 * (local dev). Returns null if the API key is unset - callers decide how
 * to surface that (we usually log + skip, never block the user action).
 */
export function getMailConfig(event: H3Event): MailConfig | null {
  const cloudflare = (event.context as any).cloudflare;
  const env = cloudflare?.env ?? (globalThis as any).process?.env ?? {};

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    from: env.MAIL_FROM || "hello@elorikids.rs",
  };
}

interface ResendEmailResponse {
  id?: string;
  message?: string;
}

/**
 * Low-level send: POST to Resend. Returns the Resend message id, or
 * throws on non-2xx. Kept generic so all email types go through here.
 */
export async function sendEmail(
  event: H3Event,
  to: string,
  subject: string,
  html: string,
  options?: { from?: string; replyTo?: string; text?: string },
): Promise<string> {
  const config = getMailConfig(event);
  if (!config) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const payload: Record<string, unknown> = {
    from: options?.from ?? config.from,
    to,
    subject,
    html,
  };
  if (options?.replyTo) payload.reply_to = options.replyTo;
  if (options?.text) payload.text = options.text;

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Network failure - retry once.
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error("Resend API is unreachable.");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Resend API error ${res.status}: ${err.message ?? res.statusText}`,
    );
  }

  const data = (await res.json()) as ResendEmailResponse;
  return data.id ?? "unknown";
}

// ── Plain-text fallbacks + shared layout ──────────────────────────

/**
 * Shared email wrapper: branded header/footer around the body HTML.
 * Kept inline so each template is a self-contained function.
 */
function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="sr-Latn">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:Helvetica,Arial,sans-serif;color:#123F73;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);">
        <tr><td style="padding:32px 40px 8px;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#123F73;">elorikids</h1>
        </td></tr>
        <tr><td style="padding:16px 40px 32px;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:24px 40px 32px;background:#123F73;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#a9c7e8;">
            elorikids · Interaktivne knjige za decu<br>
            <a href="https://elorikids.rs" style="color:#a9c7e8;">elorikids.rs</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Newsletter: thank-you for subscribing (no double opt-in) ─────────

export interface NewsletterMailInput {
  email: string;
}

/**
 * Build the "thank you for subscribing" email HTML + plain text.
 */
export function buildNewsletterMail(input: NewsletterMailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Dobrodošli u elorikids porodicu! 📚";
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#123F73;">Zdravo,</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#123F73;">
      Hvala što ste se prijavili na našu newsletter listu. Od sada ćete prvi
      saznati o novim knjigama, akcijama i idejama za učenje kroz igru.
    </p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#123F73;">
      Pratite nas i na Instagramu: <a href="https://instagram.com/elorikids" style="color:#7AB8C5;">@elorikids</a>
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#7a8aa0;">
      Ovaj mejl ste dobili jer ste se prijavili na elorikids.rs sa adresom
      ${input.email}. Ne želite više? Odjavite se odgovorom na ovaj mejl.
    </p>`;
  const text = `Hvala što ste se prijavili na elorikids newsletter.

Od sada ćete prvi saznati o novim knjigama, akcijama i idejama za učenje kroz igru.

Pratite nas: https://instagram.com/elorikids

---
Ovaj mejl ste dobili jer ste se prijavili na elorikids.rs sa adresom ${input.email}.`;
  return { subject, html: emailLayout(subject, bodyHtml), text };
}

// ── Order: confirmation with track number + items ───────────────────

export interface OrderMailItem {
  title: string;
  quantity: number;
  price: number;
}

export interface OrderMailInput {
  customerName: string;
  email: string;
  trackNumber: string;
  items: OrderMailItem[];
  subtotal: number;
  shipping: number;
  grandTotal: number;
  address: string;
  city: string;
  postal: string;
  note?: string | null;
}

function formatRsd(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build the order confirmation email HTML + plain text.
 */
export function buildOrderMail(input: OrderMailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Porudžbina ${input.trackNumber} primljena ✅`;
  const itemRows = input.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef0f4;font-size:15px;color:#123F73;">${escapeHtml(i.title)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eef0f4;font-size:15px;color:#123F73;text-align:center;">${i.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eef0f4;font-size:15px;color:#123F73;text-align:right;">${formatRsd(i.price * i.quantity)}</td>
      </tr>`,
    )
    .join("");

  const totalRows = `
    <tr><td colspan="2" style="padding-top:16px;font-size:14px;color:#7a8aa0;">Međuzbir</td><td style="padding-top:16px;font-size:14px;color:#123F73;text-align:right;">${formatRsd(input.subtotal)}</td></tr>
    <tr><td colspan="2" style="padding:4px 0;font-size:14px;color:#7a8aa0;">Dostava</td><td style="padding:4px 0;font-size:14px;color:#123F73;text-align:right;">${input.shipping === 0 ? "Besplatno" : formatRsd(input.shipping)}</td></tr>
    <tr><td colspan="2" style="padding-top:12px;font-size:17px;font-weight:700;color:#123F73;">Ukupno</td><td style="padding-top:12px;font-size:17px;font-weight:700;color:#123F73;text-align:right;">${formatRsd(input.grandTotal)}</td></tr>`;

  const noteBlock = input.note
    ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#7a8aa0;"><strong>Napomena:</strong> ${escapeHtml(input.note)}</p>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#123F73;">Zdravo ${escapeHtml(input.customerName)},</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#123F73;">
      Vaša porudžbina je uspešno primljena! Hvala na poverenju. Pošiljka se
      sprema i uskoro kreće na put. Plaćanje je pouzećem (gotovinom pri
      preuzimanju).
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#7a8aa0;">Broj porudžbine</p>
    <p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#123F73;">${input.trackNumber}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr style="font-size:12px;color:#7a8aa0;text-transform:uppercase;letter-spacing:.04em;">
          <th style="padding:0 0 8px;text-align:left;font-weight:600;">Knjiga</th>
          <th style="padding:0 0 8px;text-align:center;font-weight:600;">Kom.</th>
          <th style="padding:0 0 8px;text-align:right;font-weight:600;">Cena</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
      <tfoot>
        ${totalRows}
      </tfoot>
    </table>
    <p style="margin:24px 0 8px;font-size:13px;color:#7a8aa0;">Adresa dostave</p>
    <p style="margin:0 0 0;font-size:15px;line-height:1.6;color:#123F73;">
      ${escapeHtml(input.address)}<br>
      ${escapeHtml(input.postal)} ${escapeHtml(input.city)}
    </p>
    ${noteBlock}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#7a8aa0;">
      Praćenje pošiljke: <a href="https://elorikids.rs/track-order?n=${encodeURIComponent(input.trackNumber)}" style="color:#7AB8C5;">elorikids.rs/track-order</a>
    </p>`;

  const itemText = input.items
    .map((i) => `  - ${i.title} × ${i.quantity} — ${formatRsd(i.price * i.quantity)}`)
    .join("\n");

  const text = `Zdravo ${input.customerName},

Vaša porudžbina je uspešno primljena! Hvala na poverenju. Plaćanje je pouzećem (gotovinom pri preuzimanju).

Broj porudžbine: ${input.trackNumber}

Artikli:
${itemText}

Međuzbir: ${formatRsd(input.subtotal)}
Dostava: ${input.shipping === 0 ? "Besplatno" : formatRsd(input.shipping)}
Ukupno: ${formatRsd(input.grandTotal)}

Adresa dostave:
${input.address}
${input.postal} ${input.city}${input.note ? `\nNapomena: ${input.note}` : ""}

Praćenje pošiljke: https://elorikids.rs/track-order?n=${input.trackNumber}`;

  return { subject, html: emailLayout(subject, bodyHtml), text };
}
