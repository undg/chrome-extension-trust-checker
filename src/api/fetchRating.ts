import type { TrustpilotRating } from '@/shared/types'
import { buildTrustpilotUrl } from '@/shared/utils'

/** Configuration for fetching ratings from a proxy API. */
export interface FetchRatingConfig {
  /** The base URL of the proxy API server */
  baseUrl: string
}

/**
 * Fetches Trustpilot rating from a proxy API server.
 * Returns null on any failure (does not throw).
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
