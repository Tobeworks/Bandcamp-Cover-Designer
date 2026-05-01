<template>
  <button class="btn" :disabled="disabled || downloading" @click="handleDownload" data-testid="download-btn">
    <span v-if="downloading" class="spinner" />
    <span v-else>↓ PNG (1080×1080)</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  disabled: boolean
  artistName: string
  onRender: () => Promise<Blob>
}>()

const downloading = ref(false)

async function handleDownload() {
  downloading.value = true
  try {
    const blob = await props.onRender()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.artistName || 'collage'}-bandcamp-collage.png`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.btn {
  padding: 8px 20px;
  background: #222;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 3px;
  font-size: 13px;
  font-family: 'Space Mono', monospace;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.04em;
}

.btn:hover:not(:disabled) {
  background: #333;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
