import { connect } from 'https://deno.land/x/redis@v0.29.0/mod.ts'
import { CacheConfig, CacheItem, CacheOptions } from '../types/index.ts'
import { getCacheConfig } from '../config/cache.ts'
import { CACHE_ERRORS } from '../config/cache.ts'

export class RedisService {
  private client: any
  private config: CacheConfig
  private connected: boolean = false

  constructor() {
    this.config = getCacheConfig()
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return
    }

    try {
      this.client = await connect({
        hostname: this.config.redisUrl,
        password: this.config.redisPassword,
        port: 6379,
        tls: true,
        db: 0,
        maxRetryCount: this.config.maxRetries,
        retryInterval: this.config.retryDelay
      })

      this.connected = true
    } catch (error) {
      console.error('Redis connection error:', error)
      throw new Error(CACHE_ERRORS.CONNECTION)
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return
    }

    try {
      await this.client.close()
      this.connected = false
    } catch (error) {
      console.error('Redis disconnection error:', error)
      throw new Error(CACHE_ERRORS.CONNECTION)
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) {
      await this.connect()
    }

    try {
      const data = await this.client.get(this.getKey(key))
      if (!data) {
        return null
      }

      return JSON.parse(data) as T
    } catch (error) {
      console.error('Redis get error:', error)
      throw new Error(CACHE_ERRORS.SERIALIZATION)
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    if (!this.connected) {
      await this.connect()
    }

    try {
      const item: CacheItem = {
        key: this.getKey(key),
        value,
        ttl: options.ttl || this.config.defaultTTL,
        createdAt: Date.now(),
        tags: options.tags,
        priority: options.priority,
        compressed: options.compress
      }

      const data = JSON.stringify(item)
      await this.client.set(this.getKey(key), data, {
        ex: item.ttl
      })

      if (item.tags) {
        await this.addToTags(key, item.tags)
      }
    } catch (error) {
      console.error('Redis set error:', error)
      throw new Error(CACHE_ERRORS.SERIALIZATION)
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.connected) {
      await this.connect()
    }

    try {
      await this.client.del(this.getKey(key))
    } catch (error) {
      console.error('Redis delete error:', error)
      throw new Error(CACHE_ERRORS.INVALIDATION)
    }
  }

  async clear(): Promise<void> {
    if (!this.connected) {
      await this.connect()
    }

    try {
      const keys = await this.client.keys(`${this.config.prefix}*`)
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
    } catch (error) {
      console.error('Redis clear error:', error)
      throw new Error(CACHE_ERRORS.INVALIDATION)
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    if (!this.connected) {
      await this.connect()
    }

    try {
      for (const tag of tags) {
        const keys = await this.client.smembers(`tag:${tag}`)
        if (keys.length > 0) {
          await this.client.del(...keys)
          await this.client.del(`tag:${tag}`)
        }
      }
    } catch (error) {
      console.error('Redis invalidate by tags error:', error)
      throw new Error(CACHE_ERRORS.INVALIDATION)
    }
  }

  private getKey(key: string): string {
    return `${this.config.prefix}${key}`
  }

  private async addToTags(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.client.sadd(`tag:${tag}`, this.getKey(key))
    }
  }
} 