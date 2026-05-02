<template>
  <div class="min-h-screen flex flex-col bg-[#ecf3f4] text-[#222]">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Header -->
    <header class="bg-[#222] border-b-2 border-[#0cacd7]" role="banner">
      <div class="max-w-5xl mx-auto px-6 h-[53px] flex items-center">
        <div class="flex items-center gap-3" aria-label="Bandcamp Cover Designer">
          <span class="bg-[#0cacd7] text-white font-mono font-bold text-base px-2 py-0.5 rounded-sm tracking-tight" aria-hidden="true">bc</span>
          <span class="text-white text-sm tracking-widest uppercase font-mono">Cover Designer</span>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main id="main-content" class="flex-1 w-full" role="main">

      <!-- Hero / Loading state -->
      <section
        v-if="!albums.length"
        class="flex flex-col items-center text-center px-4 py-16 sm:py-20 gap-6"
        :aria-busy="loading"
        aria-labelledby="hero-heading"
      >
        <span class="inline-block px-4 py-1 border border-[#22222229] rounded-full text-xs text-[#5d5d5d] bg-[#ecf3f4]" role="note">
          Free Tool by The Moon Records
        </span>

        <h1 id="hero-heading" class="text-3xl sm:text-4xl md:text-[40px] font-medium text-[#222] max-w-3xl leading-tight">
          Turn Any Bandcamp Artist Into a Cover Collage.
        </h1>

        <p class="text-sm text-[#5d5d5d] max-w-lg leading-relaxed">
          Enter an artist name. Fetch their full discography. Export a stunning 1080×1080 PNG grid.
          Free, no account required.
        </p>

        <ArtistInput :loading="loading" :hero="true" @submit="handleSubmit" />

        <div v-if="error" class="w-full max-w-lg bg-[#ffe6e3] border border-[#fc675e] rounded text-sm text-[#b60404] font-mono px-4 py-3 text-left" role="alert">
          {{ error }}
        </div>

        <div v-if="loading" class="flex flex-col items-center gap-3 py-4 text-sm text-[#5d5d5d]" aria-live="polite">
          <div class="w-8 h-8 border-[3px] border-[#22222220] border-t-[#0cacd7] rounded-full animate-spin-smooth" aria-hidden="true" />
          <p>Loading releases…</p>
        </div>

        <!-- Collage mockup -->
        <div v-if="!loading" class="w-full max-w-3xl bg-white rounded-[4px] p-[3px] shadow-sm mt-2" aria-hidden="true">
          <div class="grid grid-cols-3 grid-rows-3 gap-[3px] aspect-[2/1]">
            <div v-for="color in mockupColors" :key="color" class="rounded-sm" :style="{ background: color }" />
          </div>
        </div>
      </section>

      <!-- Collage view -->
      <template v-if="albums.length">
        <div class="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6 flex flex-col gap-3" role="toolbar" aria-label="Collage controls">
          <ArtistInput :loading="loading" @submit="handleSubmit" />

          <div class="flex items-center gap-2 flex-wrap">
            <LayoutPicker v-model="layout" :albumCount="albums.length" />

            <button
              class="px-3 py-1.5 border border-[#22222240] rounded-sm text-xs font-mono text-[#222] hover:border-[#222] transition-colors cursor-pointer"
              @click="shuffle"
              aria-label="Randomize album order"
            >
              ⇄ Shuffle
            </button>

            <label class="flex items-center gap-1.5 text-xs font-mono cursor-pointer select-none">
              <input type="checkbox" v-model="showBranding" class="accent-[#0cacd7] w-3.5 h-3.5 cursor-pointer" aria-label="Show artist branding overlay" />
              <span aria-hidden="true">Branding</span>
            </label>

            <DownloadButton
              :disabled="!albums.length"
              :artistName="artistName"
              :onRender="() => collageRef!.renderToCanvas()"
            />
          </div>
        </div>

        <div v-if="error" class="max-w-5xl mx-auto w-full px-4 sm:px-6 mt-3">
          <div class="bg-[#ffe6e3] border border-[#fc675e] rounded text-sm text-[#b60404] font-mono px-4 py-3" role="alert">{{ error }}</div>
        </div>

        <div class="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col items-center gap-2">
          <CollageCanvas
            ref="collageRef"
            :albums="albums"
            :layout="layout"
            :artistName="artistName"
            :showBranding="showBranding"
          />
          <p class="text-[11px] text-[#22222270] font-mono tracking-wide" aria-live="polite">
            {{ albums.length }} releases found · showing {{ currentLayout.count }}
          </p>
        </div>
      </template>

    </main>

    <!-- Footer -->
    <footer class="border-t border-[#22222215] py-4 px-6 flex flex-col items-center gap-1.5 text-xs font-mono text-[#22222266]" role="contentinfo">
      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>Built by <a href="https://tobeworks.de" target="_blank" rel="noopener noreferrer" class="text-[#22222288] hover:text-[#0cacd7] no-underline transition-colors">tobeworks.de</a></span>
        <span aria-hidden="true">·</span>
        <a href="https://logic-moon.de" target="_blank" rel="noopener noreferrer" class="text-[#22222288] hover:text-[#0cacd7] no-underline transition-colors">logic-moon.de</a>
        <span aria-hidden="true">·</span>
        <a href="https://the-moon-records.de" target="_blank" rel="noopener noreferrer" class="text-[#22222288] hover:text-[#0cacd7] no-underline transition-colors">the-moon-records.de</a>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-[#22222244]">
        <a href="https://tobeworks.de/impressum" target="_blank" rel="noopener noreferrer" class="hover:text-[#0cacd7] no-underline transition-colors">Impressum</a>
        <span aria-hidden="true">·</span>
        <a href="https://tobeworks.de/datenschutz" target="_blank" rel="noopener noreferrer" class="hover:text-[#0cacd7] no-underline transition-colors">Datenschutz</a>
        <span aria-hidden="true">·</span>
        <span>v{{ version }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { version } from '../package.json'
import ArtistInput from './components/ArtistInput.vue'
import LayoutPicker from './components/LayoutPicker.vue'
import CollageCanvas from './components/CollageCanvas.vue'
import DownloadButton from './components/DownloadButton.vue'
import { useBandcamp } from './composables/useBandcamp'
import { LAYOUTS } from './types'
import type { LayoutMode } from './types'

const { albums, loading, error, artistName, fetchAlbums, shuffle } = useBandcamp()

async function handleSubmit(artist: string) {
  const clamped = await fetchAlbums(artist, layout.value)
  if (clamped) layout.value = clamped
}

const layout = ref<LayoutMode>('3x3')
const showBranding = ref(true)
const collageRef = ref<InstanceType<typeof CollageCanvas> | null>(null)
const currentLayout = computed(() => LAYOUTS.find(l => l.mode === layout.value)!)

const mockupColors = [
  '#596b47', '#6b4760', '#476b5f',
  '#61654e', '#6b4747', '#4a5e6b',
  '#6b5f47', '#47476b', '#5e6b47',
]
</script>
