import 'dotenv/config'
import { Bot } from 'grammy'
import { getSession, setFiatCurrency } from './session'
import { fetchPrices } from './coingecko'
import { formatPriceResponse, formatSingleCoinResponse } from './formatters'
import {
  createCoinSelectionKeyboard,
  createCoinDetailsKeyboard,
  createCurrencySelectionKeyboard
} from './keyboards'
import { logger } from './logger'
import { SUPPORTED_COINS } from './types'
import type { CoinSymbol, FiatCurrency } from './types'

const TELEGRAM_BOT_API_KEY = process.env.TELEGRAM_BOT_API_KEY
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY

if (!TELEGRAM_BOT_API_KEY) {
  throw new Error('Please set the TELEGRAM_BOT_API_KEY environment variable.')
}

if (!COINGECKO_API_KEY) {
  throw new Error('Please set the COINGECKO_API_KEY environment variable.')
}

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(TELEGRAM_BOT_API_KEY)

/**
 * /start command handler
 */
bot.command('start', async ctx => {
  const userId = ctx.from?.id
  if (!userId) return

  const session = getSession(userId)

  const replyMessage =
    `👋 <b>Добро пожаловать в Крипто Прайс Бот!</b>\n\n` +
    `📊 Выберите валюту, чтобы узнать текущую цену.\n\n` +
    `💡 Вы также можете использовать команду:\n` +
    `<code>/price bitcoin ethereum tron</code>`

  await ctx.reply(replyMessage, {
    parse_mode: 'HTML',
    reply_markup: createCoinSelectionKeyboard(session.fiatCurrency)
  })
})

/**
 * /price command handler
 */
bot.command('price', async ctx => {
  const userId = ctx.from?.id
  if (!userId) return

  const session = getSession(userId)
  const args = ctx.message?.text?.split(' ').slice(1) || []

  if (args.length === 0) {
    const supportedCurrencies = Object.entries(SUPPORTED_COINS)
      .map(([symbol, id]) => `• ${symbol} (${id})`)
      .join('\n')

    const reply =
      `❌ <b>Укажите названия криптовалют</b>\n\n` +
      `Пример: <code>/price bitcoin ethereum tron</code>\n\n` +
      `Поддерживаемые валюты:\n` +
      `${supportedCurrencies}`

    await ctx.reply(reply, { parse_mode: 'HTML' })
    return
  }

  try {
    // Convert arguments to lowercase for API
    const coinIds = args.map(arg => arg.toLowerCase())

    // Fetch prices
    const data = await fetchPrices(coinIds, session.fiatCurrency)

    // Format and send response
    const replyMessage = formatPriceResponse(data, args, session.fiatCurrency)
    await ctx.reply(replyMessage, { parse_mode: 'HTML' })
  } catch (error: any) {
    await ctx.reply(error.message || '❌ Произошла ошибка при получении цен')
  }
})

/**
 * Callback query handler for coin selection
 */
bot.callbackQuery(/^coin:(.+)$/, async ctx => {
  const userId = ctx.from?.id
  if (!userId) return

  const coinSymbol = ctx.match[1] as CoinSymbol
  const session = getSession(userId)

  try {
    const coinId = SUPPORTED_COINS[coinSymbol]
    const data = await fetchPrices([coinId], session.fiatCurrency)

    const price = data[coinId][session.fiatCurrency.toLowerCase()]
    const cacheKey = `${coinId}-${session.fiatCurrency}`

    const replyMessage = formatSingleCoinResponse(
      coinSymbol,
      price,
      session.fiatCurrency,
      cacheKey
    )

    await ctx.editMessageText(replyMessage, {
      parse_mode: 'HTML',
      reply_markup: createCoinDetailsKeyboard(coinSymbol, session.fiatCurrency)
    })
    await ctx.answerCallbackQuery()
  } catch (error: any) {
    await ctx.answerCallbackQuery({
      text: error.message || 'Ошибка при получении цены',
      show_alert: true
    })
  }
})

/**
 * Callback query handler for price refresh
 */
bot.callbackQuery(/^refresh:(.+)$/, async ctx => {
  const userId = ctx.from?.id
  if (!userId) return

  const coinSymbol = ctx.match[1] as CoinSymbol
  const session = getSession(userId)

  try {
    const coinId = SUPPORTED_COINS[coinSymbol]
    const data = await fetchPrices([coinId], session.fiatCurrency)

    const price = data[coinId][session.fiatCurrency.toLowerCase()]
    const cacheKey = `${coinId}-${session.fiatCurrency}`

    const replyMessage = formatSingleCoinResponse(
      coinSymbol,
      price,
      session.fiatCurrency,
      cacheKey
    )

    await ctx.editMessageText(replyMessage, {
      parse_mode: 'HTML',
      reply_markup: createCoinDetailsKeyboard(coinSymbol, session.fiatCurrency)
    })
    await ctx.answerCallbackQuery({ text: '✅ Обновлено' })
  } catch (error: any) {
    await ctx.answerCallbackQuery({
      text: error.message || 'Ошибка при обновлении',
      show_alert: true
    })
  }
})

/**
 * Callback query handler for back button
 */
bot.callbackQuery('back', async ctx => {
  const userId = ctx.from?.id
  if (!userId) return

  const session = getSession(userId)

  await ctx.editMessageText('📊 Выберите валюту, чтобы узнать текущую цену:', {
    reply_markup: createCoinSelectionKeyboard(session.fiatCurrency)
  })
  await ctx.answerCallbackQuery()
})

/**
 * Callback query handler for currency selection menu
 */
bot.callbackQuery('currency', async ctx => {
  await ctx.editMessageText('💱 Выберите фиатную валюту:', {
    reply_markup: createCurrencySelectionKeyboard()
  })
  await ctx.answerCallbackQuery()
})

/**
 * Callback query handler for setting currency
 */
bot.callbackQuery(/^setcurrency:(.+)$/, async ctx => {
  const userId = ctx.from?.id
  if (!userId) return

  const currency = ctx.match[1] as FiatCurrency
  setFiatCurrency(userId, currency)

  await ctx.editMessageText(
    `✅ Валюта изменена на <b>${currency}</b>\n\n` +
      '📊 Выберите криптовалюту:',
    {
      parse_mode: 'HTML',
      reply_markup: createCoinSelectionKeyboard(currency)
    }
  )
  await ctx.answerCallbackQuery({ text: `Валюта: ${currency}` })
})

/**
 * Error handler
 */
bot.catch(err => {
  logger.logError('Bot error', err)
  process.exit(1)
})

// Start the bot
bot.start({
  onStart: () => {
    logger.logBotStart()
    console.log('💬 Bot is running. Press Ctrl+C to stop.')
  }
})
