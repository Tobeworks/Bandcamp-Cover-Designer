<template>
  <div class="h-screen flex flex-col lg:flex-row overflow-hidden bg-surface-alt">
    <a href="#preview" class="skip-link">Skip to preview</a>

    <!-- ── Sidebar ── -->
    <aside class="w-full lg:w-[280px] lg:flex-shrink-0 flex flex-col bg-card border-b lg:border-b-0 lg:border-r border-edge overflow-y-auto" aria-label="Controls">

      <!-- Logo + back -->
      <div class="px-5 py-4 flex items-center justify-between border-b border-edge">
        <div class="flex items-center gap-2.5">
          <span class="bg-primary text-white font-mono font-bold text-sm px-2 py-0.5 rounded-sm tracking-tight leading-none" aria-hidden="true">bc</span>
          <div>
            <div class="text-sm font-semibold text-ink leading-tight">Collage Designer</div>
            <div class="text-[10px] text-subtle leading-tight">by The Moon</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-6 h-6 flex items-center justify-center rounded-sm text-subtle hover:text-primary transition-colors"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggle"
          >
            <Sun v-if="isDark" :size="13" />
            <Moon v-else :size="13" />
          </button>
          <RouterLink to="/" class="text-[10px] text-subtle hover:text-primary transition-colors no-underline" aria-label="Back to home">
            ← Home
          </RouterLink>
        </div>
      </div>

      <!-- Artist -->
      <div class="px-5 py-4 flex flex-col gap-2 border-b border-edge">
        <label class="text-[10px] font-semibold tracking-widest text-subtle uppercase" for="artist-input">Artist</label>
        <input
          id="artist-input"
          v-model="artistInput"
          type="text"
          placeholder="artist-name.bandcamp.com"
          autocomplete="off"
          spellcheck="false"
          :disabled="loading"
          aria-label="Bandcamp artist name or URL"
          class="w-full h-9 px-3 text-sm text-ink bg-card border border-edge rounded-sm placeholder:text-subtle disabled:opacity-50 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          data-testid="artist-input"
          @keydown.enter="handleLoad"
        />
        <button
          class="w-full h-9 bg-primary text-white text-sm font-medium rounded-sm flex items-center justify-center gap-2 transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div class="px-5 py-4 flex flex-col gap-2.5 border-b border-edge">
        <span class="text-[10px] font-semibold tracking-widest text-subtle uppercase">Layout</span>
        <div class="grid grid-cols-3 gap-1.5" role="group" aria-label="Layout options">
          <button
            v-for="l in availableLayouts"
            :key="l.mode"
            class="h-8 text-xs rounded-sm border transition-all font-mono"
            :class="layout === l.mode
              ? 'bg-primary border-primary text-white'
              : 'bg-card border-edge text-ink hover:border-primary hover:text-primary'"
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
      <div class="px-5 py-4 flex flex-col gap-3 border-b border-edge">
        <span class="text-[10px] font-semibold tracking-widest text-subtle uppercase">Options</span>

        <div class="flex flex-col gap-1.5">
          <span class="text-sm text-ink">Background</span>
          <div class="flex items-center gap-2">
            <div class="flex gap-1">
              <button
                v-for="preset in bgPresets"
                :key="preset"
                class="w-5 h-5 rounded-sm border-2 transition-colors"
                :style="{ background: preset }"
                :class="bgColor === preset ? 'border-primary' : 'border-transparent'"
                :aria-label="`Set background to ${preset}`"
                @click="bgColor = preset"
              />
            </div>
            <input
              v-model="bgColor"
              type="color"
              class="w-7 h-7 rounded-sm border border-edge cursor-pointer p-0.5 bg-card"
              aria-label="Custom background color"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-ink">Branding overlay</span>
          <button
            role="switch"
            :aria-checked="showBranding"
            class="relative w-9 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            :class="showBranding ? 'bg-primary' : 'bg-edge'"
            aria-label="Toggle branding overlay"
            @click="showBranding = !showBranding"
          >
            <span class="absolute top-0.5 w-4 h-4 bg-card rounded-full shadow-sm transition-all" :class="showBranding ? 'left-[18px]' : 'left-0.5'" />
          </button>
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <span class="text-sm text-ink">Gap</span>
            <span class="text-xs font-mono text-muted w-6 text-right">{{ gap }}px</span>
          </div>
          <input
            v-model.number="gap"
            type="range"
            min="0"
            max="16"
            step="1"
            class="w-full accent-primary"
            aria-label="Gap between covers"
          />
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-ink">Shuffle order</span>
          <button
            class="h-7 px-3 text-xs font-mono rounded-sm border border-edge text-ink hover:border-primary hover:text-primary transition-colors"
            aria-label="Shuffle releases"
            @click="shuffle"
          >
            ⇄ Shuffle
          </button>
        </div>
      </div>

      <!-- Export -->
      <div class="px-5 py-4 mt-auto">
        <button
          class="w-full h-10 bg-primary text-white text-sm font-medium rounded-sm flex items-center justify-center gap-2 transition-colors hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
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
      <div class="px-5 pb-4 flex flex-col gap-2">
        <a
          href="https://github.com/tobeworks/bandcamp-cover-designer"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 text-[10px] text-subtle hover:text-primary transition-colors no-underline"
          aria-label="View source on GitHub"
        >
          <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-subtle">
          <a href="https://tobeworks.de" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">tobeworks.de</a>
          <a href="https://tobeworks.de/impressum" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">Impressum</a>
          <a href="https://tobeworks.de/datenschutz" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">Datenschutz</a>
          <span>v{{ version }}</span>
        </div>
      </div>
    </aside>

    <!-- ── Preview Panel ── -->
    <div id="preview" class="flex-1 flex flex-col min-h-0 overflow-hidden relative" role="main">

      <!-- Topbar -->
      <div class="h-10 flex-shrink-0 bg-card border-b border-edge flex items-center justify-between px-5">
        <span class="text-xs font-semibold text-muted">Preview</span>
        <div v-if="albums.length" class="flex items-center gap-2">
          <span class="text-xs text-muted" aria-live="polite">
            {{ filteredAlbums.length }}/{{ albums.length }} releases · showing {{ currentLayout.count }}
          </span>
          <button
            class="flex items-center gap-1 text-xs px-2 h-6 rounded-sm border transition-colors"
            :class="filterOpen
              ? 'bg-primary border-primary text-white'
              : 'border-edge text-muted hover:border-primary hover:text-primary'"
            :aria-label="filterOpen ? 'Filter schließen' : 'Releases filtern'"
            @click="filterOpen = !filterOpen"
          >
            <SlidersHorizontal :size="12" />
            Filter
          </button>
        </div>
      </div>

      <!-- Canvas area -->
      <div class="flex-1 overflow-auto flex items-center justify-center p-6">

        <CollageCanvas
          v-if="filteredAlbums.length"
          ref="collageRef"
          :albums="filteredAlbums"
          :layout="layout"
          :artistName="artistName"
          :showBranding="showBranding"
          :gap="gap"
          :bgColor="bgColor"
        />

        <!-- Loading -->
        <div v-else-if="loading" class="flex flex-col items-center gap-3 text-muted" aria-live="polite" aria-busy="true">
          <div class="w-10 h-10 border-[3px] border-edge border-t-primary rounded-full animate-spin-smooth" aria-hidden="true" />
          <p class="text-sm">Loading releases…</p>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center gap-4 text-center max-w-xs">
          <div class="w-16 h-16 rounded-full bg-edge flex items-center justify-center" aria-hidden="true">
            <LayoutGrid :size="28" class="text-muted" :stroke-width="1.5" />
          </div>
          <div>
            <p class="text-sm font-medium text-ink">No collage yet</p>
            <p class="text-xs text-muted mt-1">Enter a Bandcamp artist name and click <strong>Load Releases</strong></p>
          </div>
          <div class="text-xs text-subtle">
            e.g. <code class="bg-card px-1.5 py-0.5 rounded border border-edge">logicmoon</code>
            · <code class="bg-card px-1.5 py-0.5 rounded border border-edge">ninjatune</code>
          </div>
        </div>
      </div>

      <!-- Release Filter Drawer/Modal -->
      <ReleaseFilter
        :albums="albums"
        :excludedIds="excludedIds"
        :open="filterOpen"
        @toggle="toggleExclude"
        @reset="resetExcluded"
        @close="filterOpen = false"
      />

      <!-- Bottombar -->
      <div class="h-10 flex-shrink-0 bg-card border-t border-edge flex items-center justify-between px-5">
        <span class="text-xs text-muted">Output: 1080 × 1080 px · Format: PNG</span>
        <div v-if="filteredAlbums.length" class="flex items-center gap-3">
          <span class="flex items-center gap-1 text-xs text-muted">
            <span class="w-1.5 h-1.5 rounded-full" :class="showBranding ? 'bg-primary' : 'bg-edge'" aria-hidden="true" />
            Branding {{ showBranding ? 'ON' : 'OFF' }}
          </span>
          <button
            class="h-6 px-3 bg-primary text-white text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
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
import { LayoutGrid, Moon, Sun, SlidersHorizontal } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { version } from '../../package.json'
import CollageCanvas from '../components/CollageCanvas.vue'
import ReleaseFilter from '../components/ReleaseFilter.vue'
import { useBandcamp } from '../composables/useBandcamp'
import { useDarkMode } from '../composables/useDarkMode'
import { LAYOUTS } from '../types'
import type { LayoutMode } from '../types'

const { isDark, toggle } = useDarkMode()

const route = useRoute()
const router = useRouter()
const { albums, loading, error, artistName, fetchAlbums, shuffle } = useBandcamp()

const LS_ARTIST = 'bc-last-artist'
const LS_LAYOUT = 'bc-last-layout'

const artistInput = ref('')
const layout = ref<LayoutMode>((localStorage.getItem(LS_LAYOUT) as LayoutMode) ?? '3x3')
const showBranding = ref(true)
const gap = ref(3)
const bgColor = ref('#0a0a0f')

const bgPresets = ['#0a0a0f', '#ffffff', '#1a1a2e', '#2d2d2d', '#0f3460', '#1b4332']
const downloading = ref(false)
const filterOpen = ref(false)
const excludedIds = ref<Set<string>>(new Set())
const collageRef = ref<InstanceType<typeof CollageCanvas> | null>(null)

const currentLayout = computed(() => LAYOUTS.find(l => l.mode === layout.value)!)
const filteredAlbums = computed(() =>
  albums.value.filter(a => !excludedIds.value.has(a.id))
)
const availableLayouts = computed(() =>
  LAYOUTS.filter(l => !filteredAlbums.value.length || l.count <= filteredAlbums.value.length)
)

function toggleExclude(id: string) {
  const s = new Set(excludedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  excludedIds.value = s
}

function resetExcluded() {
  excludedIds.value = new Set()
}

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
  excludedIds.value = new Set()
  filterOpen.value = false
  const clamped = await fetchAlbums(artist, layout.value)
  if (clamped) setLayout(clamped)
}

function setLayout(mode: LayoutMode) {
  layout.value = mode
  localStorage.setItem(LS_LAYOUT, mode)
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
