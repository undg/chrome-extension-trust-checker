import { ScraperRatingAPI } from './scraper'
import type { RatingAPI, TrustpilotRating } from './types'

interface ProxyConfig {
  baseUrl: string | null
  useScraper: boolean
}

export class ProxyRatingAPI implements RatingAPI {
  private config: ProxyConfig
  private scraper: ScraperRatingAPI

  constructor(config: ProxyConfig) {
    this.config = config
    this.scraper = new ScraperRatingAPI()
  }

  async fetchRating(domain: string): Promise<TrustpilotRating | null> {
    // If no proxy configured, use scraper
    if (this.config.useScraper || !this.config.baseUrl) {
      return this.scraper.fetchRating(domain)
    }

    // Use hosted proxy API
    try {
      const response = await fetch(
        `${this.config.baseUrl}/rating?domain=${encodeURIComponent(domain)}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )

      if (!response.ok) {
        // Fallback to scraper on failure
        return this.scraper.fetchRating(domain)
      }

      const data = await response.json()

      return {
        domain: data.domain || domain,
        rating: data.rating,
        reviewCount: data.reviewCount,
        trustScore: data.trustScore,
        url: data.url || `https://www.trustpilot.com/review/${domain}`,
        fetchedAt: Date.now(),
      }
    } catch {
      // Fallback to scraper
      return this.scraper.fetchRating(domain)
    }
  }

  // Method to switch between scraper and proxy
  setConfig(config: ProxyConfig) {
    this.config = config
  }
}

// Default instance using scraper (can be switched to proxy later)
export const ratingAPI = new ProxyRatingAPI({
  baseUrl: null,
  useScraper: true,
})
