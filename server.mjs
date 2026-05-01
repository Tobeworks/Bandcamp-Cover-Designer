import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { parse as parseHtml } from 'node-html-parser'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, 'dist')
const PORT = process.env.PORT ?? 8080

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
}

async function handleBandcamp(url, res) {
  const artist = url.searchParams.get('artist')?.trim()
  if (!artist) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'artist parameter required' }))
    return
  }
  try {
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
    const root = parseHtml(html)
    const musicGrid = root.querySelector('[data-client-items]')
    let albums = []

    if (musicGrid) {
      try {
        const items = JSON.parse(musicGrid.getAttribute('data-client-items') ?? '[]')
        albums = items
          .filter(item => item.item_type === 'album' || item.item_type === 'track')
          .map(item => ({
            id: String(item.id ?? item.page_url),
            title: item.title ?? 'Unknown',
            imageUrl: item.art_id ? `https://f4.bcbits.com/img/a${item.art_id}_10.jpg` : null,
            releaseDate: item.publish_date ?? null,
            url: item.page_url ? `https://${artist}.bandcamp.com${item.page_url}` : null,
          }))
          .filter(a => a.imageUrl)
      } catch { /* fall through */ }
    }

    if (albums.length === 0) {
      const items = root.querySelectorAll('li.music-grid-item, li[data-item-id]')
      for (const item of items) {
        const img = item.querySelector('img')
        const titleEl = item.querySelector('.title, p.title, .grid-title')
        const link = item.querySelector('a')
        const src = img?.getAttribute('data-src') ?? img?.getAttribute('src') ?? ''
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
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err.message }))
  }
}

async function handleImageProxy(url, res) {
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
}

async function handleStatic(pathname, res) {
  let filePath = join(DIST, pathname)
  if (!existsSync(filePath) || pathname === '/') {
    filePath = join(DIST, 'index.html')
  }
  try {
    const content = await readFile(filePath)
    const ext = extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' })
    res.end(content)
  } catch {
    const index = await readFile(join(DIST, 'index.html'))
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(index)
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost`)
  if (url.pathname === '/api/bandcamp') return handleBandcamp(url, res)
  if (url.pathname === '/api/image') return handleImageProxy(url, res)
  return handleStatic(url.pathname, res)
})

server.listen(PORT, () => console.log(`Bandcamp Cover Designer running on :${PORT}`))
