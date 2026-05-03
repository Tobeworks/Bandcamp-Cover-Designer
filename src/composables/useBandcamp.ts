import { ref } from 'vue'
import type { Album, LayoutMode } from '../types'
import { LAYOUTS } from '../types'

export function useBandcamp() {
  const albums = ref<Album[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const artistName = ref('')

  function clampLayout(current: LayoutMode, count: number): LayoutMode {
    const available = LAYOUTS.filter(l => l.count <= count)
    if (available.find(l => l.mode === current)) return current
    return available[available.length - 1]?.mode ?? '1x1'
  }

  async function fetchAlbums(artist: string, currentLayout?: LayoutMode): Promise<LayoutMode | null> {
    loading.value = true
    error.value = null
    albums.value = []
    artistName.value = artist

    try {
      const res = await fetch(`/api/bandcamp?artist=${encodeURIComponent(artist)}`)
      const data = await res.json()

      if (!res.ok) {
        error.value = data.error ?? 'Fehler beim Laden der Alben.'
        return null
      }

      if (!data.albums?.length) {
        error.value = `No releases found for "${artist}".`
        return null
      }

      albums.value = data.albums
      return currentLayout ? clampLayout(currentLayout, data.albums.length) : null
    } catch {
      error.value = 'Network error. Is the dev server running?'
      return null
    } finally {
      loading.value = false
    }
  }

  function shuffle() {
    const arr = [...albums.value]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    albums.value = arr
  }

  return { albums, loading, error, artistName, fetchAlbums, shuffle }
}
