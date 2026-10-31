# LearningAuth

Next.js 16 (App Router) + Tailwind app for learning authentication: username/email + password, then an emailed one-time code (2FA), then a protected dashboard. No database.

```bash
npm install
cp .env.example .env.local   # then set AUTH_SECRET (and SMTP_* for real emails)
npm run dev
```

Demo login: `demo` / `password123`. Without SMTP configured, the code is printed in the dev terminal.

**Read [AUTH_GUIDE.md](AUTH_GUIDE.md) for the full walkthrough.**
