// Simple logger for tracking API requests and updates
class Logger {
  private requestCount = 0
  private lastUpdateTime: Date | null = null

  /**
   * Log API request
   */
  logRequest(coinIds: string[], fiat: string): void {
    this.requestCount++
    this.lastUpdateTime = new Date()
    console.log(
      `[${new Date().toISOString()}] API Request #${
        this.requestCount
      }: ${coinIds.join(', ')} in ${fiat}`
    )
  }

  /**
   * Log cache hit
   */
  logCacheHit(key: string, ageSeconds: number): void {
    console.log(
      `[${new Date().toISOString()}] Cache HIT: ${key} (age: ${ageSeconds}s)`
    )
  }

  /**
   * Log cache miss
   */
  logCacheMiss(key: string): void {
    console.log(`[${new Date().toISOString()}] Cache MISS: ${key}`)
  }

  /**
   * Log error
   */
  logError(error: string, details?: any): void {
    console.error(
      `[${new Date().toISOString()}] ERROR: ${error}`,
      details || ''
    )
  }

  /**
   * Get statistics
   */
  getStats(): { requestCount: number; lastUpdate: string | null } {
    return {
      requestCount: this.requestCount,
      lastUpdate: this.lastUpdateTime ? this.lastUpdateTime.toISOString() : null
    }
  }

  /**
   * Log bot start
   */
  logBotStart(): void {
    console.log(`[${new Date().toISOString()}] 🚀 Bot started successfully`)
  }
}

export const logger = new Logger()
