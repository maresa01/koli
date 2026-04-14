# Koli — deployment (frontend-only)

This project is a **static React (Vite) web app**. There is **no backend** in this repo anymore.

## Local run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Deploy the generated `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.). See `FRONTEND_ONLY.md`.

## Railway (Node service)

If you deploy as a **Railway Web Service** (not static), the repo includes `index.mjs` + `railway.toml` so Railway can run `node index.mjs` after `npm run build`. Push the latest commit, then redeploy.