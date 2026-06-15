# Lumora Storefront

A premium health/wellness storefront SPA — clean, minimal, Apple-meets-wellness. Built with **Vite + React + TypeScript**, talking to a live **openct** backend (an API-compatible commercetools clone).

![Lumora](https://img.shields.io/badge/Vite-React%20%2B%20TS-0E7C7B)

## What it is

- **Home** — sticky translucent header, a Stelo-style hero, a "why Lumora" section, and a live product grid with category-filter chips and client-side search.
- **Product detail** (`/product/:slug`) — large image, price, description, add-to-cart, and trust badges.
- **Cart drawer** — slides in from the right, quantity steppers, subtotal, and a (demo) checkout that shows an order-confirmation state.
- **Robust by design** — the backend runs on Render's free tier and cold-starts. On first load Lumora shows a branded "Waking up the store…" screen, fires warm-up pings, and retries the token fetch with backoff. Remote product images that fail swap to an on-brand gradient placeholder, so nothing ever looks broken.

## Live backend

The app ships pointed at a live demo backend (no setup required):

- **API:** `https://openct-api.onrender.com`
- **Auth:** `https://openct-auth.onrender.com`
- **Project key:** `openct-dev`
- Storefront OAuth client with read-only / cart scopes (safe to ship in the SPA for this demo).

Flow: get an anonymous OAuth token, then `GET /{projectKey}/product-projections?staged=false&limit=20`. Search/filter/sort are done client-side. Prices come back in cents and are formatted as USD.

> Note: the first load can take 20–50s while Render wakes the free-tier services. That's expected — the loading screen explains it.

## Run locally

Requires Node 18+ and [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev      # http://localhost:5173
```

Build for production:

```bash
pnpm build
pnpm preview
```

## Configuration

Everything defaults to the live demo backend, so no `.env` is needed. To point at a different openct deployment, copy `.env.example` to `.env` and edit the `VITE_*` values.

## Deploy to Netlify

This repo is deploy-ready. `netlify.toml` already sets the build command (`pnpm install && pnpm build`), publish directory (`dist`), the `VITE_*` env vars, and an SPA redirect (`/* → /index.html`).

1. In Netlify, **Add new site → Import an existing project** and pick this repo.
2. Netlify reads `netlify.toml` automatically — no manual config needed.
3. Deploy.

---

Powered by [openct](https://openct-api.onrender.com). Demo project.
