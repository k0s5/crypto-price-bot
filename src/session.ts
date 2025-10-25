// src/session.ts
import { UserSession, FiatCurrency } from './types'

// In-memory session storage (no database required)
const sessions = new Map<number, UserSession>()

/**
 * Get or create user session
 */
export function getSession(userId: number): UserSession {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      fiatCurrency: 'USD'
    })
  }
  return sessions.get(userId)!
}

/**
 * Update user's fiat currency preference
 */
export function setFiatCurrency(userId: number, currency: FiatCurrency): void {
  const session = getSession(userId)
  session.fiatCurrency = currency
}

/**
 * Update user's selected coin
 */
export function setSelectedCoin(userId: number, coin: string): void {
  const session = getSession(userId)
  session.selectedCoin = coin as any
}
