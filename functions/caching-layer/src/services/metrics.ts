import { CacheMetrics, CacheStats } from '../types/index.ts'

export class MetricsService implements CacheMetrics {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    evictions: 0,
    memoryUsage: 0
  }

  recordHit(): void {
    this.stats.hits++
  }

  recordMiss(): void {
    this.stats.misses++
  }

  recordError(): void {
    this.stats.errors++
  }

  recordEviction(): void {
    this.stats.evictions++
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  reset(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      evictions: 0,
      memoryUsage: 0
    }
  }

  updateMemoryUsage(usage: number): void {
    this.stats.memoryUsage = usage
  }
} 