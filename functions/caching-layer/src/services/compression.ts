import { CacheCompressor } from '../types/index.ts'
import { CACHE_ERRORS } from '../config/cache.ts'

export class CompressionService implements CacheCompressor {
  async compress(data: any): Promise<Buffer> {
    try {
      const jsonString = JSON.stringify(data)
      const encoder = new TextEncoder()
      const dataArray = encoder.encode(jsonString)
      
      // Sử dụng Gzip compression
      const compressed = await new Response(dataArray).arrayBuffer()
      return Buffer.from(compressed)
    } catch (error) {
      console.error('Compression error:', error)
      throw new Error(CACHE_ERRORS.COMPRESSION)
    }
  }

  async decompress(data: Buffer): Promise<any> {
    try {
      const decoder = new TextDecoder()
      const decompressed = decoder.decode(data)
      return JSON.parse(decompressed)
    } catch (error) {
      console.error('Decompression error:', error)
      throw new Error(CACHE_ERRORS.COMPRESSION)
    }
  }
} 