# Bandcamp Cover Designer

Generate Instagram-ready cover collages from any Bandcamp artist — pick a layout, export a 1080×1080 PNG.

## Features

- Enter any Bandcamp artist name or URL (`logicmoon`, `logicmoon.bandcamp.com`, or the full URL)
- 8 layout options from 1×1 to 5×5 plus a Mosaic mode
- Shuffle release order
- Artist branding overlay toggle
- One-click 1080×1080 PNG export
- Layouts are only offered when enough releases are available

## Getting Started

**Prerequisites:** Node.js 18+, pnpm

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Available Layouts

| Mode   | Grid | Albums needed |
|--------|------|---------------|
| 1×1    | 1×1  | 1             |
| 2×2    | 2×2  | 4             |
| 2×3    | 2×3  | 6             |
| 3×2    | 3×2  | 6             |
| 3×3    | 3×3  | 9             |
| 4×4    | 4×4  | 16            |
| 5×5    | 5×5  | 25            |
| Mosaic | custom | 9           |

## Production Build

```bash
pnpm build
node server.mjs
```

The production server serves the static `dist/` and exposes the same `/api/bandcamp` and `/api/image` endpoints on port `8080` (configurable via `PORT` env var).

## Docker

```bash
docker build -t bandcamp-designer .
docker run -p 8080:8080 bandcamp-designer
```

## Deployment

The app runs at [bandcamp-designer.the-moon-records.de](https://bandcamp-designer.the-moon-records.de) via Kubernetes + ArgoCD. Pushing to `main` triggers a GitHub Actions build that pushes a new image to `ghcr.io/tobeworks/bandcamp-designer:latest`. ArgoCD image-updater picks it up and rolls out automatically.

## Testing

```bash
pnpm test
```

Playwright E2E tests in `tests/collage.spec.ts`.

## Tech Stack

- [Vue 3](https://vuejs.org) (Composition API) + [Vite](https://vitejs.dev) + TypeScript
- [node-html-parser](https://github.com/taoqf/node-html-parser) — Bandcamp HTML scraping
- Native Canvas API — collage rendering + PNG export
- pnpm · Playwright · Docker · GHCR · ArgoCD

## Version

`0.1.0@alpha`

---

Built by [tobeworks.de](https://tobeworks.de) · [Impressum](https://tobeworks.de/impressum) · [Datenschutz](https://tobeworks.de/datenschutz)
