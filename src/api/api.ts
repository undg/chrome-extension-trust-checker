import { fetchRating } from '@/api/fetchRating'
import { scrapeRating } from '@/api/scrapeRating'
import type { RatingAPI as IRatingAPI, TrustpilotRating } from '@/shared/types'

type RatingClientConfig = {
  strategy: 'api' | 'scraper'
  baseUrl?: string
}

/** Fetches ratings via API with scraper fallback. */
export class Api implements IRatingAPI {
  private config: RatingClientConfig

  constructor(config: RatingClientConfig) {
    this.config = config
  }

  /** @returns Null if not found or on error. */
  async fetchRating(domain: string): Promise<TrustpilotRating | null> {
    if (this.config.strategy === 'api' && this.config.baseUrl) {
      const result = await fetchRating(domain, { baseUrl: this.config.baseUrl })
      if (result !== null) {
        return result
      }
    }

    return scrapeRating(domain)
  }

  setConfig(config: RatingClientConfig): void {
    this.config = config
  }
}
