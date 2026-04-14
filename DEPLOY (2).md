# Koli MVP — beta deployment (web)

## Important: “your-domain” is not a real website

Names like **https://api.your-domain...**, **https://your-api-host**, and **https://your-frontend-host** in this file are *placeholders*. They will *not open in a browser* until you:

1. *Deploy* the API (e.g. Render, Railway, Fly.io) and copy the *real* URL the platform gives you (often something like https://koli-api.onrender.com), *or*
2. Run the API *on your computer* and use **http://127.0.0.1:3001** (local only, not HTTPS).

*Quick local check (no cloud):*

npm run dev:api

Then open **http://127.0.0.1:3001/health** or **http://127.0.0.1:3001/api/health** in your browser. You should see JSON like { "ok": true, "service": "koli-api", ... }.

---

There is *no separate native mobile app* in this repo. Beta testers on phones use the *responsive web app* (add to Home Screen if you want an app-like shortcut).

## Architecture (recommended for external beta)

1. *Static frontend* — stable https:// URL (Vercel, Netlify, Cloudflare Pages, S3+CloudFront, etc.).
2. *API service* — stable https:// URL (Render, Fly.io, Railway, Google Cloud Run, etc.) running server/index.mjs.
3. *Environment* — frontend built with VITE_API_BASE_URL pointing at the API origin (no trailing slash).

Auth and tasks today remain *local (browser storage)*. The API provides *connectivity, CORS, rate limits, and a place to grow* real endpoints later.

## Put the project on GitHub (for Render, Vercel, etc.)

Render needs a *Git* remote (usually GitHub). Your *repository root* must be the folder that has **server/** next to **src/** and the root **package.json** (in this project that is the inner Koli_app folder: …/Downloads/Koli_app/Koli_app/, not the parent Downloads/Koli_app unless you only keep one level).

Confirm these paths exist at the *top level* of what you push:

- server/package.json
- server/index.mjs

### 1. Install Git (if git is not recognized)

- Windows: install *[Git for Windows](https://git-scm.com/download/win)*.
- Restart the terminal (or VS Code / Cursor), then run git --version — it should print a version.

### 2. Create an empty repo on GitHub

1. Log in to [github.com](https://github.com) → *New repository*.
2. Name it (e.g. koli-app).
3. Leave *no* README, *no* .gitignore, *no* license (avoids merge noise on first push).
4. Create the repository. Copy the URL GitHub shows, e.g. https://github.com/YOUR_USER/koli-app.git.

### 3. Initialize Git and push from your project folder

In PowerShell or Git Bash, *cd into the repo root* (the folder that contains server and package.json):

cd path\to\Koli_app\Koli_app

git init
git branch -M main
git add .
git status
git commit -m "Initial commit: Koli web app and API server folder"
git remote add origin https://github.com/YOUR_USER/koli-app.git
git push -u origin main

If GitHub asks for a password, use a *[Personal Access Token](https://github.com/settings/tokens)* (not your account password), or sign in with *Git Credential Manager* when prompted.

### 4. Optional: GitHub Desktop

Install [GitHub Desktop](https://desktop.github.com/), *Add* → *Add Existing Repository* → choose the same Koli_app folder → *Publish repository*.

After this, in Render you can *connect* that GitHub repo and set *Root Directory* to server for the API.

## Security checklist (basic)

- Serve *only HTTPS* in production (hosts above provide TLS).
- Set **CORS_ORIGIN** on the API to your exact web origins (comma-separated), e.g. https://koli.vercel.app (use the real URL of your deployed frontend, not a placeholder).
- On PaaS behind a reverse proxy, set **TRUST_PROXY=1** (already assumed in render.yaml).
- Optional shared secret for early non-public routes: set **BETA_API_KEY** on the server and **VITE_BETA_API_KEY** on the frontend build (same value). *Note:* anything prefixed with VITE_ is public to browsers—use this only as a light gate, not for real user data.
- Never commit **.env** (see .gitignore). Use host “Environment variables” / secrets UI.
- Static responses get extra headers from **public/_headers** on Netlify and Cloudflare Pages.

## Local: frontend + API

# Terminal 1 — API (default http://127.0.0.1:3001)
npm run dev:api

# Terminal 2 — Vite (proxies /api and /health to the API)
npm run dev

Optional: .env.local with VITE_SHOW_API_STATUS=1 to show the small API pill on hosted beta builds.

## Deploy the API (Render)

### Step-by-step: new Web Service with root directory server

1. *Account* — Sign up at [render.com](https://render.com) and connect *GitHub* (or GitLab) so Render can read your repo.
2. *New Web Service* — Dashboard → *New +* → *Web Service* → pick the repository that contains this project (Koli_app folder should be the repo root on GitHub, or use the repo that has the server/ folder at its root).
3. *Root Directory* — In the service settings, find *Root Directory* and set it to exactly: **server**  
   - This tells Render: “only use the server folder” so package.json and index.mjs are at the top of what Render builds.
4. *Runtime* — *Environment* Node, region as you prefer.
5. *Build command:* npm install
6. *Start command:* node index.mjs
7. *Instance type* — Free tier is fine for a small API (cold starts are normal on free).
8. *Environment variables* — *Environment* tab → add:
   - NODE_ENV = production
   - TRUST_PROXY = 1
   - CORS_ORIGIN = your real frontend URL(s), comma-separated, e.g. https://my-app.vercel.app  
     If the frontend is not deployed yet, temporarily use http://localhost:5173 only for your own tests; for real beta testers you must use the *HTTPS* app URL.
   - Optional: BETA_API_KEY = a long random string if you want the optional header gate on POST /api/echo.
9. *Create Web Service* — Deploy. Wait until status is *Live*.
10. *Your API URL* — At the top of the service page, copy the URL (e.g. https://koli-api.onrender.com). Test in a browser:  
    https://<that-host>/health → should return JSON.

*Health check (optional):* In the service settings, set *Health Check Path* to /health so Render can tell if the process is up.

### Short checklist (same as above)

1. Web Service from this repo; *Root Directory* = server.
2. *Build:* npm install — *Start:* node index.mjs.
3. Env: NODE_ENV, TRUST_PROXY, CORS_ORIGIN (+ optional BETA_API_KEY).
4. Use the *onrender.com* URL Render shows as your real API base (for VITE_API_BASE_URL).

You can also use **render.yaml** (Blueprint) from the repo root — if you do, review rootDir: server and set CORS_ORIGIN in the dashboard if not in the file.

### Docker (API only)

From the Koli_app folder:

docker build -f server/Dockerfile -t koli-api .
docker run -p 3001:3001 -e CORS_ORIGIN=https://<your-real-frontend-url> -e TRUST_PROXY=1 koli-api

Render/Fly/Cloud Run can run this image; set **PORT** if the platform injects it (the server reads process.env.PORT).

## Deploy the frontend (Vercel)

1. Import the repo; *Framework Preset:* Vite.
2. *Build command:* npm run build — *Output directory:* dist.
3. In *Environment Variables* (for Production):
   - VITE_API_BASE_URL = https://<your-real-api-url> (no /api suffix — e.g. the hostname Render shows after deploy)
   - Optional: VITE_SHOW_API_STATUS = 1
   - Optional: VITE_BETA_API_KEY = same as server BETA_API_KEY if you enabled it
4. vercel.json already maps SPA routes to index.html.

## Deploy the frontend (Netlify)

netlify.toml is included. Set the same VITE_* variables in the Netlify UI.

## After deploy

- Open **https://<your-real-api-url>/health** (use the URL from your host’s dashboard) — expect JSON { "ok": true, ... }.
- Open the web app; with VITE_SHOW_API_STATUS=1, the corner pill should show *API · կապ կա* when VITE_API_BASE_URL is correct and CORS allows your frontend origin.

### If the API URL still does not open

- *You have not deployed yet* — finish creating the Web Service on Render (or another host) and wait until the deploy shows “Live”.
- *Wrong URL* — copy the URL from the provider (do not type your-domain literally).
- *Local only* — 127.0.0.1 works on the machine running the API; other devices and testers need the *public HTTPS* URL from your host.
- *Custom domain* — DNS api.example.com must point to the API service and TLS must be enabled on that host (usually automatic once DNS verifies).

## Custom domain (stable URL)

- Point DNS *CNAME* for app.yourdomain.com to your frontend host (Vercel/Netlify docs).
- Point api.yourdomain.com to the API host (Render custom domain or your container host).
- Update **CORS_ORIGIN** to include the new frontend URL(s).

## Mobile testers

- Send the *https://* app link; ensure *viewport* and *safe areas* are already set in index.html / CSS.
- Optional: Safari “Add to Home Screen” / Chrome “Install app” for a fullscreen shortcut (still the same web app).