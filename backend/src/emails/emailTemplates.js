const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function createWelcomeEmailTemplate(name, clientURL) {
  const safeName = escapeHtml(name || "there");
  const safeURL = escapeHtml(clientURL);
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Welcome to Messenger</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #09090b !important; }
      .email-card { background-color: #111114 !important; border-color: #27272a !important; }
      .text-primary { color: #fafafa !important; }
      .text-secondary { color: #a1a1aa !important; }
      .text-muted { color: #71717a !important; }
      .box-surface { background-color: #18181b !important; border-color: #27272a !important; }
      .divider { background-color: #27272a !important; }
      .cta-btn { background-color: #fafafa !important; color: #09090b !important; }
    }
    @media only screen and (max-width: 600px) {
      .container-pad { padding: 24px 12px !important; }
      .card-pad { padding: 32px 24px !important; }
    }
  </style>
</head>
<body class="email-bg" style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">

  <!-- Preheader Text (Visible in inbox preview, hidden in email body) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Your Messenger workspace is ready. Connect and start messaging in real time.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-bg" style="background-color: #f8fafc; padding: 48px 16px;" class="container-pad">
    <tr>
      <td align="center">

        <!-- Main Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          
          <tr>
            <td class="card-pad" style="padding: 44px 44px 40px 44px;">

              <!-- Brand Logo Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="left">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 34px; height: 34px; background-color: #0f172a; border-radius: 8px; text-align: center; vertical-align: middle;">
                          <!-- Minimalist Geometric Brand Mark -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                            <tr>
                              <td style="width: 14px; height: 14px; border: 2.5px solid #ffffff; border-radius: 4px 4px 4px 1px;"></td>
                            </tr>
                          </table>
                        </td>
                        <td class="text-primary" style="padding-left: 11px; font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">
                          Messenger
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #0284c7; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 999px;">
                      Account Active
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Headline & Intro -->
              <h1 class="text-primary" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: -0.03em; line-height: 1.25;">
                Welcome to Messenger, ${safeName}.
              </h1>
              <p class="text-secondary" style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.65; color: #475569;">
                Your account has been provisioned and is ready for use. Experience instant, low-latency messaging built for seamless everyday communication.
              </p>

              <!-- Primary CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 36px;">
                <tr>
                  <td align="center" style="border-radius: 9px; background-color: #0f172a;">
                    <a href="${safeURL}" target="_blank" class="cta-btn" style="display: inline-block; padding: 13px 26px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 9px; letter-spacing: -0.01em;">
                      Launch Messenger &nbsp;&rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Structured Onboarding Grid -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="box-surface" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p class="text-muted" style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b;">
                      Recommended Next Steps
                    </p>

                    <!-- Step 1 -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="28" valign="top" style="padding-top: 2px;">
                          <span style="display: inline-block; width: 20px; height: 20px; line-height: 20px; text-align: center; font-size: 11px; font-weight: 700; color: #0f172a; background-color: #e2e8f0; border-radius: 6px;">01</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <p class="text-primary" style="margin: 0 0 2px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Personalize your profile</p>
                          <p class="text-secondary" style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">Upload an avatar so your contacts can recognize you immediately.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="28" valign="top" style="padding-top: 2px;">
                          <span style="display: inline-block; width: 20px; height: 20px; line-height: 20px; text-align: center; font-size: 11px; font-weight: 700; color: #0f172a; background-color: #e2e8f0; border-radius: 6px;">02</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <p class="text-primary" style="margin: 0 0 2px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Connect with people</p>
                          <p class="text-secondary" style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">Search by username to start direct conversations in seconds.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="28" valign="top" style="padding-top: 2px;">
                          <span style="display: inline-block; width: 20px; height: 20px; line-height: 20px; text-align: center; font-size: 11px; font-weight: 700; color: #0f172a; background-color: #e2e8f0; border-radius: 6px;">03</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <p class="text-primary" style="margin: 0 0 2px 0; font-size: 14px; font-weight: 600; color: #0f172a;">Share media effortlessly</p>
                          <p class="text-secondary" style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">Send high-resolution images and files with real-time delivery.</p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div class="divider" style="height: 1px; background-color: #e2e8f0; margin-bottom: 24px;"></div>

              <!-- Security & Fallback Footnote -->
              <p class="text-muted" style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.6; color: #64748b;">
                If you didn’t create this account, you can safely ignore this email or contact our security team.
              </p>
              <p class="text-muted" style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8; word-break: break-all;">
                Direct link: <a href="${safeURL}" style="color: #0284c7; text-decoration: none;">${safeURL}</a>
              </p>

            </td>
          </tr>
        </table>
        <!-- End Main Card -->

        <!-- Minimal Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px;">
          <tr>
            <td style="padding: 24px 8px 0 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" class="text-muted" style="font-size: 12px; color: #94a3b8;">
                    &copy; ${currentYear} Messenger Inc.
                  </td>
                  <td align="right" style="font-size: 12px;">
                    <a href="${safeURL}/privacy" class="text-muted" style="color: #64748b; text-decoration: none; margin-left: 16px;">Privacy</a>
                    <a href="${safeURL}/terms" class="text-muted" style="color: #64748b; text-decoration: none; margin-left: 16px;">Terms</a>
                    <a href="${safeURL}/support" class="text-muted" style="color: #64748b; text-decoration: none; margin-left: 16px;">Support</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}