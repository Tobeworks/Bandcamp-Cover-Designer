<template>
  <div class="layout-picker">
    <button
      v-for="layout in availableLayouts"
      :key="layout.mode"
      :class="['btn', { active: modelValue === layout.mode }]"
      @click="emit('update:modelValue', layout.mode)"
      :data-testid="`layout-${layout.mode}`"
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
  LAYOUTS.filter(l => l.mode === 'mosaic' || l.count <= props.albumCount)
)
</script>

<style scoped>
.layout-picker {
  display: flex;
  gap: 4px;
}

.btn {
  padding: 6px 14px;
  background: transparent;
  color: #222;
  border: 1px solid rgba(34, 34, 34, 0.3);
  border-radius: 2px;
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.03em;
}

.btn:hover {
  border-color: #0cacd7;
  color: #0cacd7;
}

.btn.active {
  background: #0cacd7;
  border-color: #0cacd7;
  color: #fff;
}
</style>
