# VINYL

Fullscreen 8-bit listening room for Spotify Premium — a beige CRT, a teak turntable, and album art quantized onto the vinyl label. The room is the UI.

> **Requires Spotify Premium.** Audio plays in-browser via the [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk). Spotify Connect device name: **Vinyl Player**.

## Features

- Pixel-art listening room with CRT transport, seek, volume, and queue
- Turntable that spins with playback; album art dithered onto the vinyl label
- Speakers that pulse from Spotify audio analysis (falls back to a motion loop)
- Wall posters of your short-term top 3 artists (last ~4 weeks)
- Keyboard + on-screen controls; `F` for fullscreen, `P` / **PS** to hide wall posters
- Spotify Authorization Code + PKCE — no client secret, tokens stay in the browser

## Prerequisites

- [Bun](https://bun.sh)
- A [Spotify Developer](https://developer.spotify.com/dashboard) app
- **Spotify Premium** on the listening account (and, for Development Mode apps under current Spotify rules, the developer account as well)
- Allowlisted user(s) on the app dashboard if the app is in Development Mode

## Setup

### 1. Create a Spotify app

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an app.
2. Add this **Redirect URI** (must match exactly):

   ```
   http://127.0.0.1:5173/callback
   ```

   Spotify rejects `localhost`. Use the loopback IP. `http://` on `127.0.0.1` is allowed.

3. Copy the **Client ID**.
4. Under **Users Management**, allowlist every Premium account that will use the app (Development Mode allows **at most 5** users total, including you).

### 2. Configure and run locally

```bash
cp .env.example .env.local
# set VITE_SPOTIFY_CLIENT_ID=your_client_id

bun install
bun run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) (not `localhost`), click **CONNECT** on the CRT, then **FS** (or press `F`) to hide the browser chrome.

Start playback here or transfer an existing Spotify session to **Vinyl Player**.

### 3. Host on Cloudflare Pages (pages.dev)

So friends can open the same app on `*.pages.dev`:

1. In the Spotify Dashboard, add a second Redirect URI (keep the local one too):

   ```
   https://vinyl-arh.pages.dev/callback
   ```

   If your Pages project name differs, use `https://<project>.pages.dev/callback` exactly.

2. Allowlist each friend’s Spotify email under **Users Management** (max 5 including you). Everyone needs **Premium**.

3. Log in to Cloudflare once, then deploy (Client ID is baked in at build time via `.env.local` or the shell):

   ```bash
   bunx wrangler login
   # uses VITE_SPOTIFY_CLIENT_ID from .env.local if present
   bun run deploy
   ```

   Or: `VITE_SPOTIFY_CLIENT_ID=your_id bun run deploy`

4. Share [https://vinyl-arh.pages.dev](https://vinyl-arh.pages.dev). Friends click **CONNECT** and approve scopes.

   If the CRT shows **NOT ON ALLOWLIST**, add their email in the Spotify Dashboard and have them try again.

Unlimited / public Spotify users require Extended Quota Mode (organizations only under current Spotify rules). This project stays on Development Mode’s 5-user cap.

### Re-authorizing after scope changes

If you pull updates that add scopes (e.g. wall posters / `user-top-read`, playlist pins / `playlist-read-private` and `playlist-read-collaborative`), click **CONNECT** again so Spotify re-grants permissions. Old sessions are cleared when the token store version bumps.

## Controls

| Input | Action |
| --- | --- |
| `Space` | Play / pause |
| `←` / `→` | Previous / next track |
| `↑` / `↓` | Volume |
| `F` | Enter fullscreen |
| `Esc` | Exit fullscreen |
| `P` / **PS** | Toggle wall posters |
| CRT buttons | Transport, seek, volume, NOW / Q / PL tabs |

On the **PL** tab, five pinned playlists start playback on **Vinyl Player**. Press **SET** to scroll your full library and assign or clear a slot; pins are stored per browser.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start Vite on `127.0.0.1:5173` |
| `bun run build` | Typecheck and production build |
| `bun run preview` | Preview the production build |
| `bun run lint` | Run oxlint |
| `bun run deploy` | Build and upload `dist/` to Cloudflare Pages (`vinyl` → vinyl-arh.pages.dev) |

## Stack

| Layer | Choice |
| --- | --- |
| Runtime / tooling | Bun, Vite, TypeScript |
| UI | React |
| Auth | Spotify Authorization Code + PKCE |
| Playback | Web Playback SDK |
| Metadata / queue / analysis | Spotify Web API (REST) |

Spotify does not expose GraphQL for this surface; REST + the Playback SDK are what the platform provides.

## Project layout

```
src/
  auth/       PKCE login + token store
  crt/        CRT monitor UI
  scene/      Room, posters, props
  speakers/   Speaker visualization
  spotify/    Player hook, API, pixel art
  turntable/  Vinyl + tonearm
  hooks/      Keyboard, fullscreen, pixel scale
  styles/     Design tokens + room CSS
```

## License

Private / unlicensed unless otherwise noted.
