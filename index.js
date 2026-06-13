require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/talib", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.command("/chatwithme", async ({ ack, respond, command, client }) => {
  await ack();

  const msg = command.text;
  const userId = command.user_id;

  if (!msg) {
    await respond("Bro type something 😭");
    return;
  }

  const userInfo = await client.users.info({ user: userId });
  const u = userInfo.user;

  const plainTextBody = `
New Slack Message

Message:
${msg}

Sender Info:
-------------------------
Username: ${u.name}
Real Name: ${u.real_name}
Display Name: ${u.profile.display_name}
Email: ${u.profile.email || "No email available"}

Timezone Info:
-------------------------
TZ: ${u.tz}
TZ Label: ${u.tz_label}
TZ Offset: ${u.tz_offset}
`;

  const htmlBody = `
  <html>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f5f5f5; padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:20px;border:1px solid #e0e0e0;">
        <h2 style="margin-top:0;color:#111827;">New Slack Message</h2>

        <h3 style="color:#111827;">Message</h3>
        <p style="white-space:pre-wrap;color:#374151;">${msg}</p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

        <h3 style="color:#111827;">Sender Info</h3>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#4b5563;">Username:</td>
            <td style="padding:4px 0;color:#111827;">${u.name}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#4b5563;">Real Name:</td>
            <td style="padding:4px 0;color:#111827;">${u.real_name}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#4b5563;">Display Name:</td>
            <td style="padding:4px 0;color:#111827;">${u.profile.display_name}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#4b5563;">Email:</td>
            <td style="padding:4px 0;color:#111827;">${u.profile.email || "No email available"}</td>
          </tr>
        </table>

        <h3 style="color:#111827;margin-top:20px;">Timezone Info</h3>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#4b5563;">TZ:</td>
            <td style="padding:4px 0;color:#111827;">${u.tz}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#4b5563;">TZ Label:</td>
            <td style="padding:4px 0;color:#111827;">${u.tz_label}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#4b5563;">TZ Offset:</td>
            <td style="padding:4px 0;color:#111827;">${u.tz_offset}</td>
          </tr>
        </table>
      </div>
    </body>
  </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.MY_EMAIL,
    subject: `Slack message from ${u.real_name || u.name}`,
    text: plainTextBody,
    html: htmlBody
  });

  await respond("Sent that to your email 📩");
  console.log('new email!!!');
});

(async () => {
  await app.start();
})();


(async () => {
  await app.start();
  console.log("bot is running!");
})();