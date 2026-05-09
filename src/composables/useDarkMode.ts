import { ref, watch } from 'vue'

const LS_KEY = 'bc-dark-mode'

// Default: dark
const stored = localStorage.getItem(LS_KEY)
const isDark = ref(stored === null ? true : stored === 'true')

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

apply(isDark.value)

watch(isDark, (val) => {
  apply(val)
  localStorage.setItem(LS_KEY, String(val))
})

export function useDarkMode() {
  return {
    isDark,
    toggle: () => { isDark.value = !isDark.value },
  }
}
