import { CoinGeckoPrice, FiatCurrency } from './types'
import { priceCache } from './cache'
import { logger } from './logger'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'
const REQUEST_TIMEOUT = 5000 // 5 seconds

/**
 * Fetch cryptocurrency prices from CoinGecko API
 */
export async function fetchPrices(
  coinIds: string[],
  fiatCurrency: FiatCurrency = 'USD'
): Promise<CoinGeckoPrice> {
  const cacheKey = `${coinIds.sort().join(',')}-${fiatCurrency}`

  // Check cache first
  const cachedData = priceCache.get(cacheKey)
  if (cachedData) {
    const age = priceCache.getAge(cacheKey)
    logger.logCacheHit(cacheKey, age || 0)
    return cachedData
  }

  logger.logCacheMiss(cacheKey)

  // Build API URL
  const ids = coinIds.join(',')
  const currencies = fiatCurrency.toLowerCase()
  const url = `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=${currencies}`

  try {
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    logger.logRequest(coinIds, fiatCurrency)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`
      )
    }

    const data = (await response.json()) as CoinGeckoPrice

    // Validate response
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from CoinGecko API')
    }

    // Store in cache
    priceCache.set(cacheKey, data)

    return data
  } catch (error: any) {
    if (error.name === 'AbortError') {
      logger.logError('Request timeout', { coinIds, fiatCurrency })
      throw new Error(
        '⏱️ Превышено время ожидания ответа от API. Попробуйте позже.'
      )
    }

    logger.logError('API request failed', {
      error: error.message,
      coinIds,
      fiatCurrency
    })

    if (error.message.includes('CoinGecko API error')) {
      throw new Error(
        '🚫 Ошибка при обращении к API CoinGecko. Попробуйте позже.'
      )
    }

    throw new Error(
      '❌ Не удалось получить данные о ценах. Проверьте подключение к интернету.'
    )
  }
}

/**
 * Validate if coin ID exists in CoinGecko
 */
export function isValidCoinId(coinId: string): boolean {
  // This is a simple check - in production you might want to maintain a list
  return coinId.length > 0 && /^[a-z0-9-]+$/.test(coinId)
}
