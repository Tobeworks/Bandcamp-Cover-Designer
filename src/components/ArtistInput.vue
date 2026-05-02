<template>
  <form
    class="artist-input"
    :class="{ 'artist-input--hero': hero }"
    role="search"
    aria-label="Search Bandcamp artist"
    @submit.prevent="handleSubmit"
  >
    <div class="input-wrap">
      <svg v-if="hero" class="search-icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        v-model="value"
        type="text"
        :placeholder="hero ? 'e.g. portishead' : 'artist-name'"
        autocomplete="off"
        spellcheck="false"
        :disabled="loading"
        :aria-label="hero ? 'Bandcamp artist name or URL' : 'Artist name'"
        class="input"
        data-testid="artist-input"
      />
      <span v-if="!hero" class="suffix" aria-hidden="true">.bandcamp.com</span>
    </div>
    <button
      type="submit"
      :disabled="loading || !value.trim()"
      class="btn"
      :aria-label="loading ? 'Loading…' : hero ? 'Generate collage' : 'Load releases'"
      data-testid="load-btn"
    >
      <span v-if="loading" class="spinner" aria-hidden="true" />
      <span v-else>{{ hero ? 'Generate Collage' : 'Load' }}</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { loading, hero = false } = defineProps<{ loading: boolean; hero?: boolean }>()
const emit = defineEmits<{ submit: [artist: string] }>()

const value = ref('')

function parseArtist(input: string): string {
  let s = input.trim()
  s = s.replace(/^https?:\/\//i, '')
  s = s.split('/')[0]
  if (s.toLowerCase().includes('.bandcamp.com')) {
    s = s.split('.bandcamp.com')[0]
  }
  return s.toLowerCase()
}

function handleSubmit() {
  const artist = parseArtist(value.value)
  if (artist) emit('submit', artist)
}
</script>

<style scoped>
.artist-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ── Hero variant ── */
.artist-input--hero {
  width: 100%;
  max-width: 580px;
  gap: 0;
}

.artist-input--hero .input-wrap {
  background: #fff;
  border: 1px solid rgba(34, 34, 34, 0.16);
  border-right: none;
  border-radius: 2px 0 0 2px;
  max-width: none;
  height: 48px;
}

.artist-input--hero .input {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  padding: 0 12px;
  height: 100%;
}

.artist-input--hero .btn {
  border-radius: 0 2px 2px 0;
  height: 48px;
  padding: 0 24px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 500;
  letter-spacing: 0;
  font-size: 14px;
}

/* ── Default variant ── */
.input-wrap {
  display: flex;
  align-items: center;
  background: rgba(34, 34, 34, 0.08);
  border-radius: 3px;
  border: 1px solid rgba(34, 34, 34, 0.72);
  overflow: hidden;
  flex: 1;
  max-width: 420px;
}

.search-icon {
  flex-shrink: 0;
  margin-left: 12px;
  color: #aaa;
}

.input {
  flex: 1;
  padding: 8px 6px 8px 12px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: 'Space Mono', monospace;
  color: #222;
  min-width: 0;
}

.suffix {
  padding: 8px 12px 8px 0;
  font-size: 13px;
  color: rgba(34, 34, 34, 0.5);
  font-family: 'Space Mono', monospace;
  white-space: nowrap;
  user-select: none;
}

.input::placeholder {
  color: #aaa;
}

.input:disabled {
  opacity: 0.5;
}

/* ── Focus visible ── */
.input:focus-visible {
  outline: 2px solid #0cacd7;
  outline-offset: -2px;
  border-radius: 2px;
}

.btn {
  padding: 8px 20px;
  background: #0cacd7;
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: #0a9bbf;
}

.btn:focus-visible {
  outline: 2px solid #0cacd7;
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .artist-input--hero {
    flex-direction: column;
    gap: 8px;
  }

  .artist-input--hero .input-wrap {
    border-right: 1px solid rgba(34, 34, 34, 0.16);
    border-radius: 2px;
    width: 100%;
  }

  .artist-input--hero .btn {
    border-radius: 2px;
    width: 100%;
  }
}
</style>
