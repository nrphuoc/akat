export interface CacheConfig {
  redisUrl: string
  redisPassword: string
  defaultTTL: number
  maxRetries: number
  retryDelay: number
  prefix: string
}

export interface CacheOptions {
  ttl?: number
  tags?: string[]
  priority?: number
  compress?: boolean
}

export interface CacheItem<T = any> {
  key: string
  value: T
  ttl: number
  createdAt: number
  tags?: string[]
  priority?: number
  compressed?: boolean
}

export interface CacheStats {
  hits: number
  misses: number
  errors: number
  evictions: number
  memoryUsage: number
}

export interface CacheStrategy {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: any, options?: CacheOptions): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  getStats(): Promise<CacheStats>
  invalidateByTags(tags: string[]): Promise<void>
}

export interface CacheEvent {
  type: 'hit' | 'miss' | 'error' | 'eviction'
  key: string
  timestamp: number
  details?: any
}

export interface CacheLogger {
  log(event: CacheEvent): void
  error(error: Error): void
  warn(message: string): void
  info(message: string): void
  debug(message: string): void
}

export interface CacheMetrics {
  recordHit(): void
  recordMiss(): void
  recordError(): void
  recordEviction(): void
  getStats(): CacheStats
  reset(): void
}

export interface CacheCompressor {
  compress(data: any): Promise<Buffer>
  decompress(data: Buffer): Promise<any>
}

export interface CacheSerializer {
  serialize(data: any): string
  deserialize(data: string): any
}

export interface CacheValidator {
  isValid(data: any): boolean
  validate(data: any): void
} 