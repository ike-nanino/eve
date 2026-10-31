import "server-only";
import nodemailer from "nodemailer";

/**
 * EMAIL DELIVERY
 *
 * Sends the 6-digit code with Nodemailer over SMTP (e.g. Gmail with an App Password).
 *
 * If SMTP is not configured we fall back to printing the code in the terminal
 * running `npm run dev`. That lets you learn the flow before setting up email.
 * Never ship that fallback to production: anyone with log access would see codes.
 */

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendVerificationEmail(to: string, code: string) {
  if (!smtpConfigured()) {
    console.log(
      `\n[DEV] SMTP not configured. Verification code for ${to}: ${code}\n` +
        `      (set SMTP_* in .env.local to send real emails)\n`,
    );
    return;
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = TLS from the start, 587 = STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `Your verification code: ${code}`,
    text: `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you did not try to sign in, change your password.`,
    html: `<p>Your verification code is:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p>
<p>It expires in 10 minutes. If you did not try to sign in, change your password.</p>`,
  });
}

/** Show "d***@gmail.com" on the verify page instead of the full address. */
export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name[0]}${"*".repeat(Math.max(1, name.length - 1))}@${domain}`;
}
