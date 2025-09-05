# GMP CheckMaster AI - 백엔드 API 문서

## 📋 개요
- **프로젝트**: GMP CheckMaster AI 해커톤 백엔드
- **총 API 수**: 22개
- **핸들러 수**: 8개
- **테스트 커버리지**: 100%
- **작성일**: 2025-09-05

## 🚀 빠른 시작

### 로컬 개발
```bash
# 전체 API 테스트
node test-all-apis.js

# SAM Local 시작
sam local start-api --port 3001

# 개별 함수 테스트
sam local invoke AuthHandler --event events/login-test.json
```

### 클라우드 배포
```bash
sam build
sam deploy --guided
```

## 📊 API 현황

### 핸들러별 API 분포
| 핸들러 | API 수 | 주요 기능 |
|--------|--------|-----------|
| AuthHandler | 3개 | 인증, 토큰 관리 |
| ChecklistHandler | 6개 | 체크리스트 CRUD, 수정/재검토 |
| AIJudgmentHandler | 2개 | AI 판정, 결과 조회 |
| QRHandler | 2개 | QR 생성/검증 |
| DashboardHandler | 4개 | 통계, 현황, 팀 관리 |
| AssignmentHandler | 2개 | 배정 관리 |
| NotificationHandler | 1개 | 알림 발송 |
| AdminHandler | 3개 | 관리자 기능 |

## 🔐 1. 인증 API (AuthHandler)

### 1.1 로그인
```http
POST /auth/login
```

**요청**
```json
{
  "user_id": "worker1",
  "password": "demo123"
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "token": "demo-jwt-worker1-1757074325299",
    "user": {
      "id": "worker1",
      "name": "김작업",
      "role": "worker",
      "team": "생산팀A"
    },
    "expires_in": 28800
  },
  "message": "Login successful",
  "timestamp": "2025-09-05T12:12:05.299Z"
}
```

### 1.2 로그아웃
```http
POST /auth/logout
```

### 1.3 토큰 검증
```http
GET /auth/verify
Authorization: Bearer {token}
```

## 📋 2. 체크리스트 API (ChecklistHandler)

### 2.1 템플릿 조회
```http
GET /checklists/templates
```

**응답**
```json
{
  "success": true,
  "data": [
    {
      "template_id": "hygiene_checklist",
      "name": "위생상태점검표",
      "type": "hygiene",
      "items": [
        {
          "id": "symptoms",
          "question": "발열, 설사, 구토 증상이 있나요?",
          "type": "select",
          "options": ["없음", "있음"]
        }
      ]
    }
  ]
}
```

### 2.2 체크리스트 제출
```http
POST /checklists/submit
```

**요청**
```json
{
  "user_id": "worker1",
  "template_id": "hygiene_checklist",
  "responses": {
    "symptoms": "없음",
    "respiratory": "없음",
    "wound": "없음",
    "clothing": "적절"
  }
}
```

### 2.3 기록 조회
```http
GET /checklists/records
```

### 2.4 체크리스트 수정 (5분 내)
```http
PUT /checklists/records/{record_id}
```

### 2.5 수정 요청 (5분 후)
```http
POST /checklists/modification-request
```

### 2.6 긴급 재검토 요청
```http
POST /checklists/emergency-review
```

## 🤖 3. AI 판정 API (AIJudgmentHandler)

### 3.1 건강상태 AI 판정
```http
POST /ai/judge
```

**요청**
```json
{
  "responses": {
    "symptoms": "없음",
    "respiratory": "없음",
    "wound": "없음",
    "clothing": "적절"
  }
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "result": "approved",
    "reason": "모든 항목이 정상 범위입니다",
    "confidence": 0.95,
    "qr_eligible": true
  }
}
```

### AI 판정 로직
1. **발열/설사/구토 증상 있음** → 자동 거부 (confidence: 1.0)
2. **호흡기 증상 있음** → 재확인 필요 (confidence: 0.8)
3. **복장/상처 부적절** → 재확인 필요 (confidence: 0.7)
4. **모든 항목 정상** → 출입 승인 (confidence: 0.95)

### 3.2 판정 결과 조회
```http
GET /ai/judgment/{record_id}
```

## 📱 4. QR 코드 API (QRHandler)

### 4.1 QR 코드 생성
```http
POST /qr/generate
```

**요청**
```json
{
  "user_id": "worker1",
  "record_id": "record_123"
}
```

**응답**
```json
{
  "success": true,
  "data": {
    "qr_code": "QR-worker1-1757074325299",
    "user_id": "worker1",
    "record_id": "record_123",
    "expires_at": "2025-09-05T20:12:05.299Z",
    "access_level": "production_area"
  }
}
```

### 4.2 QR 코드 검증
```http
POST /qr/verify
```

## 📊 5. 대시보드 API (DashboardHandler)

### 5.1 통계 조회
```http
GET /dashboard/stats
```

**응답**
```json
{
  "success": true,
  "data": {
    "today": {
      "total_submissions": 45,
      "approved": 42,
      "rejected": 2,
      "pending": 1
    },
    "compliance_rate": 94.2,
    "top_issues": [
      {"issue": "복장 부적절", "count": 8},
      {"issue": "호흡기 증상", "count": 4}
    ]
  }
}
```

### 5.2 리포트 조회
```http
GET /dashboard/reports
```

### 5.3 실시간 현황 조회 (운영자용)
```http
GET /dashboard/status
```

### 5.4 팀 현황 조회 (책임자용)
```http
GET /dashboard/team/{team_id}
```

## 📝 6. 배정 관리 API (AssignmentHandler)

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
      "active": true
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

## 🔔 7. 알림 API (NotificationHandler)

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
    "notification_id": "notif_1757074325299",
    "sent_count": 2,
    "sent_at": "2025-09-05T12:12:05.299Z"
  }
}
```

## ⚙️ 8. 관리자 API (AdminHandler)

### 8.1 템플릿 생성
```http
POST /admin/templates
```

**요청**
```json
{
  "name": "새로운 체크리스트",
  "type": "hygiene",
  "items": [
    {
      "question": "손 씻기를 완료하셨나요?",
      "type": "boolean",
      "required": true
    }
  ]
}
```

### 8.2 QR 유효시간 설정 (관리자)
```http
PUT /admin/qr-validity/template/{template_id}
```

**요청**
```json
{
  "default_expires_time": "17:30",
  "weekend_expires_time": "14:00",
  "emergency_max_extension": "2_hours"
}
```

### 8.3 QR 유효시간 당일 조정 (운영자)
```http
PUT /operator/qr-validity/daily
```

**요청**
```json
{
  "date": "2025-09-05",
  "template_id": "template_001",
  "adjusted_expires_time": "20:00",
  "reason": "야근으로 인한 연장"
}
```

## 🧪 테스트 데이터

### Demo 사용자
```javascript
{
  'worker1': { id: 'worker1', name: '김작업', role: 'worker', team: '생산팀A' },
  'operator1': { id: 'operator1', name: '박운영', role: 'operator', team: '운영팀' },
  'supervisor1': { id: 'supervisor1', name: '이책임', role: 'supervisor', team: '생산팀A' },
  'admin1': { id: 'admin1', name: '최관리', role: 'admin', team: 'IT팀' },
  'security1': { id: 'security1', name: '정보보안', role: 'security', team: '보안팀' }
}
```

### 위생상태 점검표 템플릿
- 발열/설사/구토 증상
- 호흡기 질환
- 신체 상처
- 작업복 착용
- 장신구 제거
- 두발 상태
- 손톱 상태
- 화장 여부
- 개인 물품 반입

## 🔧 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2025-09-05T12:12:05.299Z"
}
```

### 에러 응답
```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "timestamp": "2025-09-05T12:12:05.299Z"
}
```

### CORS 헤더
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Content-Type: application/json
```

## 📈 성능 및 제한사항

### 현재 구현 (해커톤용)
- **데이터 저장**: 메모리 기반 Mock 데이터
- **인증**: 간단한 JWT 토큰 시뮬레이션
- **AI 판정**: 규칙 기반 로직
- **실시간 기능**: 없음

### 프로덕션 고려사항
- DynamoDB 연동 필요
- 실제 JWT 토큰 구현
- Amazon Bedrock AI 연동
- WebSocket 실시간 알림
- 로그 및 모니터링

---
**작성자**: 백승재  
**테스트 완료**: 2025-09-05 21:12  
**API 커버리지**: 100% (22/22)  
**다음 업데이트**: 클라우드 배포 후
