<template>
  <div class="app">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header class="header" role="banner">
      <div class="header-inner">
        <div class="logo" aria-label="Bandcamp Cover Designer">
          <span class="logo-bc" aria-hidden="true">bc</span>
          <span class="logo-label">Cover Designer</span>
        </div>
      </div>
    </header>

    <main id="main-content" class="main" role="main">

      <!-- ── Hero (no albums loaded yet) ── -->
      <section v-if="!albums.length && !loading" class="hero" aria-labelledby="hero-heading">
        <span class="hero-badge" role="note">Free Tool by The Moon Records</span>

        <h1 id="hero-heading" class="hero-headline">
          Turn Any Bandcamp Artist Into a Cover Collage.
        </h1>

        <p class="hero-sub">
          Enter an artist name. Fetch their full discography. Export a stunning 1080×1080 PNG grid.
          Free, no account required.
        </p>

        <ArtistInput :loading="loading" :hero="true" @submit="handleSubmit" />

        <div v-if="error" class="error" role="alert">{{ error }}</div>

        <!-- Static collage mockup -->
        <div class="mockup" aria-hidden="true">
          <div class="mockup-grid">
            <div v-for="color in mockupColors" :key="color" class="mockup-cell" :style="{ background: color }" />
          </div>
        </div>
      </section>

      <!-- ── Loading ── -->
      <section v-if="loading" class="hero hero--loading" aria-live="polite" aria-busy="true">
        <span class="hero-badge" role="note">Free Tool by The Moon Records</span>
        <h1 class="hero-headline">Turn Any Bandcamp Artist Into a Cover Collage.</h1>
        <p class="hero-sub">Enter an artist name. Fetch their full discography. Export a stunning 1080×1080 PNG grid. Free, no account required.</p>
        <ArtistInput :loading="loading" :hero="true" @submit="handleSubmit" />
        <div class="loading" aria-label="Loading releases">
          <div class="loading-spinner" aria-hidden="true" />
          <p>Loading releases…</p>
        </div>
      </section>

      <!-- ── Collage view ── -->
      <template v-if="albums.length">
        <div class="controls" role="toolbar" aria-label="Collage controls">
          <ArtistInput :loading="loading" @submit="handleSubmit" />

          <div class="controls-row">
            <LayoutPicker v-model="layout" :albumCount="albums.length" />
            <button class="btn-ghost" @click="shuffle" aria-label="Randomize album order">⇄ Shuffle</button>
            <label class="toggle">
              <input type="checkbox" v-model="showBranding" aria-label="Show artist branding overlay" />
              <span aria-hidden="true">Branding</span>
            </label>
            <DownloadButton
              :disabled="!albums.length"
              :artistName="artistName"
              :onRender="() => collageRef!.renderToCanvas()"
            />
          </div>
        </div>

        <div v-if="error" class="error" role="alert">{{ error }}</div>

        <div class="canvas-area">
          <CollageCanvas
            ref="collageRef"
            :albums="albums"
            :layout="layout"
            :artistName="artistName"
            :showBranding="showBranding"
          />
          <p class="count-hint" aria-live="polite">
            {{ albums.length }} releases found · showing {{ currentLayout.count }}
          </p>
        </div>
      </template>

    </main>

    <footer class="footer" role="contentinfo">
      <div class="footer-row">
        <span>Built by <a href="https://tobeworks.de" target="_blank" rel="noopener noreferrer">tobeworks.de</a></span>
        <span class="sep" aria-hidden="true">·</span>
        <a href="https://logic-moon.de" target="_blank" rel="noopener noreferrer">logic-moon.de</a>
        <span class="sep" aria-hidden="true">·</span>
        <a href="https://the-moon-records.de" target="_blank" rel="noopener noreferrer">the-moon-records.de</a>
      </div>
      <div class="footer-row footer-legal">
        <a href="https://tobeworks.de/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
        <span class="sep" aria-hidden="true">·</span>
        <a href="https://tobeworks.de/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
        <span class="sep" aria-hidden="true">·</span>
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

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: #ecf3f4;
  color: #222;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

/* Global focus-visible */
:focus-visible {
  outline: 2px solid #0cacd7;
  outline-offset: 2px;
}
</style>

<style scoped>
/* ── Skip link ── */
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: 9999;
  background: #0cacd7;
  color: #fff;
  padding: 8px 16px;
  border-radius: 0 0 4px 4px;
  font-size: 14px;
  text-decoration: none;
  transition: top 0.1s;
}

.skip-link:focus {
  top: 0;
}

/* ── App shell ── */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.header {
  background: #222;
  border-bottom: 2px solid #0cacd7;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 53px;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-bc {
  background: #0cacd7;
  color: #fff;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  font-size: 16px;
  padding: 2px 7px;
  border-radius: 2px;
  letter-spacing: -0.02em;
}

.logo-label {
  color: #fff;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Space Mono', monospace;
}

/* ── Main ── */
.main {
  flex: 1;
  width: 100%;
}

/* ── Hero ── */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 72px 24px;
  gap: 24px;
}

.hero--loading {
  gap: 20px;
}

.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  border: 1px solid rgba(34, 34, 34, 0.16);
  border-radius: 50px;
  font-size: 12px;
  color: #5d5d5d;
  background: #ecf3f4;
}

.hero-headline {
  font-size: clamp(24px, 4vw, 40px);
  font-weight: 500;
  color: #222;
  max-width: 860px;
  line-height: 1.2;
}

.hero-sub {
  font-size: 14px;
  color: #5d5d5d;
  max-width: 560px;
  line-height: 1.6;
}

/* ── Collage mockup ── */
.mockup {
  width: 100%;
  max-width: 800px;
  background: #fff;
  border-radius: 4px;
  padding: 3px;
  margin-top: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

.mockup-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 3px;
  aspect-ratio: 2 / 1;
}

.mockup-cell {
  border-radius: 1px;
}

/* ── Controls (collage view) ── */
.controls {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 24px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-ghost {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid rgba(34, 34, 34, 0.25);
  border-radius: 2px;
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  cursor: pointer;
  color: #222;
  transition: border-color 0.15s;
}

.btn-ghost:hover {
  border-color: #222;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  cursor: pointer;
  user-select: none;
}

.toggle input {
  accent-color: #0cacd7;
  width: 14px;
  height: 14px;
  cursor: pointer;
}

/* ── Error ── */
.error {
  max-width: 580px;
  width: 100%;
  padding: 12px 16px;
  background: #ffe6e3;
  border: 1px solid #fc675e;
  border-radius: 3px;
  font-size: 13px;
  color: #b60404;
  font-family: 'Space Mono', monospace;
  text-align: left;
}

/* ── Loading ── */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  color: rgba(34, 34, 34, 0.5);
  font-size: 14px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(34, 34, 34, 0.1);
  border-top-color: #0cacd7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Canvas area ── */
.canvas-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
}

.count-hint {
  font-size: 11px;
  color: rgba(34, 34, 34, 0.45);
  font-family: 'Space Mono', monospace;
  letter-spacing: 0.04em;
}

/* ── Footer ── */
.footer {
  padding: 16px 24px;
  text-align: center;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: rgba(34, 34, 34, 0.4);
  border-top: 1px solid rgba(34, 34, 34, 0.1);
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.footer-legal {
  font-size: 11px;
  color: rgba(34, 34, 34, 0.3);
}

.footer-legal a {
  color: rgba(34, 34, 34, 0.35);
}

.footer a {
  color: rgba(34, 34, 34, 0.5);
  text-decoration: none;
  transition: color 0.15s;
}

.footer a:hover {
  color: #0cacd7;
}

.sep {
  margin: 0 8px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero {
    padding: 48px 16px;
    gap: 20px;
  }

  .controls {
    padding: 16px 16px 0;
  }

  .canvas-area {
    padding: 16px;
  }

  .mockup {
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 32px 16px;
  }

  .controls-row {
    gap: 8px;
  }

  .footer {
    padding: 12px 16px;
    font-size: 11px;
  }
}
</style>
