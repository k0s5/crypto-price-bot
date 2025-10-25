// src/formatters.ts
import { CoinGeckoPrice, FiatCurrency, CoinSymbol } from './types'
import { priceCache } from './cache'
import { REVERSE_COINS } from './types'
import type { CoinId } from './types'

/**
 * Format price with proper currency symbol and thousand separators
 */
export function formatPrice(price: number, currency: FiatCurrency): string {
  const symbols: Record<FiatCurrency, string> = {
    USD: '$',
    EUR: '€',
    RUB: '₽'
  }

  const symbol = symbols[currency]

  // Format with thousand separators
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 6 : 2
  })

  return `${symbol}${formatted}`
}

/**
 * Format response for /price command
 */
export function formatPriceResponse(
  data: CoinGeckoPrice,
  coinIds: string[],
  fiatCurrency: FiatCurrency
): string {
  const currencyLower = fiatCurrency.toLowerCase()
  let response = '💰 <b>Текущие цены</b>\n\n'

  for (const coinId of coinIds) {
    const coinIdUppercase = coinId.toUpperCase()
    const coinIdLowercase = coinId.toLowerCase()

    if (
      data[coinIdLowercase] &&
      data[coinIdLowercase][currencyLower] !== undefined
    ) {
      const coinSymbol = REVERSE_COINS[coinId as CoinId]
      const price = data[coinIdLowercase][currencyLower]
      response += `<b>${coinSymbol}</b>: ${formatPrice(price, fiatCurrency)}\n`
    } else {
      response += `<b>${coinIdUppercase}</b>: ❌ Не найдена\n`
    }
  }

  return response
}

/**
 * Format response for single coin with update time
 */
export function formatSingleCoinResponse(
  coinSymbol: CoinSymbol,
  price: number,
  fiatCurrency: FiatCurrency,
  cacheKey: string
): string {
  const ageSeconds = priceCache.getAge(cacheKey)
  const timeAgo = ageSeconds !== null ? formatTimeAgo(ageSeconds) : 'только что'

  return `💎 <b>${coinSymbol}</b>: ${formatPrice(
    price,
    fiatCurrency
  )}\n\n⏱ Обновлено: ${timeAgo}`
}

/**
 * Format time ago in Russian
 */
function formatTimeAgo(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} сек назад`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) {
    return '1 мин назад'
  }
  if (minutes < 5) {
    return `${minutes} мин назад`
  }

  return `${minutes} мин назад`
}

/**
 * Get currency flag emoji
 */
export function getCurrencyEmoji(currency: FiatCurrency): string {
  const emojis: Record<FiatCurrency, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    RUB: '🇷🇺'
  }
  return emojis[currency]
}
