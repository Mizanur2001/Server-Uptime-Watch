exports.websiteDownTemplate = (name, domain) => {
    const detectedAt = new Date().toLocaleString();

    return `<!doctype html>
    <html lang="en">
    <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>🚨 Website Down Alert</title>

    <style>
        body { margin:0; padding:0; background:#f5f6fa; font-family:Arial, sans-serif; }
        table { border-collapse:collapse; }
        img { border:0; }
        .preheader { display:none !important; opacity:0; visibility:hidden; height:0; width:0; }
    </style>
    </head>

    <body>

    <!-- Preheader -->
    <div class="preheader">Alert: Website ${domain} is DOWN</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
        <tr>
        <td align="center" style="padding:30px 16px;">

            <!-- CARD -->
            <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                style="background:#ffffff; border-radius:14px; box-shadow:0 4px 16px rgba(0,0,0,0.07);">

            <!-- HEADER -->
            <tr>
                <td align="center" style="padding:22px 32px 10px;">
                <div style="font-size:24px; font-weight:700; color:#dc2626;">
                    ⚠️ WEBSITE DOWN ALERT
                </div>
                <div style="font-size:14px; color:#6b7280; margin-top:6px;">
                    A monitored website is currently unreachable.
                </div>
                </td>
            </tr>

            <!-- BODY -->
            <tr>
                <td style="padding:20px 32px; color:#1f2937; font-size:15px; line-height:1.6;">

                <p>Hello Admin,</p>

                <p>
                    The following monitored website has <strong style="color:#dc2626;">stopped responding</strong>.
                    Please take action as soon as possible.
                </p>

                <!-- WEBSITE STATUS BOX -->
                <table width="100%" cellpadding="12"
                        style="background:#f9fafb; border-radius:10px; border:1px solid #e5e7eb; margin:20px 0;">
                    <tr>
                    <td style="font-size:14px;">
                        <strong>Website:</strong> ${domain} <br/>
                        <strong>Mapped Server:</strong> ${name} <br/>
                        <strong>Status:</strong> <span style="color:#dc2626; font-weight:bold;">DOWN</span> <br/>
                        <strong>Detected At:</strong> ${detectedAt}
                    </td>
                    </tr>
                </table>

                <p>
                    This alert will be sent <strong>only once</strong> until the website becomes active again.
                </p>

                <p style="margin-top:22px;">
                    <a href="https://server.martiancorp.in"
                    style="padding:12px 20px; background:#2563eb; color:white; text-decoration:none;
                            border-radius:8px; font-weight:bold; display:inline-block;">
                    Open Monitoring Dashboard
                    </a>
                </p>

                <p style="color:#6b7280; margin-top:20px;">
                    Thank you,<br/>
                    <strong>Website Monitoring System</strong>
                </p>

                </td>
            </tr>

            <!-- FOOTER -->
            <tr>
                <td align="center" style="padding:16px; background:#f3f4f6; color:#6b7280; font-size:12px;">
                You are receiving this email because this website is under your monitoring system.<br/>
                Need help? <a href="mailto:dev@mizanur.in" style="color:#2563eb;">dev@mizanur.in</a>
                </td>
            </tr>

            </table>
            <!-- END CARD -->

        </td>
        </tr>
    </table>
    </body>
    </html>`;
};