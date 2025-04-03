# Automation Layer

Automation Layer là một Edge Function của Supabase cung cấp các dịch vụ tự động hóa dựa trên các quy tắc và hành động.

## Cấu trúc

```
automation-layer/
├── src/
│   ├── config/
│   │   └── automation.ts
│   ├── services/
│   │   ├── ruleEngine.ts
│   │   └── actionExecutor.ts
│   ├── types/
│   │   └── index.ts
│   ├── rules/
│   │   └── index.ts
│   └── actions/
│       └── index.ts
└── index.ts
```

## Tính năng

- Xử lý quy tắc tự động
- Thực thi các hành động
- Hỗ trợ các loại sự kiện (database_change, schedule, webhook)
- Xử lý lỗi và retry
- Giới hạn số lượng hành động đồng thời
- Timeout cho webhook

## Cài đặt

1. Thiết lập các biến môi trường:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
WEBHOOK_SECRET=your_webhook_secret
MAX_RETRIES=3
RETRY_DELAY=1000
```

2. Tạo bảng trong Supabase:

```sql
-- Bảng quy tắc tự động
create table automation_rules (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  condition jsonb not null,
  actions jsonb[] not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## API Endpoints

### Kích hoạt quy tắc

```
POST /trigger
Body: {
  "event_type": "<event_type>",
  "data": {
    "key": "value"
  }
}
```

### Quản lý quy tắc

```
GET /rules
POST /rules
PUT /rules/:id
DELETE /rules/:id
```

## Sử dụng

### Kích hoạt quy tắc

```typescript
// Kích hoạt quy tắc
const response = await fetch('https://your-project.supabase.co/functions/v1/automation-layer/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event_type: 'database_change',
    data: {
      table: 'users',
      operation: 'insert',
      record: {
        id: '123',
        name: 'John Doe'
      }
    }
  })
})
```

### Tạo quy tắc

```typescript
// Tạo quy tắc
const response = await fetch('https://your-project.supabase.co/functions/v1/automation-layer/rules', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Welcome Email',
    description: 'Send welcome email to new users',
    condition: {
      type: 'database_change',
      table: 'users',
      operation: 'insert'
    },
    actions: [
      {
        type: 'email',
        template: 'welcome_email',
        recipient: '{{record.email}}',
        data: {
          name: '{{record.name}}'
        }
      }
    ]
  })
})
```

## Phát triển

### Chạy locally

```bash
supabase start
supabase functions serve automation-layer
```

### Deploy

```bash
supabase functions deploy automation-layer
```

### Thiết lập secrets

```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
supabase secrets set SUPABASE_SERVICE_KEY=your_supabase_service_key
supabase secrets set WEBHOOK_SECRET=your_webhook_secret
supabase secrets set MAX_RETRIES=3
supabase secrets set RETRY_DELAY=1000
```

## Bảo mật

- Xác thực webhook
- Giới hạn số lượng hành động đồng thời
- Timeout cho webhook
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