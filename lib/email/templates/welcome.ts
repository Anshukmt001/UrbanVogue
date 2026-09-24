export const WELCOME_EMAIL_SUBJECT =
  "Welcome to Urban Vogue — Your Early Access Is Confirmed";

export interface WelcomeEmailTemplateInput {
  name: string;
  memberId: number;
  discount: number;
  passUrl?: string;
  qrCode?: string;
}

export interface WelcomeEmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const BRAND = "URBAN VOGUE";
const INSTAGRAM_HANDLE = "@urban_vogue_kct";
const INSTAGRAM_URL = "https://www.instagram.com/urban_vogue_kct/";
const CITY_LINE = "KUCHAMAN CITY, RAJASTHAN";
const EST_LINE = "EST. 2026";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function memberIdLabel(memberId: number): string {
  return `UV-${String(memberId).padStart(3, "0")}`;
}

function isRenderableImage(value: string): boolean {
  return value.startsWith("data:image/") || /^https?:\/\//i.test(value);
}

export function buildWelcomeEmail(
  input: WelcomeEmailTemplateInput
): WelcomeEmailTemplate {
  const name = input.name.trim();
  const displayName = name.length > 0 ? name : "Member";
  const memberLabel = memberIdLabel(input.memberId);
  const discount = Math.round(input.discount);
  const passUrl = input.passUrl?.trim();
  const qrImage =
    input.qrCode && isRenderableImage(input.qrCode.trim())
      ? input.qrCode.trim()
      : null;

  const safeName = escapeHtml(displayName);
  const safeMemberLabel = escapeHtml(memberLabel);

  const preheader =
    "Your Early Access membership is confirmed — open your pass to see your discount.";

  const passButton = passUrl
    ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" bgcolor="#F5F5F5" style="border-radius:2px;">
                    <a href="${escapeHtml(passUrl)}" style="display:inline-block;padding:16px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0A0A0A;text-decoration:none;">View My Early Access Pass</a>
                  </td>
                </tr>
              </table>`
    : "";

  const qrBlock = qrImage
    ? `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding:8px 0 0;">
                  <img src="${escapeHtml(qrImage)}" width="150" height="150" alt="Urban Vogue member QR code" style="display:block;width:150px;height:150px;border:0;background:#FFFFFF;padding:10px;" />
                </td>
              </tr>
            </table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>${escapeHtml(WELCOME_EMAIL_SUBJECT)}</title>
<style>
  @media only screen and (max-width: 600px) {
    .uv-container { width: 100% !important; }
    .uv-padding { padding-left: 24px !important; padding-right: 24px !important; }
    .uv-hero { font-size: 30px !important; line-height: 34px !important; }
    .uv-discount { font-size: 46px !important; }
    .uv-cta a { display: block !important; width: 100% !important; box-sizing: border-box; }
  }
</style>
</head>
<body bgcolor="#0A0A0A" style="margin:0;padding:0;background:#0A0A0A;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0A0A0A">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <!--[if mso]>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td>
      <![endif]-->
      <table role="presentation" class="uv-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#101010;border:1px solid #262626;">
        <tr>
          <td class="uv-padding" style="padding:36px 40px 28px;border-bottom:1px solid #262626;">
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:20px;line-height:24px;font-weight:700;letter-spacing:0.34em;color:#FFFFFF;text-transform:uppercase;">
              Urban <span style="color:#C9A86A;">Vogue</span>
            </p>
            <p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:12px;font-style:italic;letter-spacing:0.24em;color:#A3A3A3;text-transform:uppercase;">
              ${EST_LINE} &nbsp;·&nbsp; Early Access
            </p>
          </td>
        </tr>
        <tr>
          <td class="uv-padding" style="padding:44px 40px 8px;">
            <p style="margin:0 0 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.32em;color:#C9A86A;text-transform:uppercase;">
              You are in
            </p>
            <h1 class="uv-hero" style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:34px;line-height:38px;font-weight:700;letter-spacing:0.06em;color:#FFFFFF;text-transform:uppercase;">
              Welcome, ${safeName}
            </h1>
            <p style="margin:22px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:25px;color:#A3A3A3;">
              Thank you for becoming one of the first members of the Urban Vogue community.
            </p>
          </td>
        </tr>
        <tr>
          <td class="uv-padding" style="padding:32px 40px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #2E2E2E;background:#0A0A0A;">
              <tr>
                <td style="padding:28px 28px 30px;text-align:center;">
                  <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.34em;color:#A3A3A3;text-transform:uppercase;">
                    Early Access Member
                  </p>
                  <p class="uv-discount" style="margin:16px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:54px;line-height:56px;font-weight:700;letter-spacing:0.02em;color:#FFFFFF;">
                    ${discount}% <span style="color:#C9A86A;">OFF</span>
                  </p>
                  <p style="margin:18px 0 0;width:64px;height:1px;background:#C9A86A;font-size:0;line-height:0;">&nbsp;</p>
                  <p style="margin:18px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.22em;color:#A3A3A3;text-transform:uppercase;">
                    Member ID
                  </p>
                  <p style="margin:8px 0 0;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:17px;letter-spacing:0.14em;color:#F5F5F5;">
                    ${safeMemberLabel}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="uv-padding" style="padding:28px 40px 4px;">
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:25px;color:#A3A3A3;">
              Keep your Early Access Pass safe. Present it at the Urban Vogue store,
              Kuchaman City, when you claim your benefit — your membership number and
              discount are linked to it.
            </p>
          </td>
        </tr>
        ${passButton ? `
        <tr>
          <td class="uv-padding uv-cta" style="padding:30px 40px 6px;text-align:center;">${passButton}
          </td>
        </tr>` : ""}
        ${qrBlock}
        <tr>
          <td class="uv-padding" style="padding:36px 40px 12px;">
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:22px;color:#6B6B6B;">
              This pass is unique to you. Do not share it — discounts are redeemed
              against your membership.
            </p>
          </td>
        </tr>
        <tr>
          <td class="uv-padding" style="padding:24px 40px 40px;border-top:1px solid #262626;">
            <p style="margin:24px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.3em;color:#A3A3A3;text-transform:uppercase;">
              ${EST_LINE}
            </p>
            <p style="margin:10px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.3em;color:#A3A3A3;text-transform:uppercase;">
              ${CITY_LINE}
            </p>
            <p style="margin:14px 0 0;">
              <a href="${INSTAGRAM_URL}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.16em;color:#C9A86A;text-decoration:none;">${INSTAGRAM_HANDLE}</a>
            </p>
          </td>
        </tr>
      </table>
      <!--[if mso]>
      </td></tr></table>
      <![endif]-->
      <p style="margin:20px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.2em;color:#5A5A5A;text-transform:uppercase;">
        ${BRAND} · Early Access 2026
      </p>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    BRAND,
    `${EST_LINE} · ${CITY_LINE}`,
    "",
    `WELCOME, ${displayName.toUpperCase()}`,
    "",
    "Thank you for becoming one of the first members of the Urban Vogue community.",
    "",
    "EARLY ACCESS MEMBER",
    `${discount}% OFF`,
    `Member ID: ${memberLabel}`,
    "",
    "Keep your Early Access Pass safe. Present it at the Urban Vogue store,",
    "Kuchaman City, when you claim your benefit — your membership number and",
    "discount are linked to it.",
    "",
    ...(passUrl ? [`View my early access pass: ${passUrl}`, ""] : []),
    `Instagram: ${INSTAGRAM_HANDLE} (${INSTAGRAM_URL})`,
  ].join("\n");

  return { subject: WELCOME_EMAIL_SUBJECT, html, text };
}
