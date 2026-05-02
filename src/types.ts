export interface Album {
  id: string
  title: string
  imageUrl: string
  releaseDate: string | null
  url: string | null
}

export type LayoutMode = '1x1' | '2x2' | '3x3' | '4x4' | '5x5' | '2x3' | '3x2' | 'mosaic'

export interface CollageLayout {
  mode: LayoutMode
  label: string
  count: number
  cols: number
  rows: number
}

export const LAYOUTS: CollageLayout[] = [
  { mode: '1x1', label: '1×1', count: 1, cols: 1, rows: 1 },
  { mode: '2x2', label: '2×2', count: 4, cols: 2, rows: 2 },
  { mode: '2x3', label: '2×3', count: 6, cols: 2, rows: 3 },
  { mode: '3x2', label: '3×2', count: 6, cols: 3, rows: 2 },
  { mode: '3x3', label: '3×3', count: 9, cols: 3, rows: 3 },
  { mode: '4x4', label: '4×4', count: 16, cols: 4, rows: 4 },
  { mode: '5x5', label: '5×5', count: 25, cols: 5, rows: 5 },
  { mode: 'mosaic', label: 'Mosaic', count: 9, cols: 3, rows: 3 },
]
