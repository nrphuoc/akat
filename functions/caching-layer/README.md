# Caching Layer

Caching Layer là một Edge Function của Supabase cung cấp các dịch vụ cache phân tán sử dụng Redis.

## Cấu trúc

```
caching-layer/
├── src/
│   ├── config/
│   │   └── cache.ts
│   ├── services/
│   │   ├── redis.ts
│   │   ├── compression.ts
│   │   ├── metrics.ts
│   │   └── logger.ts
│   ├── types/
│   │   └── index.ts
│   └── strategies/
│       └── index.ts
└── index.ts
```

## Tính năng

- Cache phân tán với Redis
- Nén dữ liệu
- Invalidation dựa trên tags
- Metrics và monitoring
- Logging
- Retry mechanism
- TLS encryption
- Cache warming
- Cache eviction policies

## Cài đặt

1. Thiết lập các biến môi trường:

```bash
REDIS_URL=your_redis_url
REDIS_PASSWORD=your_redis_password
CACHE_DEFAULT_TTL=3600
CACHE_MAX_RETRIES=3
CACHE_RETRY_DELAY=1000
CACHE_PREFIX=your_app_prefix
CACHE_COMPRESSION=true
CACHE_MAX_SIZE=1000
```

2. Cài đặt Redis:

Ubuntu:
```bash
sudo apt update
sudo apt install redis-server
```

macOS:
```bash
brew install redis
```

Windows:
```bash
# Tải Redis từ https://github.com/microsoftarchive/redis/releases
```

## API Endpoints

### Cache Operations

```
GET /get?key=<key>
POST /set
Body: {
  "key": "<key>",
  "value": "<value>",
  "ttl": 3600,
  "tags": ["tag1", "tag2"]
}
DELETE /delete?key=<key>
POST /clear
GET /stats
POST /invalidate
Body: {
  "tags": ["tag1", "tag2"]
}
```

### Cache Management

```
POST /warm
Body: {
  "keys": ["key1", "key2"]
}
GET /keys?pattern=<pattern>
POST /evict
Body: {
  "pattern": "<pattern>"
}
```

## Sử dụng

### Lấy dữ liệu từ cache

```typescript
// Lấy dữ liệu
const response = await fetch('https://your-project.supabase.co/functions/v1/caching-layer/get?key=user:123', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Lưu dữ liệu vào cache

```typescript
// Lưu dữ liệu
const response = await fetch('https://your-project.supabase.co/functions/v1/caching-layer/set', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    key: 'user:123',
    value: {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com'
    },
    ttl: 3600,
    tags: ['user', 'profile']
  })
})
```

### Xóa dữ liệu khỏi cache

```typescript
// Xóa dữ liệu
const response = await fetch('https://your-project.supabase.co/functions/v1/caching-layer/delete?key=user:123', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Invalidate cache theo tags

```typescript
// Invalidate cache
const response = await fetch('https://your-project.supabase.co/functions/v1/caching-layer/invalidate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tags: ['user']
  })
})
```

### Cache warming

```typescript
// Cache warming
const response = await fetch('https://your-project.supabase.co/functions/v1/caching-layer/warm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    keys: ['user:123', 'user:456']
  })
})
```

## Phát triển

### Chạy locally

```bash
supabase start
supabase functions serve caching-layer
```

### Deploy

```bash
supabase functions deploy caching-layer
```

### Thiết lập secrets

```bash
supabase secrets set REDIS_URL=your_redis_url
supabase secrets set REDIS_PASSWORD=your_redis_password
supabase secrets set CACHE_DEFAULT_TTL=3600
supabase secrets set CACHE_MAX_RETRIES=3
supabase secrets set CACHE_RETRY_DELAY=1000
supabase secrets set CACHE_PREFIX=your_app_prefix
supabase secrets set CACHE_COMPRESSION=true
supabase secrets set CACHE_MAX_SIZE=1000
```

## Bảo mật

- TLS encryption
- Password protection
- Rate limiting
- Input validation
- Error handling
- Logging
- Access control

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT 