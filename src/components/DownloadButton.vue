<template>
  <button
    class="flex items-center gap-2 px-4 py-1.5 bg-ink text-white border border-white/10 rounded-sm text-xs font-mono tracking-wide cursor-pointer transition-colors hover:bg-ink/80 disabled:opacity-40 disabled:cursor-not-allowed"
    :disabled="disabled || downloading"
    :aria-label="downloading ? 'Generating PNG…' : 'Download 1080×1080 PNG'"
    data-testid="download-btn"
    @click="handleDownload"
  >
    <span v-if="downloading" class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" aria-hidden="true" />
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
