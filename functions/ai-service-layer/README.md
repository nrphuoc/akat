# AI Service Layer

Hệ thống AI Service Layer cung cấp các dịch vụ AI đa dạng thông qua một API thống nhất, bao gồm phân tích, tạo nội dung, tìm kiếm và kiểm duyệt nội dung.

## Cấu Trúc Thư Mục

```
ai-service-layer/
├── agent/                    # Các agent chuyên biệt - Phục vụ usecase nhỏ
│   ├── base-agent.ts        # Lớp cơ sở cho tất cả các agent
│   └── facebook-moderation-agent.ts  # Agent kiểm duyệt nội dung Facebook
├── standards/               # Các tiêu chuẩn và quy tắc
│   └── facebook-community-standards.ts  # Tiêu chuẩn cộng đồng Facebook
├── src/                     # Source code chính
│   ├── agents/             # Framework agent chung/lớn
│   ├── config/             # Cấu hình hệ thống
│   ├── services/           # Các service
│   ├── types/              # Type definitions
│   └── utils/              # Các utility functions
└── index.ts                # Entry point
```

## Các Tính Năng Chính

### 1. Phân Tích Nội Dung
- Phân tích cảm xúc (sentiment analysis)
- Trích xuất từ khóa
- Phân tích ngữ cảnh

### 2. Tạo Nội Dung
- Tạo nội dung tự động
- Tùy chỉnh model và tham số
- Hỗ trợ nhiều định dạng

### 3. Tìm Kiếm Thông Minh
- Tìm kiếm vector-based
- Tìm kiếm ngữ nghĩa
- Kết hợp với phân tích nội dung

### 4. Kiểm Duyệt Nội Dung
- Kiểm tra tiêu chuẩn cộng đồng
- Phát hiện nội dung vi phạm
- Đề xuất hành động phù hợp

## Cách Sử Dụng

### 1. Khởi Tạo Agent

```typescript
import { createFacebookModerationAgent } from './ai-service-layer';

const agent = createFacebookModerationAgent('your-openai-api-key');
```

### 2. Phân Tích Nội Dung

```typescript
const result = await agent.process({
  content: {
    text: "Nội dung cần kiểm duyệt",
    type: "post",
    media: {
      images: ["url1", "url2"]
    }
  },
  moderation_settings: {
    auto_actions: {
      hide_post: true,
      auto_fix: true
    },
    violation_thresholds: {
      confidence_threshold: 0.8
    }
  }
});
```

### 3. Kết Quả Trả Về

```typescript
{
  analysis: {
    violates: boolean,
    confidence: number,
    violation_type: string,
    reason: string,
    severity: "veryhigh" | "high" | "medium" | "low"
  },
  actions: {
    action_taken: "delete" | "fix" | "none",
    recommendation: string,
    fixed_content?: string,
    reason: string
  },
  model_info: {
    model: string,
    platform: string,
    ai_agent_name: string
  }
}
```

## Cấu Hình

### 1. API Keys
- OpenAI API Key
- LangChain API Key (cho các agent động)

### 2. Model Settings
- Model mặc định: GPT-4
- Temperature: 0.7
- Max tokens: 1000

### 3. Thresholds
- Confidence threshold: 0.8
- Severity levels: veryhigh, high, medium, low

## Tiêu Chuẩn Cộng Đồng

Hệ thống hỗ trợ các tiêu chuẩn cộng đồng sau:
- Hate Speech
- Violence and Criminal Behavior
- Spam
- Adult Nudity and Sexual Activity
- Bullying and Harassment

## Phát Triển

### 1. Thêm Agent Mới
1. Tạo file mới trong thư mục `agent/`
2. Kế thừa từ `BaseAgent`
3. Triển khai các phương thức `analyzeContent` và `takeAction`

### 2. Thêm Tiêu Chuẩn Mới
1. Thêm vào file `standards/facebook-community-standards.ts`
2. Cập nhật logic phân tích trong agent tương ứng

## Lưu ý

- Đảm bảo cung cấp API key hợp lệ
- Kiểm tra ngưỡng confidence phù hợp với use case
- Xem xét kỹ các hành động tự động trước khi kích hoạt 