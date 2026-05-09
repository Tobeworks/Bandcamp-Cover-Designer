<template>
  <div class="min-h-screen flex flex-col bg-surface">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header class="bg-header border-b-2 border-primary" role="banner">
      <div class="max-w-5xl mx-auto px-6 h-[53px] flex items-center justify-between">
        <div class="flex items-center gap-3" aria-label="Bandcamp Cover Designer">
          <span class="bg-primary text-white font-mono font-bold text-base px-2 py-0.5 rounded-sm tracking-tight" aria-hidden="true">bc</span>
          <span class="text-white text-sm tracking-widest uppercase font-mono">Cover Designer</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-sm text-white/70 hover:text-white transition-colors"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggle"
          >
            <Sun v-if="isDark" :size="16" />
            <Moon v-else :size="16" />
          </button>
          <RouterLink
            to="/app"
            class="h-8 px-4 bg-primary text-white text-sm font-mono font-bold rounded-sm flex items-center gap-1.5 transition-colors hover:bg-primary-hover no-underline"
          >
            Open Designer →
          </RouterLink>
        </div>
      </div>
    </header>

    <main id="main-content" class="flex-1 flex flex-col items-center text-center px-4 py-16 sm:py-20 gap-6" role="main" aria-labelledby="hero-heading">

      <span class="inline-block px-4 py-1 border border-ink/16 rounded-full text-sm text-muted bg-surface" role="note">
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
        <div class="flex items-center flex-1 h-12 bg-card border-0 border-ink/16 overflow-hidden focus:ring-0">
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

    <footer class="border-t border-ink/8 py-4 px-6 flex flex-col items-center gap-1.5 text-sm font-mono text-ink/40" role="contentinfo">
      <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <a
          href="https://github.com/tobeworks/bandcamp-cover-designer"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 text-ink/53 hover:text-primary no-underline transition-colors"
          aria-label="View source on GitHub"
        >
          <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
        <span aria-hidden="true">·</span>
        <span>Open Source built by <a href="https://tobeworks.de" target="_blank" rel="noopener noreferrer" class="text-ink/53 hover:text-primary no-underline transition-colors">tobeworks.de</a></span>
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
import { Search, Moon, Sun } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { version } from '../../package.json'
import { useDarkMode } from '../composables/useDarkMode'

const { isDark, toggle } = useDarkMode()

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
