import { ApiCache } from '../types/index.ts'
import { CACHE_TTL } from '../config/api.ts'

const cacheStore = new Map<string, ApiCache>()

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    const cache = cacheStore.get(key)
    
    if (!cache) {
      return null
    }

    const now = Date.now()
    if (now - cache.createdAt > cache.ttl * 1000) {
      cacheStore.delete(key)
      return null
    }

    return cache.value as T
  }

  static async set(key: string, value: any, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    const cache: ApiCache = {
      key,
      value,
      ttl,
      createdAt: Date.now()
    }

    cacheStore.set(key, cache)
  }

  static async delete(key: string): Promise<void> {
    cacheStore.delete(key)
  }

  static async clear(): Promise<void> {
    cacheStore.clear()
  }

  static async has(key: string): Promise<boolean> {
    const cache = cacheStore.get(key)
    
    if (!cache) {
      return false
    }

    const now = Date.now()
    if (now - cache.createdAt > cache.ttl * 1000) {
      cacheStore.delete(key)
      return false
    }

    return true
  }
} 