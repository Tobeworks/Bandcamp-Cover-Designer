import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

function bandcampPlugin(): Plugin {
  return {
    name: 'bandcamp-api',
    configureServer(server) {
      // Image proxy — avoids canvas CORS taint
      server.middlewares.use('/api/image', async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const imageUrl = url.searchParams.get('url')
        if (!imageUrl || !imageUrl.includes('bcbits.com')) {
          res.writeHead(400)
          res.end('bad request')
          return
        }
        try {
          const r = await fetch(imageUrl)
          const buf = await r.arrayBuffer()
          res.writeHead(200, {
            'Content-Type': r.headers.get('content-type') ?? 'image/jpeg',
            'Cache-Control': 'public, max-age=86400',
          })
          res.end(Buffer.from(buf))
        } catch {
          res.writeHead(502)
          res.end('proxy error')
        }
      })

      server.middlewares.use('/api/bandcamp', async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const artist = url.searchParams.get('artist')?.trim()

        if (!artist) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'artist parameter required' }))
          return
        }

        try {
          const { parse } = await import('node-html-parser')
          const bandcampUrl = `https://${encodeURIComponent(artist)}.bandcamp.com/music`
          const response = await fetch(bandcampUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          })

          if (!response.ok) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: `Artist "${artist}" not found on Bandcamp` }))
            return
          }

          const html = await response.text()
          const root = parse(html)

          // Try data-client-items attribute (Bandcamp's embedded JSON)
          const musicGrid = root.querySelector('[data-client-items]')
          let albums: Album[] = []

          if (musicGrid) {
            try {
              const items = JSON.parse(musicGrid.getAttribute('data-client-items') ?? '[]')
              albums = items
                .filter((item: BandcampItem) => item.item_type === 'album' || item.item_type === 'track')
                .map((item: BandcampItem) => ({
                  id: String(item.id ?? item.page_url),
                  title: item.title ?? 'Unknown',
                  imageUrl: item.art_id
                    ? `https://f4.bcbits.com/img/a${item.art_id}_10.jpg`
                    : null,
                  releaseDate: item.publish_date ?? null,
                  url: item.page_url ? `https://${artist}.bandcamp.com${item.page_url}` : null,
                }))
                .filter((a: Album) => a.imageUrl)
            } catch {
              // fall through to DOM parsing
            }
          }

          // Fallback: parse music grid items from DOM
          if (albums.length === 0) {
            const items = root.querySelectorAll('li.music-grid-item, li[data-item-id]')
            for (const item of items) {
              const img = item.querySelector('img')
              const titleEl = item.querySelector('.title, p.title, .grid-title')
              const link = item.querySelector('a')
              const src = img?.getAttribute('data-src') ?? img?.getAttribute('src') ?? ''
              // Upgrade to high-res: replace _6 or _7 suffix with _10
              const imageUrl = src.replace(/_\d+\.jpg$/, '_10.jpg')
              if (imageUrl && imageUrl.includes('bcbits.com')) {
                albums.push({
                  id: String(albums.length),
                  title: (titleEl?.text ?? link?.getAttribute('title') ?? 'Unknown').replace(/\s+/g, ' ').trim(),
                  imageUrl,
                  releaseDate: null,
                  url: link?.getAttribute('href') ?? null,
                })
              }
            }
          }

          // Last resort: find all bcbits img tags
          if (albums.length === 0) {
            const imgs = root.querySelectorAll('img[src*="bcbits.com"], img[data-src*="bcbits.com"]')
            for (const img of imgs) {
              const src = img.getAttribute('data-src') ?? img.getAttribute('src') ?? ''
              const imageUrl = src.replace(/_\d+\.jpg$/, '_10.jpg')
              if (imageUrl) {
                albums.push({
                  id: String(albums.length),
                  title: img.getAttribute('alt') ?? 'Unknown',
                  imageUrl,
                  releaseDate: null,
                  url: null,
                })
              }
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ artist, albums }))
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

interface Album {
  id: string
  title: string
  imageUrl: string | null
  releaseDate: string | null
  url: string | null
}

interface BandcampItem {
  id?: number
  item_type?: string
  title?: string
  art_id?: number
  publish_date?: string
  page_url?: string
}

export default defineConfig({
  plugins: [vue(), bandcampPlugin()],
})
