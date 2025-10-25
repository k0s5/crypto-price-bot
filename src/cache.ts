// src/cache.ts
import { CacheEntry, CoinGeckoPrice } from './types'

// Cache storage with 60 seconds TTL
class PriceCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly TTL = 60 * 1000 // 60 seconds in milliseconds

  /**
   * Get cached price data if still valid
   */
  get(key: string): CoinGeckoPrice | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    const now = Date.now()
    const isExpired = now - entry.timestamp > this.TTL

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Store price data in cache
   */
  set(key: string, data: CoinGeckoPrice): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Get cache age in seconds
   */
  getAge(key: string): number | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }
    return Math.floor((Date.now() - entry.timestamp) / 1000)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }
}

export const priceCache = new PriceCache()
