# Pika Repo

A public, mobile-first home for favourite Pika apps. Each card keeps an app icon, a GitHub repository link, and an optional live Cloudflare link together.

## Included

- Public access with no login or PIN
- Attached Pika GitHub artwork used as the app, browser, and home-screen icon
- Six starter Pika repositories
- Add, edit, remove, and search favourites
- GitHub and Cloudflare quick-open buttons
- Installable mobile web app manifest
- Responsive phone, tablet, and desktop layout

Changes made inside the app are saved in that browser using local storage. This keeps the public app safe from anonymous visitors changing the shared source list.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

## Cloudflare

The project includes `wrangler.jsonc` and produces a Cloudflare Worker plus static assets.

```bash
npm ci
npm run deploy
```

For Cloudflare Git integration, use:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`

No environment variables, database, login provider, or PIN are required.
