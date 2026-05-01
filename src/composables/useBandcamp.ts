import { ref } from 'vue'
import type { Album } from '../types'

export function useBandcamp() {
  const albums = ref<Album[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const artistName = ref('')

  async function fetchAlbums(artist: string) {
    loading.value = true
    error.value = null
    albums.value = []
    artistName.value = artist

    try {
      const res = await fetch(`/api/bandcamp?artist=${encodeURIComponent(artist)}`)
      const data = await res.json()

      if (!res.ok) {
        error.value = data.error ?? 'Fehler beim Laden der Alben.'
        return
      }

      if (!data.albums?.length) {
        error.value = `No releases found for "${artist}".`
        return
      }

      albums.value = data.albums
    } catch {
      error.value = 'Network error. Is the dev server running?'
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
