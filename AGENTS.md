# AGENTS.md — Bandcamp Cover Designer

Guidance for AI agents (and humans) working in this codebase.

## What this app does

Users enter a Bandcamp artist name or URL. The app fetches their full discography via a server-side API, renders a cover collage in a configurable grid layout, and exports a 1080×1080 PNG. It's a single-page Vue 3 app with a lightweight Node.js backend that handles scraping and image proxying.

## Architecture & Data Flow

```
[ArtistInput] → submit event
      ↓
[useBandcamp.fetchAlbums()] → GET /api/bandcamp?artist=
      ↓                              ↓
[albums ref updated]    [server scrapes Bandcamp, returns JSON]
      ↓
[CollageCanvas] renders CSS grid preview + hidden <canvas>
      ↓
[DownloadButton] calls collageRef.renderToCanvas() → canvas.toBlob() → PNG download
```

Images are always loaded through `/api/image?url=` (server-side proxy) to avoid canvas CORS taint — Bandcamp's CDN does not send CORS headers.

## Key Files

| File | Purpose |
|------|---------|
| `src/App.vue` | Root: wires input → state → canvas, layout picker, branding toggle, footer |
| `src/components/ArtistInput.vue` | Input field with `.bandcamp.com` suffix; parses full URLs to bare artist slug |
| `src/components/CollageCanvas.vue` | CSS grid preview + hidden canvas rendering + `renderToCanvas()` export method |
| `src/components/LayoutPicker.vue` | Layout buttons; filters to only show modes that fit `albumCount` |
| `src/components/DownloadButton.vue` | Triggers `renderToCanvas()`, creates blob URL, fires `<a download>` |
| `src/composables/useBandcamp.ts` | Reactive state (albums, loading, error, artistName), `fetchAlbums`, `shuffle`, `clampLayout` |
| `src/types.ts` | `Album`, `LayoutMode`, `CollageLayout`, `LAYOUTS` array |
| `vite.config.ts` | Dev-only Vite plugin middleware: `/api/bandcamp` + `/api/image` |
| `server.mjs` | Production Node.js server: same API logic + static `dist/` serving |
| `Dockerfile` | Two-stage build (builder + runner); pnpm `--prod` install in runner stage |
| `.github/workflows/build.yaml` | Pushes to `ghcr.io/tobeworks/bandcamp-designer:latest` on merge to `main` |
| `tests/collage.spec.ts` | Playwright E2E tests |

## API Endpoints

### `GET /api/bandcamp?artist=<slug>`
Fetches the artist's full discography. Returns `{ artist, albums: Album[] }`.

Scraping strategy:
1. Fetch `https://{artist}.bandcamp.com/music`
2. Extract `band_id` from `data-band` attribute on the page
3. Call Bandcamp's mobile API: `/api/mobile/22/band_details?band_id={id}` — returns full discography newest-first
4. Fallback: parse `ol.music-grid li` DOM elements if the mobile API fails or returns nothing

### `GET /api/image?url=<bcbits-url>`
Server-side proxy for Bandcamp CDN images (`bcbits.com` only). Required for canvas rendering — `drawImage()` from a cross-origin source taints the canvas and blocks `toBlob()`.

## Layout System

`src/types.ts` defines the `LAYOUTS` array — each entry has `{ mode, label, count, cols, rows }`.

- `LayoutPicker` filters `LAYOUTS` to only show entries where `count <= albumCount` (mosaic is always shown).
- `clampLayout(current, count)` in `useBandcamp.ts` downgrades the active layout after a fetch if the new album count is too small for it.
- Non-square layouts (2×3, 3×2) produce a non-square canvas: `height = CANVAS_SIZE * rows / cols`.
- Albums are looped (modulo) if the layout requires more covers than are available.

## Canvas Rendering

`CollageCanvas.vue` maintains two representations:
- **CSS grid** (DOM) — interactive preview with hover overlays showing album titles
- **Hidden `<canvas>`** — used only for PNG export via `renderToCanvas()`

The canvas render:
1. Loads all cover images through `/api/image` proxy into `Image` objects
2. Applies `filter: saturate(1.1) contrast(1.05)` via canvas filter
3. For grid layouts: draws each cover at `(col * cellW, row * cellH)` with 3px gaps
4. For mosaic: draws first cover at 2/3 width, remaining 4 covers stacked right
5. If `showBranding`: draws a semi-transparent bottom bar + artist name (uppercase, right-aligned, Space Mono)

Download filename: `{artistName}-bandcamp-collage.png`

## Dev Conventions

- **Package manager:** pnpm only — never npm or yarn
- **TypeScript:** strict mode; no `any`; prefer type inference
- **Vue:** Composition API (`<script setup>`), no Options API
- **Comments:** only for non-obvious constraints or workarounds — never describe what the code does
- **ES target:** ES2020 (tsconfig) — avoid `Array.prototype.at()`, use `arr[arr.length - 1]` instead
- **No new abstractions** beyond what a task requires

## Build & Deploy Pipeline

```
git push → main
    ↓
GitHub Actions (.github/workflows/build.yaml)
    → docker buildx → ghcr.io/tobeworks/bandcamp-designer:latest
    ↓
ArgoCD image-updater (netcup cluster)
    → detects new :latest digest
    → updates deployment in apps/bandcamp-designer/
    → rolls out to bandcamp-designer.the-moon-records.de
```

K8s manifests live in a separate repo at `/Users/tobe/Sites/argo/netcup/apps/bandcamp-designer/`.

## Common Pitfalls

- **Canvas stays black:** You're loading images directly from `bcbits.com` instead of through `/api/image`. Always proxy in canvas rendering.
- **`node-html-parser` not found in production:** It must be in `dependencies`, not `devDependencies` — the Docker runner stage runs `pnpm install --prod`.
- **`Array.prototype.at()` build error:** TypeScript targets ES2020 which doesn't include `.at()`. Use `arr[arr.length - 1]`.
- **GitHub Actions not triggering:** Workflow triggers on `main` — make sure you're pushing to `main`, not `master`.
- **ArgoCD app not appearing:** The Application manifest must be applied manually once (`kubectl apply -f cluster/argocd-apps/bandcamp-designer.yaml`) unless a root app-of-apps picks it up automatically.
