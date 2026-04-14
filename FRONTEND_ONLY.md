# Frontend-only deployment (static)

This repo contains a React (Vite) web app under `src/`. It can be deployed as a **static site** with **no backend required**.

## Build

```bash
npm install
npm run build
```

Deploy the generated `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.).

## Run locally

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Backend (optional)

There is an optional API under `server/`, but the frontend does not require it.
If you do deploy `server/`, keep secrets server-side; see `SERVER_BOUNDARIES.md`.

