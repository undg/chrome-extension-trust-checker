import { TrustpilotRating } from '@/shared/types'
import { buildTrustpilotUrl } from '@/shared/utils'

/**
 * Configuration options for fetching ratings from a proxy API.
 */
export interface FetchRatingConfig {
  /** The base URL of the proxy API server */
  baseUrl: string
}

/**
 * Fetches Trustpilot rating data from a proxy API server.
 *
 * @param domain - The domain to look up (e.g., "example.com")
 * @param config - Configuration including the proxy API base URL
 * @returns The rating data, or null if the request fails
 *
 * @example
 * ```typescript
 * const rating = await fetchRating('github.com', { baseUrl: 'https://api.example.com' })
 * if (rating) {
 *   console.log(`Rating: ${rating.rating}/5`)
 * }
 * ```
 *
 * @throws This function does not throw errors - returns null on any failure
 */
export async function fetchRating(
  domain: string,
  config: FetchRatingConfig,
): Promise<TrustpilotRating | null> {
  try {
    const response = await fetch(
      `${config.baseUrl}/rating?domain=${encodeURIComponent(domain)}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return {
      domain: data.domain || domain,
      rating: data.rating,
      reviewCount: data.reviewCount,
      trustScore: data.trustScore,
      url: data.url || buildTrustpilotUrl(domain),
      fetchedAt: Date.now(),
    }
  } catch {
    return null
  }
}
