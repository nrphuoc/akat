# Ingestion Layer

Ingestion Layer là một Edge Function của Supabase cung cấp các dịch vụ thu thập và xử lý dữ liệu từ nhiều nguồn khác nhau.

## Cấu trúc

```
ingestion-layer/
├── src/
│   ├── config/
│   │   └── ingestion.ts
│   ├── services/
│   │   ├── parser.ts
│   │   ├── validator.ts
│   │   ├── transformer.ts
│   │   └── loader.ts
│   ├── types/
│   │   └── index.ts
│   └── sources/
│       └── index.ts
└── index.ts
```

## Tính năng

- Thu thập dữ liệu từ nhiều nguồn (CSV, JSON, XML, PDF, etc.)
- Xử lý và validate dữ liệu
- Transform dữ liệu theo schema
- Load dữ liệu vào database
- Xử lý lỗi và retry
- Logging và monitoring
- Rate limiting
- Batch processing

## Cài đặt

1. Thiết lập các biến môi trường:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
INGESTION_BATCH_SIZE=1000
INGESTION_MAX_RETRIES=3
INGESTION_RETRY_DELAY=1000
INGESTION_TIMEOUT=30000
```

2. Tạo các bảng trong Supabase:

```sql
-- Bảng ingestion jobs
create table ingestion_jobs (
  id uuid default uuid_generate_v4() primary key,
  source_type text not null,
  source_url text not null,
  status text not null,
  total_records integer default 0,
  processed_records integer default 0,
  failed_records integer default 0,
  error text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng ingestion errors
create table ingestion_errors (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references ingestion_jobs(id),
  record jsonb,
  error text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## API Endpoints

### Job Management

```
POST /jobs
Body: {
  "source_type": "csv",
  "source_url": "<url>",
  "schema": {
    "fields": [
      {
        "name": "id",
        "type": "string"
      },
      {
        "name": "name",
        "type": "string"
      }
    ]
  }
}
GET /jobs
GET /jobs/:id
DELETE /jobs/:id
```

### Job Status

```
GET /jobs/:id/status
GET /jobs/:id/errors
```

## Sử dụng

### Tạo ingestion job

```typescript
// Create job
const response = await fetch('https://your-project.supabase.co/functions/v1/ingestion-layer/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    source_type: 'csv',
    source_url: 'https://example.com/data.csv',
    schema: {
      fields: [
        {
          name: 'id',
          type: 'string'
        },
        {
          name: 'name',
          type: 'string'
        }
      ]
    }
  })
})
```

### Kiểm tra trạng thái

```typescript
// Check status
const response = await fetch('https://your-project.supabase.co/functions/v1/ingestion-layer/jobs/123/status', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Xem lỗi

```typescript
// View errors
const response = await fetch('https://your-project.supabase.co/functions/v1/ingestion-layer/jobs/123/errors', {
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
supabase functions serve ingestion-layer
```

### Deploy

```bash
supabase functions deploy ingestion-layer
```

### Thiết lập secrets

```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
supabase secrets set SUPABASE_SERVICE_KEY=your_supabase_service_key
supabase secrets set INGESTION_BATCH_SIZE=1000
supabase secrets set INGESTION_MAX_RETRIES=3
supabase secrets set INGESTION_RETRY_DELAY=1000
supabase secrets set INGESTION_TIMEOUT=30000
```

## Bảo mật

- Input validation
- Rate limiting
- Error handling
- Logging
- Data validation
- Schema validation
- Access control

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT 