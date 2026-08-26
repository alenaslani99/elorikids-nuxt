/**
 * Transactional email via the Resend REST API.
 *
 * We use Resend's HTTP API directly (fetch) instead of the `resend` npm
 * SDK, because the SDK relies on Node APIs that are unavailable on the
 * Cloudflare Workers runtime. fetch is globally available on Workers,
 * same approach we already use for the Bex API (see server/utils/bex.ts).
 *
 * Email templates are kept in /email-templates/*.html as the visual
 * design reference, and inlined here as string constants (the originals
 * used the same approach). Templates use {{TOKEN}} placeholders that the
 * builders below fill with real order/newsletter data before sending.
 *
 * Secrets (via .dev.vars locally, `wrangler secret put` in prod):
 *   RESEND_API_KEY   - "re_xxxxxxxxx"
 *   MAIL_FROM         - sender address, default "hello@elorikids.rs"
 *
 * The sending domain (elorikids.rs) is verified once in the Resend
 * dashboard; any address on it works (hello@, kontakt@, porudzbine@...).
 */
import type { H3Event } from "h3";

// ── Email templates (inlined) ────────────────────────────────────────
// These mirror /email-templates/*.html (the design reference). Kept here
// as string constants so they ship in the Cloudflare worker bundle with
// no build plugins or runtime file access. {{TOKEN}} placeholders are
// filled by the builders below.

const newsletterTemplate = `<!doctype html>
<html lang="sr-Latn" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-scheme" content="light only">
  <title>Dobrodošli u elorikids porodicu</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;700;800&display=swap" rel="stylesheet">
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    /* Force light mode: prevent iOS/Apple Mail dark-mode auto-inversion */
    :root { color-scheme: light only; supported-color-schemes: light only; }
    html { background:#FFFDF7; }
    table { border-collapse: collapse; }
    img { display: block; border: 0; outline: 0; }
    a { text-decoration: none; }
    .body { min-width: 100% !important; }
    body, table, td, p, span, a, strong, em, h1, h2, h3, div, center, th {
      font-family: 'Unbounded', 'Helvetica Neue', Arial, sans-serif;
    }
    @media (min-width: 640px) { .shell { width: 560px !important; } }
    .ig-btn { transition: background .2s ease, color .2s ease; }
    .ig-btn:hover { background:#F06A3A !important; color:#FFFFFF !important; }
    .ig-btn:hover .ig-icon { stroke:#FFFFFF !important; }
    .btn .arrow { display: inline-block; transition: transform .2s ease; }
    .btn:hover .arrow { transform: translateX(4px); }
  </style>
</head>
<body style="margin:0;padding:0;background:#FFFDF7;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;color:#123F73;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#FFFDF7;line-height:1px;">
    Hvala što ste se prijavili! Od sada ćete prvi saznati o novim knjigama i akcijama.
    &#847; z&#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF7;padding:24px 16px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
    <tr>
      <td align="center" style="font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" class="shell" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(18,63,115,.08);font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
          <tr>
            <td style="padding:36px 28px 32px;background:#123F73;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
              <p style="margin:0 0 28px;font-size:24px;font-weight:800;letter-spacing:-.02em;">
                <img src="https://elorikids.rs/logo.png" alt="elorikids" height="40" style="display:block;height:40px;width:auto;max-width:100%;border:0;">
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:56px;height:56px;border-radius:14px;background:rgba(255,200,61,.2);text-align:center;vertical-align:middle;">
                    <img src="https://elorikids.rs/mail-envelope.png" width="28" height="28" alt="" style="display:inline-block;vertical-align:middle;">
                  </td>
                </tr>
              </table>
              <h1 style="margin:18px 0 0;font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-.02em;line-height:1.2;">Dobrodošli!</h1>
              <p style="margin:8px 0 0;font-size:15px;font-weight:400;line-height:1.5;color:#B9E3F8;">Budite u toku sa novim knjigama i akcijama.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px;background:#FFFFFF;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
              <p style="margin:0 0 16px;font-size:16px;font-weight:400;line-height:1.65;color:#123F73;">Zdravo,</p>
              <p style="margin:0 0 16px;font-size:16px;font-weight:400;line-height:1.65;color:#123F73;">
                Hvala što ste se prijavili na našu newsletter listu. Od sada ćete
                <strong style="color:#123F73;">prvi saznati</strong> o novim knjigama,
                popustima i besplatnim aktivnostima za decu.
              </p>
              <p style="margin:0 0 28px;font-size:16px;font-weight:400;line-height:1.65;color:rgba(18,63,115,.7);">
                Naše knjige su piši-briši - dete vežba bezbroj puta, a učenje
                dolazi prirodno kroz igru.
              </p>
              <p style="margin:0 0 14px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#7a8aa0;">Zašto elorikids</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td valign="top" style="width:49%;background:#FFFFFF;border:2px solid #C7D9EA;border-radius:16px;padding:18px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;height:40px;border-radius:12px;background:rgba(37,135,232,.1);text-align:center;vertical-align:middle;">
                          <img src="https://elorikids.rs/mail-book.png" width="22" height="22" alt="" style="display:inline-block;vertical-align:middle;">
                        </td>
                      </tr>
                    </table>
                    <p style="margin:10px 0 4px;font-size:15px;font-weight:700;color:#123F73;">Piši-briši</p>
                    <p style="margin:0;font-size:13px;font-weight:400;line-height:1.5;color:rgba(18,63,115,.7);">Laminirane, vodootporne stranice.</p>
                  </td>
                  <td style="width:2%;font-size:0;line-height:0;">&nbsp;</td>
                  <td valign="top" style="width:49%;background:#FFFFFF;border:2px solid #C7D9EA;border-radius:16px;padding:18px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;height:40px;border-radius:12px;background:rgba(117,214,177,.15);text-align:center;vertical-align:middle;">
                          <img src="https://elorikids.rs/mail-calendar.png" width="22" height="22" alt="" style="display:inline-block;vertical-align:middle;">
                        </td>
                      </tr>
                    </table>
                    <p style="margin:10px 0 4px;font-size:15px;font-weight:700;color:#123F73;">Kroz igru</p>
                    <p style="margin:0;font-size:13px;font-weight:400;line-height:1.5;color:rgba(18,63,115,.7);">Učenje dolazi prirodno, kroz zabavu.</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
                <tr>
                  <td align="center" style="padding:0;">
                    <!--[if mso]>
                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" href="https://elorikids.rs" style="height:52px;" strokecolor="#FFC83D" fillcolor="#FFC83D">
                      <w:anchorlock/>
                      <center style="font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;font-size:16px;font-weight:700;color:#123F73;">Pogledaj knjige →</center>
                    </v:rect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="https://elorikids.rs" class="btn" style="display:inline-block;box-sizing:border-box;width:100%;max-width:280px;background:#FFC83D;border-radius:999px;padding:16px 28px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;font-size:16px;font-weight:700;color:#123F73;text-align:center;text-decoration:none;">Pogledaj knjige <span class="arrow">&rarr;</span></a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
              <p style="margin:8px 0 0;font-size:14px;font-weight:400;line-height:1.5;color:rgba(18,63,115,.7);">
                Pratite nas i na Instagramu - tu delimo ideje i popuste.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 0;">
                <tr>
                  <td align="center" style="padding:0;">
                    <a href="https://instagram.com/elorikids" class="ig-btn" style="display:inline-block;box-sizing:border-box;width:100%;max-width:280px;background:#FFFFFF;border:2px solid #F06A3A;border-radius:999px;padding:13px 28px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:700;color:#F06A3A;text-align:center;text-decoration:none;">
                      <img src="https://elorikids.rs/mail-instagram.png" width="18" height="18" alt="" style="display:inline-block;vertical-align:middle;margin-right:8px;">@elorikids
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 32px;background:#0A315E;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:400;line-height:1.6;color:rgba(199,217,234,.6);">
                Ovaj mejl ste dobili jer ste se prijavili na elorikids.rs sa adresom
                <strong style="color:#B9E3F8;">{{EMAIL}}</strong>.<br>
                Bez spama. Odjava u svakom trenutku - odgovorite na ovaj mejl.
              </p>
              <p style="margin:12px 0 0;font-size:11px;font-weight:400;color:rgba(199,217,234,.5);">
                © 2026 elorikids · <a href="https://elorikids.rs" style="color:#75D6B1;">elorikids.rs</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const orderTemplate = `<!doctype html>
<html lang="sr-Latn" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-scheme" content="light only">
  <title>Porudžbina {{TRACK_NUMBER}} primljena</title>
  <!-- Unbounded loads in Apple Mail / iOS / Thunderbird; Gmail & Outlook
       strip <link> and fall back to Roboto (Gmail's built-in geometric
       sans), then Helvetica/Arial. The layout below is designed to look
       intentional with any of these — brand identity is carried by color
       blocks, weight hierarchy, and uppercase tracking, not by the font's
       letter shapes. The logo image guarantees the wordmark in Unbounded
       everywhere. -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;700;800&display=swap" rel="stylesheet">
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    /* Force light mode: prevent iOS/Apple Mail dark-mode auto-inversion */
    :root { color-scheme: light only; supported-color-schemes: light only; }
    html { background:#FFFDF7; }
    table { border-collapse: collapse; }
    img { display: block; border: 0; outline: 0; }
    a { text-decoration: none; }
    body, table, td, p, span, a, strong, em, h1, h2, h3, div, center, th {
      font-family: 'Unbounded', 'Helvetica Neue', Arial, sans-serif;
    }
    @media (max-width: 420px) { .qty, .price { text-align: right; } }
    @media (min-width: 640px) { .shell { width: 560px !important; } }
    .btn .arrow { display: inline-block; transition: transform .2s ease; }
    .btn:hover .arrow { transform: translateX(4px); }
  </style>
</head>
<body style="margin:0;padding:0;background:#FFFDF7;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;color:#123F73;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#FFFDF7;line-height:1px;">
    Hvala na poverenju! Vaša porudžbina je primljena i sprema se za slanje. Plaćanje je pouzećem.
    &#847; z&#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF7;padding:24px 16px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
    <tr>
      <td align="center" style="font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" class="shell" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(18,63,115,.08);font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
          <tr>
            <td style="padding:30px 28px 26px;background:#123F73;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
              <p style="margin:0;font-size:24px;font-weight:800;letter-spacing:-.01em;">
                <img src="https://elorikids.rs/logo.png" alt="elorikids" height="40" style="display:block;height:40px;width:auto;max-width:100%;border:0;">
              </p>
              <p style="margin:6px 0 0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#B9E3F8;">Potvrda porudžbine</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0;background:#123F73;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
              <div style="height:3px;line-height:3px;font-size:0;background:#FFC83D;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#B9E3F8;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
                <tr>
                  <td align="center" style="padding:36px 28px 28px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:60px;height:60px;border-radius:50%;background:#75D6B1;text-align:center;vertical-align:middle;box-shadow:0 4px 14px rgba(18,63,115,.12);">
                          <img src="https://elorikids.rs/mail-check.png" width="32" height="32" alt="" style="display:inline-block;vertical-align:middle;">
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin:14px 0 0;font-size:22px;font-weight:800;color:#123F73;letter-spacing:-.02em;line-height:1.25;">Porudžbina primljena!</h1>
                    <p style="margin:8px 0 0;font-size:14px;font-weight:400;line-height:1.5;color:#0A315E;">
                      <img src="https://elorikids.rs/mail-package.png" width="18" height="18" alt="" style="display:inline-block;vertical-align:middle;margin-right:6px;">Pošiljka se sprema i uskoro kreće na put.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px;background:#FFFFFF;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
              <p style="margin:0 0 14px;font-size:16px;font-weight:400;line-height:1.6;color:#123F73;">Zdravo <strong>{{CUSTOMER_NAME}}</strong>,</p>
              <p style="margin:0 0 28px;font-size:15px;font-weight:400;line-height:1.65;color:rgba(18,63,115,.7);">
                Vaša porudžbina je uspešno primljena! Hvala na poverenju. Plaćanje je
                <strong style="color:#F06A3A;">pouzećem</strong> — gotovinom pri preuzimanju.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#B9E3F8;border-radius:14px;margin:0 0 28px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
                <tr>
                  <td style="padding:16px 20px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#0A315E;">Broj porudžbine</p>
                    <p style="margin:0;font-size:20px;font-weight:800;color:#123F73;letter-spacing:-.01em;">{{TRACK_NUMBER}}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 14px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#7a8aa0;">Vaše knjige</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
                <thead>
                  <tr style="font-size:10px;color:#7a8aa0;text-transform:uppercase;letter-spacing:.08em;">
                    <th style="padding:0 0 10px;text-align:left;font-weight:600;">Knjiga</th>
                    <th class="qty" style="padding:0 0 10px;text-align:center;font-weight:600;">Kom.</th>
                    <th class="price" style="padding:0 0 10px;text-align:right;font-weight:600;">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  {{ITEM_ROWS}}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:14px 0 0;font-size:14px;font-weight:400;color:#7a8aa0;">Međuzbir</td>
                    <td style="padding:14px 0 0;font-size:14px;font-weight:400;color:#123F73;text-align:right;">{{SUBTOTAL}}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:6px 0;font-size:14px;font-weight:400;color:#7a8aa0;">Dostava</td>
                    <td style="padding:6px 0;font-size:14px;font-weight:400;color:#123F73;text-align:right;">{{SHIPPING}}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:12px 0 0;border-top:2px solid #123F73;font-size:18px;font-weight:800;color:#123F73;">Ukupno</td>
                    <td style="padding:12px 0 0;border-top:2px solid #123F73;font-size:18px;font-weight:800;color:#123F73;text-align:right;">{{GRAND_TOTAL}}</td>
                  </tr>
                </tfoot>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;background:#FFFFFF;border:2px solid #C7D9EA;border-radius:14px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
                <tr>
                  <td style="padding:18px 20px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#7a8aa0;">Adresa dostave</p>
                    <p style="margin:0;font-size:15px;font-weight:400;line-height:1.6;color:#123F73;">
                      {{ADDRESS}}<br>
                      {{CITY_LINE}}
                    </p>
                    <p style="margin:10px 0 0;font-size:14px;font-weight:400;line-height:1.55;color:#123F73;">
                      <img src="https://elorikids.rs/mail-phone.png" width="14" height="14" alt="" style="display:inline-block;vertical-align:-2px;margin-right:6px;">{{PHONE}}
                    </p>
                    {{NOTE_BLOCK}}
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                <tr>
                  <td align="center" style="padding:0;">
                    <!--[if mso]>
                    <v:rect xmlns:v="urn:schemas-microsoft-com:vml" href="{{TRACK_URL}}" style="height:52px;" strokecolor="#2587E8" fillcolor="#2587E8">
                      <w:anchorlock/>
                      <center style="font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;font-size:16px;font-weight:700;color:#FFFFFF;">Prati pošiljku →</center>
                    </v:rect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{TRACK_URL}}" class="btn" style="display:inline-block;box-sizing:border-box;width:100%;max-width:280px;background:#2587E8;border-radius:999px;padding:16px 28px;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-align:center;text-decoration:none;">Prati pošiljku <span class="arrow">&rarr;</span></a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 32px;background:#0A315E;font-family:'Unbounded','Roboto','Helvetica Neue',Arial,sans-serif;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:400;line-height:1.6;color:rgba(199,217,234,.6);">
                Dobili ste ovaj mejl jer je porudžbina
                <strong style="color:#B9E3F8;">{{TRACK_NUMBER}}</strong> napravljena sa ovom adresom.<br>
                Za pitanja i odgovore pišite na
                <a href="mailto:pozdrav@elorikids.rs" style="color:#75D6B1;">pozdrav@elorikids.rs</a>.
              </p>
              <p style="margin:12px 0 0;font-size:11px;font-weight:400;color:rgba(199,217,234,.5);">
                © 2026 elorikids · <a href="https://elorikids.rs" style="color:#75D6B1;">elorikids.rs</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

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

// ── Helpers ──────────────────────────────────────────────────────────

/** Format an amount in RSD using Serbian locale (no decimals). */
function formatRsd(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Escape user-provided text for safe HTML insertion. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Replace {{TOKEN}} placeholders in a template string.
 * Tokens are case-sensitive, uppercase, wrapped in double braces.
 */
function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? "");
}

// ── Newsletter: thank-you for subscribing (no double opt-in) ─────────

export interface NewsletterMailInput {
  email: string;
}

/**
 * Build the "thank you for subscribing" email from the HTML template.
 */
export function buildNewsletterMail(input: NewsletterMailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Dobrodošli u elorikids porodicu";

  const html = fillTemplate(newsletterTemplate, {
    EMAIL: escapeHtml(input.email),
  });

  const text = `Hvala što ste se prijavili na elorikids newsletter.

Od sada ćete prvi saznati o novim knjigama, akcijama i idejama za učenje kroz igru.

Pratite nas: https://instagram.com/elorikids

---
Ovaj mejl ste dobili jer ste se prijavili na elorikids.rs sa adresom ${input.email}.`;

  return { subject, html, text };
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
  phone: string;
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

/**
 * Build the order confirmation email from the HTML template.
 */
export function buildOrderMail(input: OrderMailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Porudžbina ${input.trackNumber} primljena`;

  // Item rows for the <tbody>
  const itemRows = input.items
    .map(
      (i) => `                  <tr>
                    <td style="padding:12px 0;border-top:1px solid #eef0f4;font-size:15px;font-weight:400;color:#123F73;">${escapeHtml(i.title)}</td>
                    <td class="qty" style="padding:12px 0;border-top:1px solid #eef0f4;font-size:15px;font-weight:400;color:#123F73;text-align:center;">${i.quantity}</td>
                    <td class="price" style="padding:12px 0;border-top:1px solid #eef0f4;font-size:15px;font-weight:400;color:#123F73;text-align:right;">${formatRsd(i.price * i.quantity)}</td>
                  </tr>`,
    )
    .join("\n");

  // Note block - only rendered if the customer left a note
  const noteBlock = input.note
    ? `                    <p style="margin:12px 0 0;font-size:14px;font-weight:400;line-height:1.55;color:rgba(18,63,115,.7);">
                      <strong style="color:#123F73;">Napomena:</strong> ${escapeHtml(input.note)}
                    </p>`
    : "";

  const trackUrl = `https://elorikids.rs/track-order?id=${encodeURIComponent(input.trackNumber)}`;

  const html = fillTemplate(orderTemplate, {
    TRACK_NUMBER: escapeHtml(input.trackNumber),
    CUSTOMER_NAME: escapeHtml(input.customerName),
    ITEM_ROWS: itemRows,
    SUBTOTAL: formatRsd(input.subtotal),
    SHIPPING: input.shipping === 0 ? "Besplatno" : formatRsd(input.shipping),
    GRAND_TOTAL: formatRsd(input.grandTotal),
    ADDRESS: escapeHtml(input.address),
    CITY_LINE: `${escapeHtml(input.postal)} ${escapeHtml(input.city)}`,
    PHONE: escapeHtml(input.phone),
    NOTE_BLOCK: noteBlock,
    TRACK_URL: trackUrl,
  });

  const itemText = input.items
    .map((i) => `  - ${i.title} × ${i.quantity} - ${formatRsd(i.price * i.quantity)}`)
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
${input.postal} ${input.city}
Telefon: ${input.phone}${input.note ? `\nNapomena: ${input.note}` : ""}

Praćenje pošiljke: ${trackUrl}`;

  return { subject, html, text };
}
