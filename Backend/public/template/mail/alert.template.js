exports.serverDownTemplate = (name, ip) => {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>🚨 Server Down Alert</title>

  <style>
    body { margin:0; padding:0; }
    table { border-collapse:collapse; }
    img { border:0; }
    .preheader { display:none !important; opacity:0; visibility:hidden; height:0; width:0; }
  </style>
</head>

<body style="margin:0; padding:0; background:#f5f6fa; font-family:Arial, sans-serif;">

  <!-- Preheader -->
  <div class="preheader">Alert: A monitored server is down (${name} - ${ip})</div>

  <table role="presentation" width="100%" bgcolor="#f5f6fa" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 16px;">

        <!-- Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" 
               style="background:#ffffff; border-radius:14px; box-shadow:0 4px 16px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:24px 32px 10px 32px;">
              <div style="font-size:24px; font-weight:700; color:#dc2626;">
                ⚠️ SERVER DOWN ALERT
              </div>
              <div style="font-size:14px; color:#6b7280; margin-top:4px;">
                Immediate attention required for one of your monitored servers.
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px 32px; color:#1f2937; font-size:15px; line-height:1.6;">
              
              <p>Hi Admin,</p>

              <p>
                Your server has <strong style="color:#dc2626;">gone offline</strong> and is not responding.
              </p>

              <table width="100%" style="margin:18px 0; background:#f9fafb; border-radius:10px; border:1px solid #e5e7eb;" cellpadding="10">
                <tr>
                  <td style="font-size:14px;">
                    <strong>Server Name:</strong> ${name} <br/>
                    <strong>IP Address:</strong> ${ip} <br/>
                    <strong>Status:</strong> <span style="color:#dc2626; font-weight:bold;">DOWN</span> <br/>
                    <strong>Detected At:</strong> ${new Date().toLocaleString()}
                  </td>
                </tr>
              </table>

              <p>
                Please investigate the issue. This alert will only be sent <strong>once</strong> 
                until the server comes back online.
              </p>

              <p style="margin-top:20px;">
                <a href="https://server.martiancorp.in"
                   style="padding:10px 18px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; font-weight:bold;">
                  Open Monitoring Dashboard
                </a>
              </p>

              <p style="color:#6b7280; margin-top:18px;">
                Thank you,<br/>
                <strong>Server Monitoring System</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:16px; background:#f3f4f6; color:#6b7280; font-size:12px;">
              You received this notification because this server is under monitoring.<br/>
              Need help? <a href="mailto:dev@mizanur.in" style="color:#2563eb;">dev@mizanur.in</a>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
};
