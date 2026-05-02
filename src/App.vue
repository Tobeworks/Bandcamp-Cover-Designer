<template>
  <div class="app">
    <header class="header">
      <div class="logo">
        <span class="logo-bc">bc</span>
        <span class="logo-label">Cover Designer</span>
      </div>
    </header>

    <main class="main">
      <div class="controls">
        <ArtistInput :loading="loading" @submit="handleSubmit" />

        <div v-if="albums.length" class="controls-row">
          <LayoutPicker v-model="layout" :albumCount="albums.length" />
          <button class="btn-ghost" @click="shuffle" title="Randomize order">⇄ Shuffle</button>
          <label class="toggle">
            <input type="checkbox" v-model="showBranding" />
            <span>Branding</span>
          </label>
          <DownloadButton
            :disabled="!albums.length"
            :artistName="artistName"
            :onRender="() => collageRef!.renderToCanvas()"
          />
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!albums.length && !loading && !error" class="empty">
        <p>Enter a Bandcamp artist name and click <strong>Load</strong>.</p>
        <p class="hint">Examples: <code>logicmoon</code> · <code>ninjatune</code> · <code>brainfeeder</code></p>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner" />
        <p>Loading releases…</p>
      </div>

      <div v-if="albums.length" class="canvas-area">
        <CollageCanvas
          ref="collageRef"
          :albums="albums"
          :layout="layout"
          :artistName="artistName"
          :showBranding="showBranding"
        />
        <p class="count-hint">{{ albums.length }} releases found · showing {{ currentLayout.count }}</p>
      </div>
    </main>

    <footer class="footer">
      <a href="https://logic-moon.de" target="_blank" rel="noopener">logic-moon.de</a>
      <span class="sep">·</span>
      <a href="https://the-moon-records.de" target="_blank" rel="noopener">the-moon-records.de</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #222;
  padding: 0 24px;
  height: 53px;
  display: flex;
  align-items: center;
  border-bottom: 2px solid #0cacd7;
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

.main {
  flex: 1;
  padding: 32px 24px;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.controls {
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
  border: 1px solid rgba(34,34,34,0.25);
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

.error {
  padding: 12px 16px;
  background: #ffe6e3;
  border: 1px solid #fc675e;
  border-radius: 3px;
  font-size: 13px;
  color: #b60404;
  font-family: 'Space Mono', monospace;
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: rgba(34,34,34,0.5);
}

.empty p { font-size: 15px; line-height: 1.6; }
.empty strong { color: #0cacd7; }

.hint {
  margin-top: 8px;
  font-size: 13px !important;
}

.hint code {
  background: rgba(34,34,34,0.08);
  padding: 1px 5px;
  border-radius: 2px;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: rgba(34,34,34,0.5);
  font-size: 14px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(34,34,34,0.1);
  border-top-color: #0cacd7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.canvas-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.count-hint {
  font-size: 11px;
  color: rgba(34,34,34,0.45);
  font-family: 'Space Mono', monospace;
  letter-spacing: 0.04em;
}

.footer {
  padding: 20px 24px;
  text-align: center;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: rgba(34,34,34,0.4);
  border-top: 1px solid rgba(34,34,34,0.1);
  margin-top: auto;
}

.footer a {
  color: rgba(34,34,34,0.5);
  text-decoration: none;
  transition: color 0.15s;
}

.footer a:hover {
  color: #0cacd7;
}

.sep {
  margin: 0 8px;
}
</style>
