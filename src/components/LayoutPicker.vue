<template>
  <div class="flex gap-1 flex-wrap" role="group" aria-label="Layout options">
    <button
      v-for="layout in availableLayouts"
      :key="layout.mode"
      class="px-3 py-1.5 border rounded-sm text-xs font-mono cursor-pointer transition-all"
      :class="modelValue === layout.mode
        ? 'bg-primary border-primary text-white'
        : 'bg-transparent border-ink/19 text-ink hover:border-primary hover:text-primary'"
      :aria-pressed="modelValue === layout.mode"
      :aria-label="`${layout.label} layout`"
      :data-testid="`layout-${layout.mode}`"
      @click="emit('update:modelValue', layout.mode)"
    >
      {{ layout.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LAYOUTS } from '../types'
import type { LayoutMode } from '../types'

const props = defineProps<{ modelValue: LayoutMode; albumCount: number }>()
const emit = defineEmits<{ 'update:modelValue': [mode: LayoutMode] }>()

const availableLayouts = computed(() =>
  LAYOUTS.filter(l => l.count <= props.albumCount)
)
</script>
