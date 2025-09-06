# GMP CheckMaster API 사용법 및 응답 예시

## 🚀 Base URL
```
http://localhost:3001
```

## 🔐 인증 API

### 1. 작업자 로그인
```bash
POST /auth/worker
Content-Type: application/json

{
  "employee_id": "EMP001"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "user_id": "EMP001",
    "name": "김철수",
    "user_type": "worker",
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 관리자 로그인
```bash
POST /auth/admin
Content-Type: application/json

{
  "admin_id": "admin",
  "password": "admin123"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "user_id": "admin",
    "name": "시스템 관리자",
    "user_type": "admin",
    "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 🎭 해커톤 백도어: 사용자 리스트 (토큰 불필요)
```bash
GET /auth/users
```

**응답 예시:**
```json
{
  "success": true,
  "message": "🎭 해커톤 MVP용 사용자 리스트",
  "data": {
    "users": [
      {
        "user_id": "EMP001",
        "name": "김철수",
        "type": "worker",
        "description": "작업자 - 김철수"
      },
      {
        "user_id": "EMP002",
        "name": "이영희",
        "type": "worker",
        "description": "작업자 - 이영희"
      },
      {
        "user_id": "EMP003",
        "name": "박민수",
        "type": "worker",
        "description": "작업자 - 박민수"
      },
      {
        "user_id": "EMP004",
        "name": "정수연",
        "type": "worker",
        "description": "작업자 - 정수연"
      },
      {
        "user_id": "EMP005",
        "name": "최수진",
        "type": "worker",
        "description": "작업자 - 최수진"
      },
      {
        "user_id": "admin",
        "name": "시스템 관리자",
        "type": "admin",
        "description": "관리자 - 시스템 관리자"
      }
    ],
    "total": 6,
    "demo_note": "해커톤 시연용 - 실제 서비스에서는 제거 필요"
  }
}
```

## 📋 체크리스트 API

### 4. 체크리스트 제출
```bash
POST /checklist
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "user_id": "EMP001",
  "items": {
    "symptoms": "아니오",
    "respiratory": "아니오",
    "wounds": "예",
    "uniform": "예",
    "accessories": "예",
    "hair": "예",
    "nails": "예",
    "makeup": "예",
    "personal_items": "예"
  },
  "ai_analysis": {
    "item_id": "wounds",
    "result": "approved",
    "confidence": 0.95
  }
}
```

**적합 판정 응답:**
```json
{
  "success": true,
  "data": {
    "record_id": "EMP001_20250906_1130",
    "status": "approved",
    "qr_code": "eyJ1c2VyX2lkIjoiRU1QMDAxIiwidGltZXN0YW1wIjoi...",
    "expire_time": "2025-09-06T12:00:00Z",
    "message": "위생상태 점검 완료! 안전하게 작업하세요",
    "ai_result": {
      "result": "approved",
      "confidence": 0.95,
      "message": "상처 크기가 작고 염증이 없어 적합 판정됩니다"
    }
  }
}
```

**부적합 판정 응답:**
```json
{
  "success": true,
  "data": {
    "record_id": "EMP001_20250906_1130",
    "status": "rejected",
    "reason": "발열, 설사, 구토 등의 증상, 상처 부적합",
    "message": "건강상 이유로 오늘은 출근이 어렵습니다",
    "recommendation": "충분한 휴식 후 내일 다시 체크해주세요"
  }
}
```

### 5. 사용자별 체크리스트 조회
```bash
GET /checklist/{user_id}?limit=10
Authorization: Bearer {JWT_TOKEN}

# 예시
GET /checklist/EMP001?limit=5
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "user_id": "EMP001",
    "results": [
      {
        "record_id": "EMP001_20250906_1130",
        "check_time": "2025-09-06T11:30:00Z",
        "status": "approved",
        "qr_code": "eyJ1c2VyX2lkIjoiRU1QMDAxIi...",
        "expire_time": "2025-09-06T12:00:00Z",
        "is_expired": false,
        "ai_verified": true,
        "reason": null
      },
      {
        "record_id": "EMP001_20250906_0815",
        "check_time": "2025-09-06T08:15:00Z",
        "status": "rejected",
        "qr_code": null,
        "expire_time": null,
        "is_expired": false,
        "ai_verified": false,
        "reason": "발열, 설사, 구토 등의 증상"
      }
    ],
    "total_count": 2
  }
}
```

### 6. 🎯 체크리스트 상세 조회 (NEW!)
```bash
GET /checklist/detail/{record_id}
# 해커톤용: 토큰 불필요

# 예시
GET /checklist/detail/EMP001_20250906_1150
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "record_id": "EMP001_20250906_1150",
    "user_id": "EMP001",
    "user_name": "김철수",
    "check_time": "2025-09-06T11:50:00Z",
    "status": "approved",
    "items": {
      "symptoms": "아니오",
      "respiratory": "아니오",
      "wounds": "예",
      "uniform": "예",
      "accessories": "예",
      "hair": "예",
      "nails": "예",
      "makeup": "예",
      "personal_items": "예"
    },
    "ai_analysis": {
      "item_id": "wounds",
      "result": "approved",
      "confidence": 0.95,
      "analysis": {
        "wound_size": "small",
        "inflammation": false,
        "bleeding": false,
        "infection_risk": "low"
      },
      "message": "상처 크기가 작고 염증이 없어 적합 판정됩니다"
    },
    "qr_code": "eyJ1c2VyX2lkIjoiRU1QMDAxIi...",
    "expire_time": "2025-09-06T12:20:00Z",
    "is_expired": false,
    "message": "위생상태 점검 완료! 안전하게 작업하세요",
    "reason": null,
    "recommendation": null
  }
}
```

## 🤖 AI 분석 API

### 7. 상처 분석
```bash
POST /ai/analyze-wound
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "user_id": "EMP001"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "result": "approved",
    "confidence": 0.95,
    "analysis": {
      "wound_size": "small",
      "inflammation": false,
      "bleeding": false,
      "infection_risk": "low"
    },
    "message": "상처 크기가 작고 염증이 없어 적합 판정됩니다",
    "timestamp": "2025-09-06T11:30:00Z"
  }
}
```

## 📱 QR 코드 API

### 8. QR 코드 검증
```bash
POST /qr/verify
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "qr_code": "eyJ1c2VyX2lkIjoiRU1QMDAxIiwidGltZXN0YW1wIjoi..."
}
```

**유효한 QR 응답:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user_id": "EMP001",
    "name": "김철수",
    "check_time": "2025-09-06T11:30:00Z",
    "expire_time": "2025-09-06T12:00:00Z",
    "remaining_minutes": 25
  }
}
```

**만료된 QR 응답:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "QR 코드가 만료되었습니다",
    "expired_at": "2025-09-06T12:00:00Z"
  }
}
```

### 9. QR 코드 만료 처리
```bash
PUT /qr/expire
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "qr_code": "eyJ1c2VyX2lkIjoiRU1QMDAxIiwidGltZXN0YW1wIjoi..."
}
```

## 📊 출입 로그 API

### 10. 출입 로그 기록
```bash
POST /access-log
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "user_id": "EMP001",
  "action": "entry",
  "location": "생산동 1층",
  "qr_code": "eyJ1c2VyX2lkIjoiRU1QMDAxIi..."
}
```

### 11. 출입 로그 조회
```bash
GET /access-log?date=2025-09-06&limit=50
Authorization: Bearer {JWT_TOKEN}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2025-09-06T11:35:00Z",
        "user_id": "EMP001",
        "name": "김철수",
        "action": "entry",
        "location": "생산동 1층",
        "status": "success"
      }
    ],
    "total_count": 1
  }
}
```

## 🔧 에러 응답 형식

### 인증 오류
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "유효하지 않은 토큰입니다"
  }
}
```

### 권한 오류
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "권한이 없습니다"
  }
}
```

### 서버 오류
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버 내부 오류가 발생했습니다"
  }
}
```

## 🎯 프론트엔드 연동 예시

### JavaScript/React 사용법
```javascript
// 1. 사용자 리스트 가져오기 (백도어)
const getUsers = async () => {
  const response = await fetch('http://localhost:3001/auth/users');
  const data = await response.json();
  return data.data.users;
};

// 2. 로그인
const login = async (userId, userType) => {
  const endpoint = userType === 'admin' ? '/auth/admin' : '/auth/worker';
  const body = userType === 'admin' 
    ? { admin_id: userId, password: 'admin123' }
    : { employee_id: userId };
    
  const response = await fetch(`http://localhost:3001${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await response.json();
  return data.data.session_token;
};

// 3. 체크리스트 제출
const submitChecklist = async (token, userId, items) => {
  const response = await fetch('http://localhost:3001/checklist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ user_id: userId, items })
  });
  
  return await response.json();
};

// 4. 체크리스트 조회
const getChecklist = async (token, userId) => {
  const response = await fetch(`http://localhost:3001/checklist/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};

// 5. 체크리스트 상세 조회 (NEW!)
const getChecklistDetail = async (checkId) => {
  const response = await fetch(`http://localhost:3001/checklist/detail/${checkId}`);
  return await response.json();
};
```

## 📝 체크리스트 항목 설명

### GMP 위생 점검 항목
- `symptoms`: 발열, 설사, 구토 등의 증상 (예 → 부적합)
- `respiratory`: 호흡기 증상 (예 → 부적합)
- `wounds`: 상처 상태 (AI 분석 결과 반영)
- `uniform`: 작업복 착용 (아니오 → 부적합)
- `accessories`: 액세서리 제거 (아니오 → 부적합)
- `hair`: 모발 정리 (아니오 → 부적합)
- `nails`: 손톱 정리 (아니오 → 부적합)
- `makeup`: 화장품 제거 (아니오 → 부적합)
- `personal_items`: 개인 소지품 정리 (아니오 → 부적합)

---

**🎭 해커톤 시연용 API 문서**  
**개발팀**: drug qrew (백승재, 풍기덕)  
**업데이트**: 2025-09-06 11:54  
**NEW**: 체크리스트 상세 조회 API 추가
