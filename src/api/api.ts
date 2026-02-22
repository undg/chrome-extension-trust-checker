import type { RatingAPI as IRatingAPI, TrustpilotRating } from '../shared/types'
import { fetchRating } from './fetchRating'
import { scrapeRating } from './scrapeRating'

/**
 * Configuration options for RatingClient.
 */
export interface RatingClientConfig {
  /** The strategy to use for fetching ratings */
  strategy: 'api' | 'scraper'
  /** The base URL of the proxy API server (required when strategy is 'api') */
  baseUrl?: string
}

/**
 * Unified client for fetching Trustpilot ratings using either a proxy API or direct scraping.
 *
 * @remarks
 * This class implements the strategy pattern, allowing you to switch between:
 * - **API strategy**: Fetches from a hosted proxy server (keeps API keys secure)
 * - **Scraper strategy**: Scrapes Trustpilot directly (no server required)
 *
 * The scraper strategy is used as a fallback if the API request fails.
 *
 * @example
 * ```typescript
 * // Use scraper (default)
 * const client = new RatingClient({ strategy: 'scraper' })
 * const rating = await client.fetchRating('github.com')
 *
 * // Use proxy API
 * const client = new RatingClient({
 *   strategy: 'api',
 *   baseUrl: 'https://api.example.com'
 * })
 * const rating = await client.fetchRating('github.com')
 * ```
 */
export class RatingClient implements IRatingAPI {
  private config: RatingClientConfig

  /**
   * Creates a new RatingClient instance.
   *
   * @param config - Configuration for the client
   */
  constructor(config: RatingClientConfig) {
    this.config = config
  }

  /**
   * Fetches the Trustpilot rating for a given domain.
   *
   * @param domain - The domain to look up (e.g., "example.com")
   * @returns The rating data, or null if not found or on error
   *
   * @remarks
   * - If strategy is 'api' and baseUrl is provided, tries the proxy API first
   * - Falls back to scraper on API failure or when strategy is 'scraper'
   * - If strategy is 'api' but no baseUrl is provided, uses scraper
   */
  async fetchRating(domain: string): Promise<TrustpilotRating | null> {
    if (this.config.strategy === 'api' && this.config.baseUrl) {
      const result = await fetchRating(domain, { baseUrl: this.config.baseUrl })
      if (result !== null) {
        return result
      }
      // Fallback to scraper on API failure
    }

    return scrapeRating(domain)
  }

  /**
   * Updates the configuration at runtime.
   *
   * @param config - New configuration options
   *
   * @example
   * ```typescript
   * // Switch from scraper to API at runtime
   * client.setConfig({ strategy: 'api', baseUrl: 'https://api.example.com' })
   * ```
   */
  setConfig(config: RatingClientConfig): void {
    this.config = config
  }
}

/**
 * Default instance using the scraper strategy.
 *
 * @remarks
 * This is a convenience export for common usage. For custom configuration,
 * create your own instance with `new RatingClient(config)`.
 */
export const ratingClient = new RatingClient({
  strategy: 'scraper',
})
