export interface Album {
  id: string
  title: string
  imageUrl: string
  releaseDate: string | null
  url: string | null
}

export type LayoutMode = '2x2' | '3x3' | '4x4' | 'mosaic'

export interface CollageLayout {
  mode: LayoutMode
  label: string
  count: number
  cols: number
  rows: number
}

export const LAYOUTS: CollageLayout[] = [
  { mode: '2x2', label: '2×2', count: 4, cols: 2, rows: 2 },
  { mode: '3x3', label: '3×3', count: 9, cols: 3, rows: 3 },
  { mode: '4x4', label: '4×4', count: 16, cols: 4, rows: 4 },
  { mode: 'mosaic', label: 'Mosaic', count: 9, cols: 3, rows: 3 },
]
