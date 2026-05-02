<template>
  <div class="collage-wrap">
    <div class="collage" :class="`layout-${layout}`" :style="gridStyle" data-testid="collage">
      <div
        v-for="(album, i) in visibleAlbums"
        :key="album.id + i"
        class="cell"
        :class="{ 'cell--large': layout === 'mosaic' && i === 0 }"
      >
        <img
          :src="album.imageUrl"
          :alt="album.title"
          class="cover"
          loading="lazy"
          @error="onImgError($event, album)"
        />
        <div class="overlay">
          <span class="title">{{ album.title }}</span>
        </div>
      </div>
    </div>

    <canvas ref="canvasRef" class="hidden-canvas" :width="canvasW" :height="canvasH" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Album, LayoutMode } from '../types'
import { LAYOUTS } from '../types'

const props = defineProps<{
  albums: Album[]
  layout: LayoutMode
  artistName: string
  showBranding: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const CANVAS_SIZE = 1080
const GAP = 3

const canvasW = computed(() => CANVAS_SIZE)
const canvasH = computed(() => {
  if (props.layout === 'mosaic') return CANVAS_SIZE
  const { cols, rows } = currentLayout.value
  return Math.round(CANVAS_SIZE * rows / cols)
})

const currentLayout = computed(() => LAYOUTS.find(l => l.mode === props.layout)!)

const visibleAlbums = computed(() => {
  const count = currentLayout.value.count
  if (!props.albums.length) return []
  // Loop albums if fewer than needed
  const result: Album[] = []
  for (let i = 0; i < count; i++) {
    result.push(props.albums[i % props.albums.length])
  }
  return result
})

const gridStyle = computed(() => {
  if (props.layout === 'mosaic') {
    return {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gridTemplateRows: 'repeat(4, 1fr)',
      gap: `${GAP}px`,
    }
  }
  const cols = currentLayout.value.cols
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: `${GAP}px`,
  }
})

function onImgError(event: Event, album: Album) {
  const img = event.target as HTMLImageElement
  // Fallback to smaller size
  if (!img.src.includes('_6.jpg')) {
    img.src = album.imageUrl.replace('_10.jpg', '_6.jpg')
  }
}

async function renderToCanvas(): Promise<Blob> {
  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!
  const W = canvasW.value
  const H = canvasH.value
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, W, H)

  const albums = visibleAlbums.value
  const gap = GAP

  const proxied = (src: string) => `/api/image?url=${encodeURIComponent(src)}`

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => {
        const fallback = new Image()
        fallback.onload = () => resolve(fallback)
        fallback.onerror = reject
        fallback.src = proxied(src.replace('_10.jpg', '_6.jpg'))
      }
      img.src = proxied(src)
    })

  const images = await Promise.allSettled(albums.map(a => loadImage(a.imageUrl)))

  if (props.layout === 'mosaic') {
    const largeW = Math.floor((W - gap) * 2 / 3)
    const smallW = W - largeW - gap
    const smallH = Math.floor((H - gap * 3) / 4)
    if (images[0]?.status === 'fulfilled') {
      drawCover(ctx, images[0].value, 0, 0, largeW, H)
    }
    for (let i = 1; i < Math.min(albums.length, 5); i++) {
      const img = images[i]
      if (img?.status === 'fulfilled') {
        drawCover(ctx, img.value, largeW + gap, (i - 1) * (smallH + gap), smallW, smallH)
      }
    }
  } else {
    const cols = currentLayout.value.cols
    const rows = currentLayout.value.rows
    const cellW = Math.floor((W - gap * (cols - 1)) / cols)
    const cellH = Math.floor((H - gap * (rows - 1)) / rows)
    albums.forEach((_, i) => {
      const img = images[i]
      if (img?.status !== 'fulfilled') return
      const col = i % cols
      const row = Math.floor(i / cols)
      drawCover(ctx, img.value, col * (cellW + gap), row * (cellH + gap), cellW, cellH)
    })
  }

  // Branding overlay
  if (props.showBranding && props.artistName) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, H - 52, W, 52)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 18px "Space Mono", monospace'
    ctx.letterSpacing = '3px'
    ctx.textAlign = 'right'
    ctx.fillText(props.artistName.toUpperCase(), W - 20, H - 18)
  }

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png'))
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number,
  w: number, h: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = img.naturalWidth * scale
  const sh = img.naturalHeight * scale
  const sx = (w - sw) / 2
  const sy = (h - sh) / 2
  ctx.drawImage(img, x + sx, y + sy, sw, sh)
}

defineExpose({ renderToCanvas })
</script>

<style scoped>
.collage-wrap {
  position: relative;
  width: 100%;
  max-width: 540px;
  aspect-ratio: v-bind('`${canvasW} / ${canvasH}`');
}

.collage {
  width: 100%;
  height: 100%;
  background: #0a0a0f;
  overflow: hidden;
}

.cell {
  position: relative;
  overflow: hidden;
  background: #111;
}

.cell--large {
  grid-column: 1;
  grid-row: 1 / span 4;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.85) contrast(1.05);
  transition: filter 0.2s, transform 0.2s;
}

.cell:hover .cover {
  filter: saturate(1.1) contrast(1.1);
  transform: scale(1.03);
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 6px 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.2s;
}

.cell:hover .overlay {
  opacity: 1;
}

.title {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: #fff;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.3;
}

.hidden-canvas {
  display: none;
}
</style>
