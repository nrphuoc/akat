import { CacheLogger, CacheEvent } from '../types/index.ts'
import { CACHE_MESSAGES } from '../config/cache.ts'

export class LoggerService implements CacheLogger {
  private formatMessage(level: string, message: string, details?: any): string {
    const timestamp = new Date().toISOString()
    const detailsStr = details ? ` ${JSON.stringify(details)}` : ''
    return `[${timestamp}] ${level}: ${message}${detailsStr}`
  }

  log(event: CacheEvent): void {
    const message = CACHE_MESSAGES[event.type.toUpperCase()]
    console.log(this.formatMessage('INFO', message, {
      key: event.key,
      timestamp: event.timestamp,
      details: event.details
    }))
  }

  error(error: Error): void {
    console.error(this.formatMessage('ERROR', error.message, {
      stack: error.stack,
      name: error.name
    }))
  }

  warn(message: string): void {
    console.warn(this.formatMessage('WARN', message))
  }

  info(message: string): void {
    console.info(this.formatMessage('INFO', message))
  }

  debug(message: string): void {
    console.debug(this.formatMessage('DEBUG', message))
  }
} 