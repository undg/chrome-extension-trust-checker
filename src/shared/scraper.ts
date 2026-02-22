import type { RatingAPI, TrustpilotRating } from './types'
import { buildTrustpilotUrl } from './utils'

export class ScraperRatingAPI implements RatingAPI {
  async fetchRating(domain: string): Promise<TrustpilotRating | null> {
    try {
      const url = buildTrustpilotUrl(domain)

      // Fetch Trustpilot page
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

      // Extract rating from JSON-LD or meta tags
      const rating = this.extractRating(html)
      const reviewCount = this.extractReviewCount(html)
      const trustScore = this.extractTrustScore(html)

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

  private extractRating(html: string): number | null {
    // Try JSON-LD structured data first
    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    )

    if (jsonLdMatch) {
      for (const script of jsonLdMatch) {
        try {
          const json = JSON.parse(
            script.replace(/<script[^>]*>|<\/script>/gi, ''),
          )

          // Check top level first
          if (json.aggregateRating?.ratingValue) {
            return parseFloat(json.aggregateRating.ratingValue)
          }

          // Check @graph array (Trustpilot uses this structure)
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

    // Fallback: meta tags
    const metaMatch = html.match(
      /<meta[^>]*ratingValue[^>]*content="([\d.]+)"/i,
    )
    if (metaMatch) {
      return parseFloat(metaMatch[1])
    }

    return null
  }

  private extractReviewCount(html: string): number {
    // Try JSON-LD
    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    )

    if (jsonLdMatch) {
      for (const script of jsonLdMatch) {
        try {
          const json = JSON.parse(
            script.replace(/<script[^>]*>|<\/script>/gi, ''),
          )

          // Check top level first
          if (json.aggregateRating?.reviewCount) {
            return parseInt(json.aggregateRating.reviewCount, 10)
          }

          // Check @graph array (Trustpilot uses this structure)
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

  private extractTrustScore(html: string): string | null {
    // Look for trust score text (e.g., "Excellent", "Great", "Average")
    const match = html.match(
      /"trustScore"[^>]*>([^<]+)<|data-rating-qualifier[^>]*>([^<]+)</i,
    )
    if (match) {
      return (match[1] || match[2])?.trim() || null
    }

    return null
  }
}
