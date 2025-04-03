# Notification Layer

Notification Layer là một Edge Function của Supabase cung cấp các dịch vụ gửi và nhận thông báo qua các kênh khác nhau như email, Zalo, Lark, Slack.

## Cấu trúc

```
notification-layer/
├── src/
│   ├── config/
│   │   └── notification.ts
│   ├── services/
│   │   └── notification.ts
│   ├── providers/
│   │   ├── email.ts
│   │   └── chat.ts
│   └── types/
│       └── index.ts
└── index.ts
```

## Tính năng

- Gửi email thông qua Resend
- Gửi tin nhắn chat qua Zalo, Lark, Slack
- Hỗ trợ template với biến
- Lưu trữ lịch sử thông báo
- Xử lý webhook để nhận thông báo
- Xử lý lỗi và retry

## Cài đặt

1. Thiết lập các biến môi trường:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@example.com
ZALO_ACCESS_TOKEN=your_zalo_access_token
LARK_ACCESS_TOKEN=your_lark_access_token
SLACK_BOT_TOKEN=your_slack_bot_token
NOTIFICATION_MAX_RETRIES=3
NOTIFICATION_RETRY_DELAY=1000
NOTIFICATION_TIMEOUT=30000
```

2. Tạo các bảng trong Supabase:

```sql
-- Bảng template thông báo
create table notification_templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  provider text not null,
  type text not null,
  content text not null,
  variables text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng thông báo
create table notification_messages (
  id uuid default uuid_generate_v4() primary key,
  provider text not null,
  type text not null,
  recipient text not null,
  subject text,
  content text not null,
  template text,
  data jsonb,
  status text not null,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## API Endpoints

### Gửi thông báo

```
POST /send
Body: {
  "provider": "<provider>",
  "type": "<type>",
  "recipient": "<recipient>",
  "subject": "<subject>",
  "content": "<content>",
  "template": "<template_id>",
  "data": {
    "key": "value"
  }
}
```

### Lấy danh sách template

```
GET /templates?provider=<provider>&type=<type>
```

### Webhook nhận thông báo

```
POST /webhook
Body: {
  "provider": "<provider>",
  "from": "<from>",
  "subject": "<subject>",
  "text": "<text>"
}
```

### Lấy trạng thái thông báo

```
GET /status?provider=<provider>&type=<type>&status=<status>&limit=10&offset=0
```

## Sử dụng

### Gửi email

```typescript
// Gửi email
const response = await fetch('https://your-project.supabase.co/functions/v1/notification-layer/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'email',
    type: 'email',
    recipient: 'user@example.com',
    subject: 'Welcome',
    content: 'Welcome to our platform!',
    template: 'welcome_email',
    data: {
      name: 'John Doe'
    }
  })
})
```

### Gửi tin nhắn chat

```typescript
// Gửi tin nhắn Zalo
const response = await fetch('https://your-project.supabase.co/functions/v1/notification-layer/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'zalo',
    type: 'chat',
    recipient: 'user_id',
    content: 'Hello from Zalo!',
    template: 'welcome_message',
    data: {
      name: 'John Doe'
    }
  })
})

// Gửi tin nhắn Lark
const response = await fetch('https://your-project.supabase.co/functions/v1/notification-layer/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'lark',
    type: 'chat',
    recipient: 'user_id',
    content: 'Hello from Lark!',
    template: 'welcome_message',
    data: {
      name: 'John Doe'
    }
  })
})

// Gửi tin nhắn Slack
const response = await fetch('https://your-project.supabase.co/functions/v1/notification-layer/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'slack',
    type: 'chat',
    recipient: 'channel_id',
    content: 'Hello from Slack!',
    template: 'welcome_message',
    data: {
      name: 'John Doe'
    }
  })
})
```

## Phát triển

### Chạy locally

```bash
supabase start
supabase functions serve notification-layer
```

### Deploy

```bash
supabase functions deploy notification-layer
```

### Thiết lập secrets

```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
supabase secrets set SUPABASE_SERVICE_KEY=your_supabase_service_key
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set EMAIL_FROM=noreply@example.com
supabase secrets set ZALO_ACCESS_TOKEN=your_zalo_access_token
supabase secrets set LARK_ACCESS_TOKEN=your_lark_access_token
supabase secrets set SLACK_BOT_TOKEN=your_slack_bot_token
supabase secrets set NOTIFICATION_MAX_RETRIES=3
supabase secrets set NOTIFICATION_RETRY_DELAY=1000
supabase secrets set NOTIFICATION_TIMEOUT=30000
```

## Bảo mật

- Xác thực API key cho các dịch vụ
- Mã hóa dữ liệu nhạy cảm
- Giới hạn thời gian chờ
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