# Scheduler Layer

Scheduler Layer là một Edge Function của Supabase cung cấp các dịch vụ lập lịch và thực thi các tác vụ theo định kỳ.

## Cấu trúc

```
scheduler-layer/
├── src/
│   ├── config/
│   │   └── scheduler.ts
│   ├── services/
│   │   ├── scheduler.ts
│   │   ├── job.ts
│   │   └── worker.ts
│   ├── types/
│   │   └── index.ts
│   └── jobs/
│       └── index.ts
└── index.ts
```

## Tính năng

- Lập lịch các tác vụ theo định kỳ
- Hỗ trợ nhiều định dạng cron expression
- Thực thi tác vụ đồng thời
- Xử lý lỗi và retry
- Monitoring và logging
- Rate limiting
- Timezone support

## Cài đặt

1. Thiết lập các biến môi trường:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SCHEDULER_MAX_CONCURRENT_JOBS=5
SCHEDULER_MAX_RETRIES=3
SCHEDULER_RETRY_DELAY=1000
SCHEDULER_TIMEOUT=30000
```

2. Tạo các bảng trong Supabase:

```sql
-- Bảng jobs
create table scheduled_jobs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  cron_expression text not null,
  job_type text not null,
  payload jsonb,
  is_active boolean default true,
  last_run_at timestamp with time zone,
  next_run_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng job executions
create table job_executions (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references scheduled_jobs(id),
  status text not null,
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## API Endpoints

### Quản lý Jobs

```
GET /jobs
POST /jobs
Body: {
  "name": "<name>",
  "description": "<description>",
  "cron_expression": "<cron_expression>",
  "job_type": "<job_type>",
  "payload": {
    "key": "value"
  }
}
PUT /jobs/:id
DELETE /jobs/:id
```

### Trigger Jobs

```
POST /jobs/:id/trigger
```

### Job Status

```
GET /jobs/:id/executions
```

## Sử dụng

### Tạo job mới

```typescript
// Tạo job
const response = await fetch('https://your-project.supabase.co/functions/v1/scheduler-layer/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Daily Report',
    description: 'Generate daily report at midnight',
    cron_expression: '0 0 * * *',
    job_type: 'report',
    payload: {
      report_type: 'daily',
      recipients: ['admin@example.com']
    }
  })
})
```

### Trigger job

```typescript
// Trigger job
const response = await fetch('https://your-project.supabase.co/functions/v1/scheduler-layer/jobs/123/trigger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Xem lịch sử thực thi

```typescript
// Xem lịch sử
const response = await fetch('https://your-project.supabase.co/functions/v1/scheduler-layer/jobs/123/executions', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## Phát triển

### Chạy locally

```bash
supabase start
supabase functions serve scheduler-layer
```

### Deploy

```bash
supabase functions deploy scheduler-layer
```

### Thiết lập secrets

```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
supabase secrets set SUPABASE_SERVICE_KEY=your_supabase_service_key
supabase secrets set SCHEDULER_MAX_CONCURRENT_JOBS=5
supabase secrets set SCHEDULER_MAX_RETRIES=3
supabase secrets set SCHEDULER_RETRY_DELAY=1000
supabase secrets set SCHEDULER_TIMEOUT=30000
```

## Bảo mật

- Rate limiting
- Input validation
- Error handling
- Logging
- Timeout protection
- Concurrent job limits

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT 