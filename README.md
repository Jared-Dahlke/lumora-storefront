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
- A storefront OAuth client with read-only / cart scopes. Its **secret stays server-side** — the
  browser never sees it (see [Token BFF](#token-bff) below).

Flow: the browser asks the same-origin token BFF (`GET /api/token`) for an anonymous OAuth token,
then `GET /{projectKey}/product-projections?staged=false&limit=20`. Search/filter/sort are done client-side. Prices come back in cents and are formatted as USD.

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

## Token BFF

The anonymous OAuth grant runs **server-side** in a Netlify Function (`netlify/functions/token.mjs`),
so the client secret never ships in the browser bundle. The SPA `GET`s the same-origin `/api/token`
endpoint (mapped in `netlify.toml`); the function performs the HTTP-Basic `client_credentials` grant
using `CLIENT_SECRET` from the Netlify **runtime** env and returns only the access token.

For local end-to-end testing you need the [Netlify CLI](https://docs.netlify.com/cli/get-started/)
and a gitignored `.env` with `CLIENT_SECRET` (see `.env.example`), then `netlify dev`. Plain
`pnpm dev` serves the SPA but not the function, so token fetches will 404.

## Deploy to Netlify

This repo is deploy-ready. `netlify.toml` sets the build command (`pnpm install && pnpm build`),
publish directory (`dist`), the public `VITE_*` env vars, the functions directory, the `/api/token`
redirect, and the SPA fallback (`/* → /index.html`).

1. In Netlify, **Add new site → Import an existing project** and pick this repo.
2. **Set the runtime env vars** in **Site settings → Environment variables**: `CLIENT_SECRET`
   (required) and, if they differ from the defaults, `CLIENT_ID` / `PROJECT_KEY` / `AUTH_BASE_URL`.
   These are runtime-only and must **not** be committed to `netlify.toml`.
3. Deploy. (Without `CLIENT_SECRET` set, `/api/token` returns 500 and the store can't load — by design.)

---

Powered by [openct](https://openct-api.onrender.com). Demo project.
