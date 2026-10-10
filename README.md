# crypto-education-landing-page

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_03UgCwL51lhFFoIZzdKice4jT3hl)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

## Telegram bot

The free-guide bot (@RutaCriptoSeguraBot) runs inside this project as a webhook (`app/api/telegram/*`, code in `lib/bot`). Setup, deployment, secure PDF upload and the test plan: [docs/TELEGRAM_BOT.md](docs/TELEGRAM_BOT.md) (Russian). Environment variable names: `.env.example`. Tests: `pnpm run test:bot` and `pnpm build && pnpm run test:bot:e2e`.
