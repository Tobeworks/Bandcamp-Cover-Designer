import { test, expect } from '@playwright/test'

test.describe('Bandcamp Cover Designer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('zeigt leeren State beim Start', async ({ page }) => {
    await expect(page.getByText('Bandcamp-Künstlernamen eingeben')).toBeVisible()
    await expect(page.getByTestId('artist-input')).toBeVisible()
    await expect(page.getByTestId('load-btn')).toBeDisabled()
  })

  test('aktiviert Load-Button bei Eingabe', async ({ page }) => {
    await page.getByTestId('artist-input').fill('logikmoon')
    await expect(page.getByTestId('load-btn')).toBeEnabled()
  })

  test('Layout-Picker wechselt das Layout', async ({ page }) => {
    // Layout-Picker erst nach dem Laden sichtbar
    // Wir mocken die API-Antwort
    await page.route('/api/bandcamp*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          artist: 'test',
          albums: Array.from({ length: 16 }, (_, i) => ({
            id: String(i),
            title: `Album ${i + 1}`,
            imageUrl: `https://picsum.photos/seed/${i}/300/300`,
            releaseDate: null,
            url: null,
          })),
        }),
      })
    )

    await page.getByTestId('artist-input').fill('test')
    await page.getByTestId('load-btn').click()
    await expect(page.getByTestId('collage')).toBeVisible()

    await page.getByTestId('layout-4x4').click()
    await expect(page.getByTestId('layout-4x4')).toHaveClass(/active/)
  })

  test('Download-Button ist aktiv nach dem Laden', async ({ page }) => {
    await page.route('/api/bandcamp*', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          artist: 'test',
          albums: Array.from({ length: 9 }, (_, i) => ({
            id: String(i),
            title: `Album ${i + 1}`,
            imageUrl: `https://picsum.photos/seed/${i}/300/300`,
            releaseDate: null,
            url: null,
          })),
        }),
      })
    )

    await page.getByTestId('artist-input').fill('test')
    await page.getByTestId('load-btn').click()
    await expect(page.getByTestId('download-btn')).toBeEnabled()
  })

  test('zeigt Fehler bei unbekanntem Artist', async ({ page }) => {
    await page.route('/api/bandcamp*', route =>
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Artist "unknown123xyz" not found on Bandcamp' }),
      })
    )

    await page.getByTestId('artist-input').fill('unknown123xyz')
    await page.getByTestId('load-btn').click()
    await expect(page.getByText(/not found/i)).toBeVisible()
  })
})
