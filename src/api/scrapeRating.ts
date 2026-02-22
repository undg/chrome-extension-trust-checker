import type { TrustpilotRating } from '@/shared/types'
import { buildTrustpilotUrl } from '@/shared/utils'

/**
 * Scrapes Trustpilot rating directly from the website.
 * Returns null if not found or on error.
 */
export async function scrapeRating(
  domain: string,
): Promise<TrustpilotRating | null> {
  try {
    const url = buildTrustpilotUrl(domain)

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0',
      },
    })

    if (!response.ok) {
      return null
    }

    const html = await response.text()

    const rating = extractRating(html)
    const reviewCount = extractReviewCount(html)
    const trustScore = extractTrustScore(html)

    if (rating === null) {
      return null
    }

    return {
      domain,
      rating,
      reviewCount,
      trustScore: trustScore || undefined,
      url,
      fetchedAt: Date.now(),
    }
  } catch {
    return null
  }
}

/**
 * Extracts rating from Trustpilot HTML.
 * Tries JSON-LD structured data first, then falls back to meta tags.
 */
function extractRating(html: string): number | null {
  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )

  if (jsonLdMatch) {
    for (const script of jsonLdMatch) {
      try {
        const json = JSON.parse(
          script.replace(/<script[^>]*>|<\/script>/gi, ''),
        )

        if (json.aggregateRating?.ratingValue) {
          return parseFloat(json.aggregateRating.ratingValue)
        }

        if (json['@graph'] && Array.isArray(json['@graph'])) {
          for (const item of json['@graph']) {
            if (item.aggregateRating?.ratingValue) {
              return parseFloat(item.aggregateRating.ratingValue)
            }
          }
        }
      } catch {
        // Continue to next script
      }
    }
  }

  const metaMatch = html.match(/<meta[^>]*ratingValue[^>]*content="([\d.]+)"/i)
  if (metaMatch) {
    return parseFloat(metaMatch[1])
  }

  return null
}

/**
 * Extracts review count from Trustpilot HTML.
 * Returns 0 if not found.
 */
function extractReviewCount(html: string): number {
  const jsonLdMatch = html.match(
    /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )

  if (jsonLdMatch) {
    for (const script of jsonLdMatch) {
      try {
        const json = JSON.parse(
          script.replace(/<script[^>]*>|<\/script>/gi, ''),
        )

        if (json.aggregateRating?.reviewCount) {
          return parseInt(json.aggregateRating.reviewCount, 10)
        }

        if (json['@graph'] && Array.isArray(json['@graph'])) {
          for (const item of json['@graph']) {
            if (item.aggregateRating?.reviewCount) {
              return parseInt(item.aggregateRating.reviewCount, 10)
            }
          }
        }
      } catch {
        // Continue
      }
    }
  }

  return 0
}

/**
 * Extracts trust score label (e.g., "Excellent", "Great") from Trustpilot HTML.
 */
function extractTrustScore(html: string): string | null {
  const match = html.match(
    /"trustScore"[^>]*>([^<]+)<|data-rating-qualifier[^>]*>([^<]+)</i,
  )
  if (match) {
    return (match[1] || match[2])?.trim() || null
  }

  return null
}
