import { CacheStrategy, CacheOptions, CacheEvent } from '../types/index.ts'
import { RedisService } from './redis.ts'
import { CompressionService } from './compression.ts'
import { MetricsService } from './metrics.ts'
import { LoggerService } from './logger.ts'
import { CACHE_TTL } from '../config/cache.ts'

export class CacheService implements CacheStrategy {
  private redis: RedisService
  private compressor: CompressionService
  private metrics: MetricsService
  private logger: LoggerService

  constructor() {
    this.redis = new RedisService()
    this.compressor = new CompressionService()
    this.metrics = new MetricsService()
    this.logger = new LoggerService()
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      
      if (!data) {
        this.metrics.recordMiss()
        this.logger.log({
          type: 'miss',
          key,
          timestamp: Date.now()
        })
        return null
      }

      this.metrics.recordHit()
      this.logger.log({
        type: 'hit',
        key,
        timestamp: Date.now()
      })

      return data.value as T
    } catch (error) {
      this.metrics.recordError()
      this.logger.error(error as Error)
      throw error
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      let processedValue = value

      if (options.compress) {
        processedValue = await this.compressor.compress(value)
      }

      await this.redis.set(key, processedValue, {
        ttl: options.ttl || CACHE_TTL.MEDIUM,
        tags: options.tags,
        priority: options.priority,
        compress: options.compress
      })

      this.logger.log({
        type: 'set',
        key,
        timestamp: Date.now(),
        details: {
          ttl: options.ttl,
          tags: options.tags,
          priority: options.priority,
          compressed: options.compress
        }
      })
    } catch (error) {
      this.metrics.recordError()
      this.logger.error(error as Error)
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.delete(key)
      this.logger.log({
        type: 'delete',
        key,
        timestamp: Date.now()
      })
    } catch (error) {
      this.metrics.recordError()
      this.logger.error(error as Error)
      throw error
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.clear()
      this.logger.log({
        type: 'clear',
        key: 'all',
        timestamp: Date.now()
      })
    } catch (error) {
      this.metrics.recordError()
      this.logger.error(error as Error)
      throw error
    }
  }

  async getStats(): Promise<CacheStats> {
    return this.metrics.getStats()
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      await this.redis.invalidateByTags(tags)
      this.logger.log({
        type: 'invalidation',
        key: 'tags',
        timestamp: Date.now(),
        details: { tags }
      })
    } catch (error) {
      this.metrics.recordError()
      this.logger.error(error as Error)
      throw error
    }
  }
} 