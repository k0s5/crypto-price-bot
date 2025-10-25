// src/keyboards.ts
import { InlineKeyboard } from 'grammy'
import {
  CoinSymbol,
  SUPPORTED_COINS,
  FiatCurrency,
  FIAT_CURRENCIES
} from './types'
import { getCurrencyEmoji } from './formatters'

/**
 * Create keyboard for coin selection
 */
export function createCoinSelectionKeyboard(
  fiatCurrency: FiatCurrency
): InlineKeyboard {
  const keyboard = new InlineKeyboard()

  const coins = Object.keys(SUPPORTED_COINS) as CoinSymbol[]

  // Add coin buttons in rows of 3
  coins.forEach((coin, index) => {
    keyboard.text(coin, `coin:${coin}`)
    if ((index + 1) % 3 === 0 && index < coins.length - 1) {
      keyboard.row()
    }
  })

  // Add currency selection button
  keyboard.row()
  keyboard.text(`${getCurrencyEmoji(fiatCurrency)} ${fiatCurrency}`, 'currency')

  return keyboard
}

/**
 * Create keyboard for coin details (refresh and back)
 */
export function createCoinDetailsKeyboard(
  coinSymbol: CoinSymbol,
  fiatCurrency: FiatCurrency
): InlineKeyboard {
  const keyboard = new InlineKeyboard()
    .text('🔄 Обновить', `refresh:${coinSymbol}`)
    .row()
    .text('◀️ Выбрать другую валюту', 'back')

  return keyboard
}

/**
 * Create keyboard for currency selection
 */
export function createCurrencySelectionKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard()

  FIAT_CURRENCIES.forEach(currency => {
    keyboard.text(
      `${getCurrencyEmoji(currency)} ${currency}`,
      `setcurrency:${currency}`
    )
  })

  keyboard.row()
  keyboard.text('◀️ Назад', 'back')

  return keyboard
}
