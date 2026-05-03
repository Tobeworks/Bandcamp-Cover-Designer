<template>
  <form
    class="flex w-full"
    :class="hero ? 'max-w-xl' : 'max-w-lg'"
    role="search"
    aria-label="Search Bandcamp artist"
    @submit.prevent="handleSubmit"
  >
    <!-- Input wrapper -->
    <div
      class="flex items-center flex-1 bg-white border border-r-0 border-[#22222229] overflow-hidden"
      :class="hero
        ? 'h-12 rounded-l-sm'
        : 'h-10 rounded-l-[3px] bg-[#22222215] border-[#22222280]'"
    >
      <Search v-if="hero" :size="15" class="shrink-0 ml-3 text-[#aaa]" aria-hidden="true" />
      <input
        v-model="value"
        type="text"
        :placeholder="hero ? 'e.g. portishead' : 'artist-name'"
        autocomplete="off"
        spellcheck="false"
        :disabled="loading"
        :aria-label="hero ? 'Bandcamp artist name or URL' : 'Artist name'"
        class="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-[#222] placeholder:text-[#aaa] disabled:opacity-50"
        :class="hero ? 'px-3 font-sans' : 'px-3 font-mono'"
        data-testid="artist-input"
      />
      <span v-if="!hero" class="pr-3 text-xs text-[#22222250] font-mono whitespace-nowrap select-none" aria-hidden="true">.bandcamp.com</span>
    </div>

    <!-- Submit button -->
    <button
      type="submit"
      :disabled="loading || !value.trim()"
      class="flex items-center justify-center gap-2 bg-[#0cacd7] text-white border-none cursor-pointer font-medium transition-colors hover:bg-[#0a9bbf] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      :class="hero
        ? 'h-12 px-6 rounded-r-sm text-sm'
        : 'h-10 px-5 rounded-r-[3px] text-sm font-mono font-bold tracking-wide'"
      :aria-label="loading ? 'Loading…' : hero ? 'Generate collage' : 'Load releases'"
      data-testid="load-btn"
    >
      <span v-if="loading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin-smooth" aria-hidden="true" />
      <span v-else>{{ hero ? 'Generate Collage' : 'Load' }}</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'

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
