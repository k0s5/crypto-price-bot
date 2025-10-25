// Supported cryptocurrencies
export const SUPPORTED_COINS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  TRX: 'tron',
  DOGE: 'dogecoin',
  SOL: 'solana',
  PKOIN: 'pocketcoin'
} as const

export type CoinSymbol = keyof typeof SUPPORTED_COINS
export type CoinId = (typeof SUPPORTED_COINS)[CoinSymbol]

export const REVERSE_COINS = Object.fromEntries(
  Object.entries(SUPPORTED_COINS).map(([key, value]) => [value, key])
) as { [K in CoinId]: CoinSymbol }

// Supported fiat currencies
export const FIAT_CURRENCIES = ['USD', 'EUR', 'RUB'] as const
export type FiatCurrency = (typeof FIAT_CURRENCIES)[number]

// CoinGecko API response types
export interface CoinGeckoPrice {
  [coinId: string]: {
    [currency: string]: number
  }
}

// Cache entry structure
export interface CacheEntry {
  data: CoinGeckoPrice
  timestamp: number
}

// User session data
export interface UserSession {
  selectedCoin?: CoinSymbol
  fiatCurrency: FiatCurrency
}
