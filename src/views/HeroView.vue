<template>
  <div class="min-h-screen flex flex-col bg-surface">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header class="bg-ink border-b-2 border-primary" role="banner">
      <div class="max-w-5xl mx-auto px-6 h-[53px] flex items-center justify-between">
        <div class="flex items-center gap-3" aria-label="Bandcamp Cover Designer">
          <span class="bg-primary text-white font-mono font-bold text-base px-2 py-0.5 rounded-sm tracking-tight" aria-hidden="true">bc</span>
          <span class="text-white text-sm tracking-widest uppercase font-mono">Cover Designer</span>
        </div>
        <RouterLink
          to="/app"
          class="h-8 px-4 bg-primary text-white text-xs font-mono font-bold rounded-sm flex items-center gap-1.5 transition-colors hover:bg-primary-hover no-underline"
        >
          Open Designer →
        </RouterLink>
      </div>
    </header>

    <main id="main-content" class="flex-1 flex flex-col items-center text-center px-4 py-16 sm:py-20 gap-6" role="main" aria-labelledby="hero-heading">

      <span class="inline-block px-4 py-1 border border-ink/16 rounded-full text-xs text-muted bg-surface" role="note">
        Free Tool
      </span>

      <h1 id="hero-heading" class="text-3xl sm:text-4xl md:text-[40px] font-medium text-ink max-w-3xl leading-tight">
        Turn Any Bandcamp Artist Into a Cover Collage.
      </h1>

      <p class="text-sm text-muted max-w-lg leading-relaxed">
        Enter an artist name. Fetch their full discography. Export a stunning 1080×1080 PNG grid.
        Free, no account required.
      </p>

      <!-- Input -->
      <form class="flex w-full max-w-xl" role="search" aria-label="Search Bandcamp artist" @submit.prevent="handleSubmit">
        <div class="flex items-center flex-1 h-12 bg-white border-0 border-ink/16 overflow-hidden focus:ring-0">
          <Search :size="15" class="shrink-0 ml-3 text-subtle" aria-hidden="true" />
          <input
            v-model="artistInput"
            type="text"
            placeholder="e.g. portishead"
            autocomplete="off"
            spellcheck="false"
            aria-label="Bandcamp artist name or URL"
            class="flex-1 min-w-0 h-full bg-transparent border-none outline-none focus-visible:outline-none text-sm text-ink placeholder:text-subtle px-3"
            data-testid="artist-input"
          />
        </div>
        <button
          type="submit"
          :disabled="!artistInput.trim()"
          class="h-12 px-6 bg-primary text-white text-sm font-medium rounded-r-sm flex items-center justify-center gap-2 transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          aria-label="Generate collage"
          data-testid="load-btn"
        >
          Generate Collage
        </button>
      </form>

      <!-- Mockup -->
      <div class="w-full max-w-3xl rounded-[4px] shadow-sm mt-2 overflow-hidden" aria-hidden="true">
        <img src="../assets/images/bandcamp-desinger-hero-collage.webp" class="w-full h-auto block" alt="" />
      </div>

    </main>

    <footer class="border-t border-ink/8 py-4 px-6 flex flex-col items-center gap-1.5 text-xs font-mono text-ink/40" role="contentinfo">
      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>Built by <a href="https://tobeworks.de" target="_blank" rel="noopener noreferrer" class="text-ink/53 hover:text-primary no-underline transition-colors">tobeworks.de</a></span>
        <span aria-hidden="true">·</span>
        <a href="https://logic-moon.de" target="_blank" rel="noopener noreferrer" class="text-ink/53 hover:text-primary no-underline transition-colors">logic-moon.de</a>
        <span aria-hidden="true">·</span>
        <a href="https://the-moon-records.de" target="_blank" rel="noopener noreferrer" class="text-ink/53 hover:text-primary no-underline transition-colors">the-moon-records.de</a>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-ink/27">
        <a href="https://tobeworks.de/impressum" target="_blank" rel="noopener noreferrer" class="hover:text-primary no-underline transition-colors">Impressum</a>
        <span aria-hidden="true">·</span>
        <a href="https://tobeworks.de/datenschutz" target="_blank" rel="noopener noreferrer" class="hover:text-primary no-underline transition-colors">Datenschutz</a>
        <span aria-hidden="true">·</span>
        <span>v{{ version }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { version } from '../../package.json'

const router = useRouter()
const artistInput = ref('')

function parseArtist(input: string): string {
  let s = input.trim()
  s = s.replace(/^https?:\/\//i, '')
  s = s.split('/')[0]
  if (s.toLowerCase().includes('.bandcamp.com')) s = s.split('.bandcamp.com')[0]
  return s.toLowerCase()
}

function handleSubmit() {
  const artist = parseArtist(artistInput.value)
  if (!artist) return
  router.push({ path: '/app', query: { artist } })
}

</script>
