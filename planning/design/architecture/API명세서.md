# GMP CheckMaster AI - API 명세서

## 개요
- **프로젝트**: GMP CheckMaster AI
- **API 스타일**: RESTful API
- **인증 방식**: JWT 토큰
- **응답 형식**: JSON
- **작성일**: 2025-09-05

## 기본 정보

### Base URL
```
Development: https://api-dev.gmp-checkmaster.com
Production: https://api.gmp-checkmaster.com
```

### 공통 헤더
```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

### 공통 응답 형식
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2025-09-05T18:13:00Z"
}
```

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  },
  "timestamp": "2025-09-05T18:13:00Z"
}
```

## 1. 인증 API

### 1.1 로그인 (해커톤용 간소화)
```http
POST /auth/login
```

**요청**
```json
{
  "username": "worker1",
  "role": "worker"
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "worker1",
      "name": "김작업",
      "role": "worker",
      "team": "생산팀A"
    },
    "expires_in": 28800
  }
}
```

### 1.2 토큰 검증
```http
GET /auth/verify
```

**응답**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "worker1",
      "name": "김작업",
      "role": "worker",
      "team": "생산팀A"
    }
  }
}
```

## 2. 체크리스트 API

### 2.1 체크리스트 템플릿 조회
```http
GET /checklist/templates
```

**쿼리 파라미터**
- `type`: 템플릿 타입 (hygiene, pressure, storage)
- `active`: 활성 상태 (true/false)

**응답**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_001",
      "name": "위생상태점검표",
      "type": "hygiene",
      "items": [
        {
          "id": "item_001",
          "question": "손 씻기를 완료하셨나요?",
          "type": "boolean",
          "required": true
        },
        {
          "id": "item_002", 
          "question": "호흡기 질환은 없나요?",
          "type": "select",
          "required": true,
          "options": ["없음", "있음"],
          "validation": {
            "min": null,
            "max": null,
            "unit": null
          }
        }
      ],
      "created_at": "2025-09-05T10:00:00Z"
    }
  ]
}
```

### 2.2 체크리스트 작성
```http
POST /checklist/submit
```

**요청**
```json
{
  "template_id": "template_001",
  "user_id": "worker1",
  "responses": [
    {
      "item_id": "item_001",
      "value": true
    },
    {
      "item_id": "item_002",
      "value": "없음"
    }
  ]
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "record_id": "record_20250905_001",
    "status": "submitted",
    "submitted_at": "2025-09-05T18:13:00Z",
    "ai_judgment_pending": true
  }
}
```

### 2.3 체크리스트 기록 조회
```http
GET /checklist/records
```

**쿼리 파라미터**
- `user_id`: 사용자 ID
- `date`: 날짜 (YYYY-MM-DD)
- `status`: 상태 (submitted, judged, approved, rejected)

**응답**
```json
{
  "success": true,
  "data": [
    {
      "record_id": "record_20250905_001",
      "template_id": "template_001",
      "user_id": "worker1",
      "user_name": "김작업",
      "responses": [...],
      "ai_judgment": {
        "result": "approved",
        "confidence": 0.95,
        "reason": "모든 항목이 정상 범위입니다."
      },
      "qr_code": "QR_20250905_001",
      "submitted_at": "2025-09-05T18:13:00Z",
      "judged_at": "2025-09-05T18:13:05Z"
    }
  ]
}
```

## 3. AI 판정 API

### 3.1 AI 판정 요청
```http
POST /ai/judgment
```

**요청**
```json
{
  "record_id": "record_20250905_001",
  "template_type": "hygiene",
  "responses": [
    {
      "item_id": "item_001",
      "question": "손 씻기를 완료하셨나요?",
      "value": true
    },
    {
      "item_id": "item_002",
      "question": "호흡기 질환은 없나요?",
      "value": "없음"
    }
  ]
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "record_id": "record_20250905_001",
    "judgment": {
      "result": "approved",
      "confidence": 0.95,
      "reason": "모든 항목이 정상 범위입니다.",
      "recommendations": [],
      "risk_level": "low"
    },
    "qr_code": {
      "code": "QR_20250905_001",
      "color": "green",
      "expires_at": "2025-09-05T18:43:00Z"
    },
    "processed_at": "2025-09-05T18:13:05Z"
  }
}
```

### 3.2 AI 판정 결과 조회
```http
GET /ai/judgment/{record_id}
```

**응답**
```json
{
  "success": true,
  "data": {
    "record_id": "record_20250905_001",
    "judgment": {
      "result": "approved",
      "confidence": 0.95,
      "reason": "모든 항목이 정상 범위입니다."
    },
    "qr_code": "QR_20250905_001",
    "processed_at": "2025-09-05T18:13:05Z"
  }
}
```

## 4. QR 코드 API

### 4.1 QR 코드 생성
```http
POST /qr/generate
```

**요청**
```json
{
  "record_id": "record_20250905_001",
  "user_id": "worker1",
  "judgment_result": "approved"
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "qr_code": "QR_20250905_001",
    "qr_data": "eyJyZWNvcmRfaWQiOiJyZWNvcmRfMjAyNTA5MDVfMDAxIi...",
    "color": "green",
    "expires_at": "2025-09-05T18:43:00Z",
    "created_at": "2025-09-05T18:13:00Z"
  }
}
```

### 4.2 QR 코드 검증 (보안담당자용)
```http
POST /qr/verify
```

**요청**
```json
{
  "qr_data": "eyJyZWNvcmRfaWQiOiJyZWNvcmRfMjAyNTA5MDVfMDAxIi..."
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "access_allowed": true,
    "user": {
      "id": "worker1",
      "name": "김작업",
      "team": "생산팀A"
    },
    "judgment": {
      "result": "approved",
      "reason": "모든 항목이 정상 범위입니다."
    },
    "expires_at": "2025-09-05T18:43:00Z",
    "verified_at": "2025-09-05T18:15:00Z"
  }
}
```

## 5. 대시보드 API

### 5.1 실시간 현황 조회 (운영자용)
```http
GET /dashboard/status
```

**쿼리 파라미터**
- `date`: 날짜 (YYYY-MM-DD, 기본값: 오늘)
- `team`: 팀 필터

**응답**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_users": 50,
      "completed": 45,
      "pending": 3,
      "failed": 2,
      "completion_rate": 0.9
    },
    "by_team": [
      {
        "team": "생산팀A",
        "total": 20,
        "completed": 18,
        "pending": 1,
        "failed": 1,
        "completion_rate": 0.9
      }
    ],
    "recent_submissions": [
      {
        "user_name": "김작업",
        "team": "생산팀A",
        "result": "approved",
        "submitted_at": "2025-09-05T18:13:00Z"
      }
    ],
    "updated_at": "2025-09-05T18:15:00Z"
  }
}
```

### 5.2 팀 현황 조회 (책임자용)
```http
GET /dashboard/team/{team_id}
```

**응답**
```json
{
  "success": true,
  "data": {
    "team": {
      "id": "team_001",
      "name": "생산팀A",
      "supervisor": "이책임"
    },
    "summary": {
      "total_members": 20,
      "completed": 18,
      "pending": 1,
      "failed": 1,
      "completion_rate": 0.9
    },
    "members": [
      {
        "user_id": "worker1",
        "name": "김작업",
        "status": "approved",
        "submitted_at": "2025-09-05T18:13:00Z",
        "qr_expires_at": "2025-09-05T18:43:00Z"
      }
    ]
  }
}
```

## 6. 배정 관리 API (운영자용)

### 6.1 배정 목록 조회
```http
GET /assignment/list
```

**응답**
```json
{
  "success": true,
  "data": [
    {
      "assignment_id": "assign_001",
      "template_id": "template_001",
      "template_name": "위생상태점검표",
      "user_id": "worker1",
      "user_name": "김작업",
      "team": "생산팀A",
      "schedule": {
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
        "deadline": "08:20"
      },
      "active": true,
      "created_at": "2025-09-05T10:00:00Z"
    }
  ]
}
```

### 6.2 배정 생성
```http
POST /assignment/create
```

**요청**
```json
{
  "template_id": "template_001",
  "user_ids": ["worker1", "worker2"],
  "schedule": {
    "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "deadline": "08:20"
  }
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "created_assignments": 2,
    "assignment_ids": ["assign_001", "assign_002"]
  }
}
```

## 7. 알림 API

### 7.1 알림 발송
```http
POST /notification/send
```

**요청**
```json
{
  "type": "reminder",
  "target_users": ["worker1", "worker2"],
  "message": "체크리스트 작성 마감 30분 전입니다.",
  "priority": "normal"
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "notification_id": "notif_001",
    "sent_count": 2,
    "sent_at": "2025-09-05T18:15:00Z"
  }
}
```

## 8. 관리자 API

### 8.1 템플릿 생성
```http
POST /admin/templates
```

**요청**
```json
{
  "name": "위생상태점검표",
  "type": "hygiene",
  "description": "출입 전 위생상태 확인용",
  "items": [
    {
      "question": "손 씻기를 완료하셨나요?",
      "type": "boolean",
      "required": true
    },
    {
      "item_id": "item_002",
      "question": "호흡기 질환은 없나요?",
      "value": "없음",
      "type": "select"
    }
  ]
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "template_id": "template_001",
    "created_at": "2025-09-05T18:15:00Z"
  }
}
```

## 에러 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
| AUTH_001 | Invalid token | 유효하지 않은 토큰 |
| AUTH_002 | Token expired | 토큰 만료 |
| AUTH_003 | Insufficient permissions | 권한 부족 |
| VALID_001 | Missing required field | 필수 필드 누락 |
| VALID_002 | Invalid data format | 잘못된 데이터 형식 |
| BUSINESS_001 | Template not found | 템플릿을 찾을 수 없음 |
| BUSINESS_002 | Record already exists | 이미 존재하는 기록 |
| BUSINESS_003 | QR code expired | QR 코드 만료 |
| SYSTEM_001 | Internal server error | 서버 내부 오류 |
| SYSTEM_002 | Database connection error | 데이터베이스 연결 오류 |

---
**작성자**: 백승재  
**검토자**: 풍기덕  
**버전**: v1.0  
**다음 업데이트**: 데이터베이스 스키마 설계
