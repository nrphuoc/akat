# Integration Layer

Integration Layer là một Edge Function của Supabase cung cấp các dịch vụ tích hợp với các hệ thống bên ngoài thông qua webhook và OAuth.

## Cấu trúc

```
integration-layer/
├── src/
│   ├── config/
│   │   └── integration.ts
│   ├── services/
│   │   ├── webhook.ts
│   │   ├── oauth.ts
│   │   └── token.ts
│   ├── types/
│   │   └── index.ts
│   └── integrations/
│       └── index.ts
└── index.ts
```

## Tính năng

- Xử lý webhook từ các hệ thống bên ngoài
- Quản lý OAuth flow
- Quản lý token
- Xử lý lỗi và retry
- Logging và monitoring
- Rate limiting

## Cài đặt

1. Thiết lập các biến môi trường:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
WEBHOOK_SECRET=your_webhook_secret
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_REDIRECT_URI=your_oauth_redirect_uri
MAX_RETRIES=3
RETRY_DELAY=1000
```

2. Tạo các bảng trong Supabase:

```sql
-- Bảng webhook
create table webhooks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  url text not null,
  secret text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng OAuth tokens
create table oauth_tokens (
  id uuid default uuid_generate_v4() primary key,
  provider text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## API Endpoints

### Webhook

```
POST /webhook
Body: {
  "event": "<event>",
  "data": {
    "key": "value"
  }
}
```

### OAuth

```
GET /oauth/authorize
GET /oauth/callback
POST /oauth/refresh
```

### Token

```
GET /token
POST /token
DELETE /token
```

## Sử dụng

### Gửi webhook

```typescript
// Gửi webhook
const response = await fetch('https://your-project.supabase.co/functions/v1/integration-layer/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': 'your_webhook_secret'
  },
  body: JSON.stringify({
    event: 'user.created',
    data: {
      user_id: '123',
      email: 'user@example.com'
    }
  })
})
```

### OAuth Flow

```typescript
// Bắt đầu OAuth flow
const response = await fetch('https://your-project.supabase.co/functions/v1/integration-layer/oauth/authorize', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'github',
    redirect_uri: 'https://your-app.com/callback'
  })
})

// Xử lý callback
const response = await fetch('https://your-project.supabase.co/functions/v1/integration-layer/oauth/callback', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'oauth_code',
    state: 'oauth_state'
  })
})
```

### Quản lý token

```typescript
// Lấy token
const response = await fetch('https://your-project.supabase.co/functions/v1/integration-layer/token', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'github'
  })
})

// Tạo token
const response = await fetch('https://your-project.supabase.co/functions/v1/integration-layer/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'github',
    access_token: 'access_token',
    refresh_token: 'refresh_token',
    expires_at: '2024-01-01T00:00:00Z'
  })
})
```

## Phát triển

### Chạy locally

```bash
supabase start
supabase functions serve integration-layer
```

### Deploy

```bash
supabase functions deploy integration-layer
```

### Thiết lập secrets

```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
supabase secrets set SUPABASE_SERVICE_KEY=your_supabase_service_key
supabase secrets set WEBHOOK_SECRET=your_webhook_secret
supabase secrets set OAUTH_CLIENT_ID=your_oauth_client_id
supabase secrets set OAUTH_CLIENT_SECRET=your_oauth_client_secret
supabase secrets set OAUTH_REDIRECT_URI=your_oauth_redirect_uri
supabase secrets set MAX_RETRIES=3
supabase secrets set RETRY_DELAY=1000
```

## Bảo mật

- Xác thực webhook
- Mã hóa token
- Rate limiting
- Xử lý lỗi và retry
- Logging

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT 