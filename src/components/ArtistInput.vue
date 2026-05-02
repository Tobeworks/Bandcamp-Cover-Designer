<template>
  <form class="artist-input" @submit.prevent="handleSubmit">
    <div class="input-wrap">
      <input
        v-model="value"
        type="text"
        placeholder="artist-name"
        autocomplete="off"
        spellcheck="false"
        :disabled="loading"
        class="input"
        data-testid="artist-input"
      />
      <span class="suffix">.bandcamp.com</span>
    </div>
    <button type="submit" :disabled="loading || !value.trim()" class="btn" data-testid="load-btn">
      <span v-if="loading" class="spinner" />
      <span v-else>Load</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { loading } = defineProps<{ loading: boolean }>()
const emit = defineEmits<{ submit: [artist: string] }>()

const value = ref('')

function parseArtist(input: string): string {
  let s = input.trim()
  // Strip protocol
  s = s.replace(/^https?:\/\//i, '')
  // Strip trailing slashes/paths
  s = s.split('/')[0]
  // Extract subdomain from logicmoon.bandcamp.com
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
  color: rgba(34, 34, 34, 0.35);
}

.input:disabled {
  opacity: 0.5;
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
  gap: 8px;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: #0a9bbf;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
