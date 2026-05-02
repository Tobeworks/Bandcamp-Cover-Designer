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

          // Extract band_id from data-band attribute
          const bandEl = root.querySelector('[data-band]')
          const bandData = JSON.parse(bandEl?.getAttribute('data-band') ?? '{}')
          const bandId: string = String(bandData.id ?? '')

          const albums: Album[] = []

          if (bandId) {
            // Use Bandcamp mobile API — returns full discography, newest first
            const apiUrl = `https://${encodeURIComponent(artist)}.bandcamp.com/api/mobile/22/band_details?band_id=${bandId}`
            const apiRes = await fetch(apiUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
            })
            if (apiRes.ok) {
              const apiData = await apiRes.json() as { discography?: BandcampItem[] }
              for (const item of apiData.discography ?? []) {
                if (item.art_id) {
                  albums.push({
                    id: String(item.id ?? albums.length),
                    title: item.title ?? 'Unknown',
                    imageUrl: `https://f4.bcbits.com/img/a${item.art_id}_10.jpg`,
                    releaseDate: null,
                    url: item.url ?? null,
                  })
                }
              }
            }
          }

          // Fallback: parse ol.music-grid from DOM
          if (albums.length === 0) {
            const items = root.querySelectorAll('ol.music-grid li, li.music-grid-item')
            for (const item of items) {
              const img = item.querySelector('img')
              const titleEl = item.querySelector('p.title, .title')
              const link = item.querySelector('a')
              const src = img?.getAttribute('data-original') ?? img?.getAttribute('data-src') ?? img?.getAttribute('src') ?? ''
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
  imageUrl: string
  releaseDate: string | null
  url: string | null
}

interface BandcampItem {
  id?: number
  title?: string
  art_id?: number
  url?: string
}

export default defineConfig({
  plugins: [vue(), bandcampPlugin()],
})
