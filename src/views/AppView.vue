<template>
  <div class="h-screen flex flex-col lg:flex-row overflow-hidden bg-[#dde8ea]">
    <a href="#preview" class="skip-link">Skip to preview</a>

    <!-- ── Sidebar ── -->
    <aside class="w-full lg:w-[280px] lg:flex-shrink-0 flex flex-col bg-white border-b lg:border-b-0 lg:border-r border-[#d0dde0] overflow-y-auto" aria-label="Controls">

      <!-- Logo + back -->
      <div class="px-5 py-4 flex items-center justify-between border-b border-[#d0dde0]">
        <div class="flex items-center gap-2.5">
          <span class="bg-[#0cacd7] text-white font-mono font-bold text-sm px-2 py-0.5 rounded-sm tracking-tight leading-none" aria-hidden="true">bc</span>
          <div>
            <div class="text-sm font-semibold text-[#222] leading-tight">Collage Designer</div>
            <div class="text-[10px] text-[#aaa] leading-tight">by The Moon Records</div>
          </div>
        </div>
        <RouterLink to="/" class="text-[10px] text-[#aaa] hover:text-[#0cacd7] transition-colors no-underline" aria-label="Back to home">
          ← Home
        </RouterLink>
      </div>

      <!-- Artist -->
      <div class="px-5 py-4 flex flex-col gap-2 border-b border-[#d0dde0]">
        <label class="text-[10px] font-semibold tracking-widest text-[#aaa] uppercase" for="artist-input">Artist</label>
        <input
          id="artist-input"
          v-model="artistInput"
          type="text"
          placeholder="artist-name.bandcamp.com"
          autocomplete="off"
          spellcheck="false"
          :disabled="loading"
          aria-label="Bandcamp artist name or URL"
          class="w-full h-9 px-3 text-sm text-[#222] bg-white border border-[#d0dde0] rounded-sm placeholder:text-[#ccc] disabled:opacity-50 focus-visible:outline-none focus-visible:border-[#0cacd7] focus-visible:ring-1 focus-visible:ring-[#0cacd7]"
          data-testid="artist-input"
          @keydown.enter="handleLoad"
        />
        <button
          class="w-full h-9 bg-[#0cacd7] text-white text-sm font-medium rounded-sm flex items-center justify-center gap-2 transition-colors hover:bg-[#0a9bbf] disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading || !artistInput.trim()"
          aria-label="Load releases"
          data-testid="load-btn"
          @click="handleLoad"
        >
          <span v-if="loading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" aria-hidden="true" />
          <span v-else>Load Releases</span>
        </button>
        <div v-if="error" class="text-xs text-[#b60404] bg-[#ffe6e3] border border-[#fc675e] rounded px-2 py-1.5" role="alert">{{ error }}</div>
      </div>

      <!-- Layout -->
      <div class="px-5 py-4 flex flex-col gap-2.5 border-b border-[#d0dde0]">
        <span class="text-[10px] font-semibold tracking-widest text-[#aaa] uppercase">Layout</span>
        <div class="grid grid-cols-3 gap-1.5" role="group" aria-label="Layout options">
          <button
            v-for="l in availableLayouts"
            :key="l.mode"
            class="h-8 text-xs rounded-sm border transition-all font-mono"
            :class="layout === l.mode
              ? 'bg-[#0cacd7] border-[#0cacd7] text-white'
              : 'bg-white border-[#d0dde0] text-[#222] hover:border-[#0cacd7] hover:text-[#0cacd7]'"
            :aria-pressed="layout === l.mode"
            :aria-label="`${l.label} layout`"
            :data-testid="`layout-${l.mode}`"
            @click="setLayout(l.mode)"
          >
            {{ l.label }}
          </button>
        </div>
      </div>

      <!-- Options -->
      <div class="px-5 py-4 flex flex-col gap-3 border-b border-[#d0dde0]">
        <span class="text-[10px] font-semibold tracking-widest text-[#aaa] uppercase">Options</span>

        <div class="flex items-center justify-between">
          <span class="text-sm text-[#222]">Branding overlay</span>
          <button
            role="switch"
            :aria-checked="showBranding"
            class="relative w-9 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0cacd7] focus-visible:ring-offset-1"
            :class="showBranding ? 'bg-[#0cacd7]' : 'bg-[#ccc]'"
            aria-label="Toggle branding overlay"
            @click="showBranding = !showBranding"
          >
            <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all" :class="showBranding ? 'left-[18px]' : 'left-0.5'" />
          </button>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-[#222]">Shuffle order</span>
          <button
            role="switch"
            :aria-checked="shuffleOn"
            class="relative w-9 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0cacd7] focus-visible:ring-offset-1"
            :class="shuffleOn ? 'bg-[#0cacd7]' : 'bg-[#ccc]'"
            aria-label="Toggle shuffle order"
            @click="handleShuffle"
          >
            <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all" :class="shuffleOn ? 'left-[18px]' : 'left-0.5'" />
          </button>
        </div>
      </div>

      <!-- Export -->
      <div class="px-5 py-4 mt-auto">
        <button
          class="w-full h-10 bg-[#0cacd7] text-white text-sm font-medium rounded-sm flex items-center justify-center gap-2 transition-colors hover:bg-[#0a9bbf] disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!albums.length || downloading"
          aria-label="Export PNG 1080×1080"
          data-testid="download-btn"
          @click="handleDownload"
        >
          <span v-if="downloading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" aria-hidden="true" />
          <span v-else>↓ Export PNG (1080×1080)</span>
        </button>
      </div>

      <!-- Footer -->
      <div class="px-5 pb-4 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#bbb]">
        <a href="https://tobeworks.de" target="_blank" rel="noopener noreferrer" class="hover:text-[#0cacd7] transition-colors">tobeworks.de</a>
        <a href="https://tobeworks.de/impressum" target="_blank" rel="noopener noreferrer" class="hover:text-[#0cacd7] transition-colors">Impressum</a>
        <a href="https://tobeworks.de/datenschutz" target="_blank" rel="noopener noreferrer" class="hover:text-[#0cacd7] transition-colors">Datenschutz</a>
        <span>v{{ version }}</span>
      </div>
    </aside>

    <!-- ── Preview Panel ── -->
    <div id="preview" class="flex-1 flex flex-col min-h-0 overflow-hidden" role="main">

      <!-- Topbar -->
      <div class="h-10 flex-shrink-0 bg-white border-b border-[#d0dde0] flex items-center justify-between px-5">
        <span class="text-xs font-semibold text-[#5d5d5d]">Preview</span>
        <div v-if="albums.length" class="flex items-center gap-1.5 text-xs text-[#5d5d5d]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#0cacd7]" aria-hidden="true" />
          <span aria-live="polite">{{ albums.length }} releases found · showing {{ currentLayout.count }}</span>
        </div>
      </div>

      <!-- Canvas area -->
      <div class="flex-1 overflow-auto flex items-center justify-center p-6">

        <CollageCanvas
          v-if="albums.length"
          ref="collageRef"
          :albums="albums"
          :layout="layout"
          :artistName="artistName"
          :showBranding="showBranding"
        />

        <!-- Loading -->
        <div v-else-if="loading" class="flex flex-col items-center gap-3 text-[#5d5d5d]" aria-live="polite" aria-busy="true">
          <div class="w-10 h-10 border-[3px] border-[#d0dde0] border-t-[#0cacd7] rounded-full animate-spin-smooth" aria-hidden="true" />
          <p class="text-sm">Loading releases…</p>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center gap-4 text-center max-w-xs">
          <div class="w-16 h-16 rounded-full bg-[#d0dde0] flex items-center justify-center" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5d5d5d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-[#222]">No collage yet</p>
            <p class="text-xs text-[#5d5d5d] mt-1">Enter a Bandcamp artist name and click <strong>Load Releases</strong></p>
          </div>
          <div class="text-xs text-[#aaa]">
            e.g. <code class="bg-white px-1.5 py-0.5 rounded border border-[#d0dde0]">logicmoon</code>
            · <code class="bg-white px-1.5 py-0.5 rounded border border-[#d0dde0]">ninjatune</code>
          </div>
        </div>
      </div>

      <!-- Bottombar -->
      <div class="h-10 flex-shrink-0 bg-white border-t border-[#d0dde0] flex items-center justify-between px-5">
        <span class="text-xs text-[#5d5d5d]">Output: 1080 × 1080 px · Format: PNG</span>
        <div v-if="albums.length" class="flex items-center gap-3">
          <span class="flex items-center gap-1 text-xs text-[#5d5d5d]">
            <span class="w-1.5 h-1.5 rounded-full" :class="showBranding ? 'bg-[#0cacd7]' : 'bg-[#ccc]'" aria-hidden="true" />
            Branding {{ showBranding ? 'ON' : 'OFF' }}
          </span>
          <button
            class="h-6 px-3 bg-[#0cacd7] text-white text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors hover:bg-[#0a9bbf] disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="downloading"
            aria-label="Export PNG"
            @click="handleDownload"
          >
            <span v-if="downloading" class="inline-block w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin-smooth" aria-hidden="true" />
            <span v-else>↓ Export PNG</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { version } from '../../package.json'
import CollageCanvas from '../components/CollageCanvas.vue'
import { useBandcamp } from '../composables/useBandcamp'
import { LAYOUTS } from '../types'
import type { LayoutMode } from '../types'

const route = useRoute()
const router = useRouter()
const { albums, loading, error, artistName, fetchAlbums, shuffle } = useBandcamp()

const LS_ARTIST = 'bc-last-artist'
const LS_LAYOUT = 'bc-last-layout'

const artistInput = ref('')
const layout = ref<LayoutMode>((localStorage.getItem(LS_LAYOUT) as LayoutMode) ?? '3x3')
const showBranding = ref(true)
const shuffleOn = ref(false)
const downloading = ref(false)
const collageRef = ref<InstanceType<typeof CollageCanvas> | null>(null)

const currentLayout = computed(() => LAYOUTS.find(l => l.mode === layout.value)!)
const availableLayouts = computed(() =>
  LAYOUTS.filter(l => l.mode === 'mosaic' || !albums.value.length || l.count <= albums.value.length)
)

function parseArtist(input: string): string {
  let s = input.trim()
  s = s.replace(/^https?:\/\//i, '')
  s = s.split('/')[0]
  if (s.toLowerCase().includes('.bandcamp.com')) s = s.split('.bandcamp.com')[0]
  return s.toLowerCase()
}

async function handleLoad() {
  const artist = parseArtist(artistInput.value)
  if (!artist) return
  localStorage.setItem(LS_ARTIST, artist)
  router.replace({ path: '/app', query: { artist } })
  const clamped = await fetchAlbums(artist, layout.value)
  if (clamped) setLayout(clamped)
}

function setLayout(mode: LayoutMode) {
  layout.value = mode
  localStorage.setItem(LS_LAYOUT, mode)
}

function handleShuffle() {
  shuffleOn.value = !shuffleOn.value
  if (shuffleOn.value) shuffle()
}

async function handleDownload() {
  if (!collageRef.value) return
  downloading.value = true
  try {
    const blob = await collageRef.value.renderToCanvas()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const ts = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')
    a.download = `${artistName.value || 'collage'}-bandcamp-collage_${ts}.png`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  // URL param takes priority, then localStorage
  const qArtist = route.query.artist as string | undefined
  const stored = localStorage.getItem(LS_ARTIST)
  const initial = qArtist || stored || ''
  if (initial) {
    artistInput.value = initial
    handleLoad()
  }
})

// Keep URL in sync when artist changes externally
watch(artistName, (name) => {
  if (name) router.replace({ path: '/app', query: { artist: name } })
})
</script>
