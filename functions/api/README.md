# API Layer

Tầng API là một Edge Function của Supabase, cung cấp các API endpoint an toàn và có xác thực cho ứng dụng.

## Cấu trúc

```
api/
├── src/
│   ├── config/         # Cấu hình
│   ├── middleware/     # Middleware (auth, rate limit)
│   ├── routes/         # Định nghĩa routes
│   ├── services/       # Các service (cache, validation, response)
│   └── types/          # TypeScript interfaces
└── index.ts           # Entry point
```

## Tính năng

- 🔐 Xác thực và phân quyền với JWT
- 🚦 Rate limiting
- 📝 Validation dữ liệu
- 💾 Caching
- 🔄 Error handling
- 📡 CORS support
- 📊 Logging

## Cài đặt

1. Thiết lập biến môi trường:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
```

2. Tạo bảng users trong Supabase:

```sql
create table users (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  name text not null,
  role text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## API Endpoints

### Users

- `GET /api/v1/users` - Lấy danh sách users (Admin)
- `GET /api/v1/users/:id` - Lấy thông tin user (Auth)
- `POST /api/v1/users` - Tạo user mới (Admin)
- `PUT /api/v1/users/:id` - Cập nhật user (Admin)
- `DELETE /api/v1/users/:id` - Xóa user (Admin)

### Auth

- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/refresh` - Làm mới token
- `POST /api/v1/auth/logout` - Đăng xuất

### Tasks

- `GET /api/v1/tasks` - Lấy danh sách tasks
- `POST /api/v1/tasks` - Tạo task mới
- `PUT /api/v1/tasks/:id` - Cập nhật task
- `DELETE /api/v1/tasks/:id` - Xóa task
- `GET /api/v1/tasks/schedule` - Lấy lịch tasks

## Sử dụng

### Gọi API

```typescript
// GET /api/v1/users
const response = await fetch('https://your-project.supabase.co/functions/v1/api/users', {
  headers: {
    'Authorization': 'Bearer your_token'
  }
})

// POST /api/v1/users
const response = await fetch('https://your-project.supabase.co/functions/v1/api/users', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user'
  })
})
```

### Response Format

```typescript
// Success
{
  success: true,
  data: {
    // Response data
  }
}

// Error
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Error message',
    details: {
      // Additional error details
    }
  }
}
```

## Development

### Local Development

1. Cài đặt Deno
2. Chạy lệnh:
```bash
deno run --allow-net --allow-env index.ts
```

### Deployment

1. Deploy lên Supabase:
```bash
supabase functions deploy api
```

2. Thiết lập secrets:
```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
supabase secrets set SUPABASE_SERVICE_KEY=your_supabase_service_key
supabase secrets set JWT_SECRET=your_jwt_secret
supabase secrets set CORS_ORIGINS=http://localhost:3000,https://your-domain.com
```

## Security

- Tất cả endpoints đều được bảo vệ bởi rate limiting
- Các endpoints nhạy cảm yêu cầu xác thực
- CORS được cấu hình để chỉ cho phép các origins được chỉ định
- JWT được sử dụng cho xác thực
- Supabase RLS được tích hợp để bảo vệ dữ liệu

## Contributing

1. Fork repository
2. Tạo branch mới
3. Commit changes
4. Push lên branch
5. Tạo Pull Request

## License

MIT 