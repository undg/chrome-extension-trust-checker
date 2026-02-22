import { describe, expect, it, vi } from 'vitest'
import { Api } from './api'

describe('RatingClient', () => {
  it('uses scraper when strategy is scraper', async () => {
    const api = new Api({ strategy: 'scraper' })

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(`
        <script type="application/ld+json">
        {"aggregateRating": {"ratingValue": "4.2", "reviewCount": "500"}}
        </script>
      `),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await api.fetchRating('example.com')

    expect(result).not.toBeNull()
    expect(result?.rating).toBe(4.2)
  })

  it('uses proxy when strategy is api', async () => {
    const api = new Api({
      strategy: 'api',
      baseUrl: 'https://api.example.com',
    })

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          domain: 'example.com',
          rating: 4.8,
          reviewCount: 2000,
          trustScore: 'Excellent',
          url: 'https://trustpilot.com/review/example.com',
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await api.fetchRating('example.com')

    expect(result).not.toBeNull()
    expect(result?.rating).toBe(4.8)
    expect(result?.trustScore).toBe('Excellent')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/rating?domain=example.com',
      expect.any(Object),
    )
  })

  it('falls back to scraper when proxy fails', async () => {
    const api = new Api({
      strategy: 'api',
      baseUrl: 'https://api.example.com',
    })

    const mockFetch = vi
      .fn()
      // First call fails (proxy)
      .mockResolvedValueOnce({ ok: false, status: 500 })
      // Second call succeeds (scraper fallback)
      .mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve(`
          <script type="application/ld+json">
          {"aggregateRating": {"ratingValue": "3.5", "reviewCount": "100"}}
          </script>
        `),
      })
    vi.stubGlobal('fetch', mockFetch)

    const result = await api.fetchRating('example.com')

    expect(result).not.toBeNull()
    expect(result?.rating).toBe(3.5)
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('can switch config at runtime', async () => {
    const api = new Api({ strategy: 'scraper' })

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          domain: 'example.com',
          rating: 4.5,
          reviewCount: 1000,
        }),
    })
    vi.stubGlobal('fetch', mockFetch)

    // First with scraper
    api.setConfig({ strategy: 'scraper' })
    await api.fetchRating('example.com')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('trustpilot.com'),
      expect.any(Object),
    )

    // Now switch to proxy
    api.setConfig({ strategy: 'api', baseUrl: 'https://api.example.com' })
    await api.fetchRating('example.com')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.example.com'),
      expect.any(Object),
    )
  })
})
