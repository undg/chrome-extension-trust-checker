import type { TrustpilotRating } from '@/shared/types'

interface CacheEntry {
  data: TrustpilotRating
  timestamp: number
  ttl: number
}

interface CacheStorage {
  [domain: string]: CacheEntry
}

const CACHE_KEY = 'trustchecker_rating_cache'
const DEFAULT_TTL = 30 * 60 * 1000

class RatingCache {
  private memoryCache: Map<string, CacheEntry> = new Map()
  private initialized = false

  async init(): Promise<void> {
    if (this.initialized) return

    const result = await chrome.storage.local.get([CACHE_KEY])
    const stored = result[CACHE_KEY] as CacheStorage | undefined

    if (stored) {
      for (const [domain, entry] of Object.entries(stored)) {
        if (!this.isExpired(entry)) {
          this.memoryCache.set(domain, entry)
        }
      }
    }

    this.initialized = true
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  async get(domain: string): Promise<TrustpilotRating | null> {
    await this.init()

    const entry = this.memoryCache.get(domain)
    if (!entry) return null

    if (this.isExpired(entry)) {
      this.memoryCache.delete(domain)
      await this.persist()
      return null
    }

    return entry.data
  }

  async set(
    domain: string,
    data: TrustpilotRating,
    ttl: number = DEFAULT_TTL,
  ): Promise<void> {
    await this.init()

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    }

    this.memoryCache.set(domain, entry)
    await this.persist()
  }

  async clear(domain?: string): Promise<void> {
    await this.init()

    if (domain) {
      this.memoryCache.delete(domain)
    } else {
      this.memoryCache.clear()
    }

    await this.persist()
  }

  async resetTtl(domain: string, newTtl: number = DEFAULT_TTL): Promise<void> {
    await this.init()

    const entry = this.memoryCache.get(domain)
    if (entry) {
      entry.timestamp = Date.now()
      entry.ttl = newTtl
      await this.persist()
    }
  }

  async getCacheInfo(domain: string): Promise<{
    cached: boolean
    age: number
    ttl: number
    expiresIn: number
  } | null> {
    await this.init()

    const entry = this.memoryCache.get(domain)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    const expiresIn = entry.ttl - age

    return {
      cached: !this.isExpired(entry),
      age,
      ttl: entry.ttl,
      expiresIn: Math.max(0, expiresIn),
    }
  }

  private async persist(): Promise<void> {
    const storage: CacheStorage = {}
    for (const [domain, entry] of this.memoryCache) {
      storage[domain] = entry
    }

    await chrome.storage.local.set({ [CACHE_KEY]: storage })
  }
}

export const ratingCache = new RatingCache()
