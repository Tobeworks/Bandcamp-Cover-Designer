<template>
  <!-- Mobile: Modal -->
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="open"
        class="lg:hidden fixed inset-0 z-40 bg-black/60"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>
  </Teleport>

  <!-- Panel — drawer on desktop, modal on mobile -->
  <Transition name="panel">
    <div
      v-if="open"
      class="
        fixed z-50 bg-card border-edge flex flex-col
        inset-x-0 bottom-0 max-h-[80vh] border-t rounded-t-lg
        lg:absolute lg:inset-auto lg:top-0 lg:right-0 lg:bottom-0 lg:w-[300px] lg:max-h-none lg:border-t-0 lg:border-l lg:rounded-none
      "
      role="dialog"
      aria-modal="true"
      aria-label="Filter releases"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-edge flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-ink">
            {{ activeCount }} / {{ albums.length }} releases
          </span>
          <button
            v-if="activeCount < albums.length"
            class="text-[10px] text-primary hover:underline"
            @click="emit('reset')"
          >
            Alle einschließen
          </button>
        </div>
        <button
          class="w-6 h-6 flex items-center justify-center rounded-sm text-subtle hover:text-ink transition-colors"
          aria-label="Filter schließen"
          @click="emit('close')"
        >
          <X :size="14" />
        </button>
      </div>

      <!-- Grid -->
      <div class="overflow-y-auto flex-1 p-3">
        <div class="grid grid-cols-3 lg:grid-cols-4 gap-2">
          <button
            v-for="album in albums"
            :key="album.id"
            class="flex flex-col gap-1 text-left group"
            :aria-pressed="!excludedIds.has(album.id)"
            :aria-label="`${excludedIds.has(album.id) ? 'Einschließen' : 'Ausschließen'}: ${album.title}`"
            @click="emit('toggle', album.id)"
          >
            <div
              class="relative aspect-square overflow-hidden rounded-sm ring-offset-0 transition-all"
              :class="excludedIds.has(album.id)
                ? 'opacity-35 grayscale'
                : 'ring-2 ring-primary'"
            >
              <img
                :src="album.imageUrl"
                :alt="album.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span
              class="text-[10px] leading-tight truncate w-full transition-colors"
              :class="excludedIds.has(album.id) ? 'text-subtle' : 'text-muted'"
            >
              {{ album.title }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import type { Album } from '../types'

const props = defineProps<{
  albums: Album[]
  excludedIds: Set<string>
  open: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
  reset: []
  close: []
}>()

const activeCount = computed(() => props.albums.length - props.excludedIds.size)
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from,
.backdrop-leave-to { opacity: 0; }

/* Mobile: slide up from bottom */
.panel-enter-active,
.panel-leave-active { transition: transform 0.25s ease; }
.panel-enter-from,
.panel-leave-to { transform: translateY(100%); }

@media (min-width: 1024px) {
  /* Desktop: slide in from right */
  .panel-enter-from,
  .panel-leave-to { transform: translateX(100%); }
}
</style>
