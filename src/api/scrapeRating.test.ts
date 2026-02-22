import { describe, expect, it, vi } from 'vitest'
import { scrapeRating } from '@/api/scrapeRating'

describe('scrapeRating', () => {
  it('extracts rating from JSON-LD structured data', async () => {
    const mockHtml = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Example",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": "1234"
        }
      }
      </script>
    `

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await scrapeRating('example.com')

    expect(result).not.toBeNull()
    expect(result?.rating).toBe(4.5)
    expect(result?.reviewCount).toBe(1234)
    expect(result?.domain).toBe('example.com')
  })

  it('extracts rating from @graph array structure (Trustpilot format)', async () => {
    const mockHtml = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          {"@type": "Organization", "name": "Parent"},
          {
            "@type": "LocalBusiness",
            "name": "Trustpilot",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.4",
              "reviewCount": "460242"
            }
          }
        ]
      }
      </script>
    `

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await scrapeRating('trustpilot.com')

    expect(result).not.toBeNull()
    expect(result?.rating).toBe(4.4)
    expect(result?.reviewCount).toBe(460242)
    expect(result?.domain).toBe('trustpilot.com')
  })

  it('returns null when fetch fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await scrapeRating('nonexistent.com')

    expect(result).toBeNull()
  })

  it('returns null when no rating found', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<html><body>No reviews</body></html>'),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await scrapeRating('example.com')

    expect(result).toBeNull()
  })

  it('handles network errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)

    const result = await scrapeRating('example.com')

    expect(result).toBeNull()
  })
})
