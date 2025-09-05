# GMP CheckMaster API 문서

## 📋 개요
제약업계 GMP 규정 준수를 위한 지능형 체크리스트 관리 시스템 API

**Base URL**: `https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod/`

## 🔐 인증

### JWT 토큰 기반 인증
- **토큰 형식**: `Bearer {token}`
- **헤더**: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`
- **만료시간**: 8시간
- **권한**: worker (작업자), admin (관리자)

## 📚 API 엔드포인트

### 1. 인증 관리

#### 1.1 작업자 로그인
```http
POST /auth/worker
Content-Type: application/json
```

**Request:**
```json
{
  "employee_id": "EMP001"
}
```

**Response (성공):**
```json
{
  "success": true,
  "data": {
    "user_id": "EMP001",
    "name": "김철수",
    "user_type": "worker",
    "session_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Response (실패):**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "등록되지 않은 사번입니다"
  }
}
```

#### 1.2 관리자 로그인
```http
POST /auth/admin
Content-Type: application/json
```

**Request:**
```json
{
  "admin_id": "admin"
}
```

**Response (성공):**
```json
{
  "success": true,
  "data": {
    "user_id": "admin",
    "name": "시스템 관리자",
    "user_type": "admin",
    "session_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. 체크리스트 관리

#### 2.1 체크리스트 제출
```http
POST /checklist
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "user_id": "EMP001",
  "items": {
    "symptoms": "아니오",
    "respiratory": "아니오", 
    "wounds": "아니오",
    "uniform": "예",
    "accessories": "예",
    "hair": "예",
    "nails": "예",
    "makeup": "예",
    "personal_items": "예"
  },
  "ai_analysis": {
    "item_id": "wounds",
    "result": "approved"
  }
}
```

**Response (적합):**
```json
{
  "success": true,
  "data": {
    "check_id": "EMP001_20250906_0815",
    "status": "approved",
    "qr_code": "eyJ1c2VyX2lkIjoiRU1QMDAxIi...",
    "expire_time": "2025-09-06T08:45:00Z",
    "message": "위생상태 점검 완료! 안전하게 작업하세요",
    "ai_result": {
      "result": "approved",
      "confidence": 0.95,
      "message": "상처 크기가 작고 염증이 없어 적합 판정됩니다"
    }
  }
}
```

**Response (부적합):**
```json
{
  "success": true,
  "data": {
    "check_id": "EMP001_20250906_0820",
    "status": "rejected", 
    "reason": "발열, 설사, 구토 등의 증상",
    "message": "건강상 이유로 오늘은 출근이 어렵습니다",
    "recommendation": "충분한 휴식 후 내일 다시 체크해주세요"
  }
}
```

#### 2.2 사용자별 체크리스트 조회
```http
GET /checklist/{user_id}?limit=10&start_date=2025-09-06&end_date=2025-09-06
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "EMP001",
    "results": [
      {
        "check_time": "2025-09-06T08:15:00Z",
        "status": "approved",
        "qr_code": "eyJ1c2VyX2lkIjoiRU1QMDAxIi...",
        "expire_time": "2025-09-06T08:45:00Z",
        "is_expired": false,
        "ai_verified": true
      },
      {
        "check_time": "2025-09-05T08:20:00Z",
        "status": "rejected",
        "reason": "발열 증상 확인"
      }
    ],
    "total_count": 2
  }
}
```

### 3. AI 분석

#### 3.1 상처 분석
```http
POST /ai/analyze-wound
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "user_id": "EMP001",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response (적합):**
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
    "image_url": "s3://bucket/images/emp001_20250906_0815.jpg"
  }
}
```

**Response (부적합):**
```json
{
  "success": true,
  "data": {
    "result": "rejected",
    "confidence": 0.92,
    "analysis": {
      "wound_size": "medium",
      "inflammation": true,
      "bleeding": false,
      "infection_risk": "high"
    },
    "message": "상처에 염증이 확인되어 부적합 판정됩니다",
    "recommendation": "의료진 상담 후 재검사하시기 바랍니다"
  }
}
```

### 4. QR 코드 관리

#### 4.1 QR 코드 검증
```http
POST /qr/verify
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "qr_data": "eyJ1c2VyX2lkIjoiRU1QMDAxIi...",
  "scanner_id": "admin"
}
```

**Response (유효):**
```json
{
  "success": true,
  "data": {
    "status": "approved",
    "user_id": "EMP001",
    "user_name": "김철수",
    "check_time": "2025-09-06T08:15:00Z",
    "expire_time": "2025-09-06T08:45:00Z",
    "ai_verified": true,
    "message": "출입 허용 - 김철수님"
  }
}
```

**Response (만료):**
```json
{
  "success": false,
  "error": {
    "code": "QR_EXPIRED",
    "message": "만료된 코드입니다. 재검사 필요",
    "user_name": "김철수",
    "expired_at": "2025-09-06T08:45:00Z"
  }
}
```

#### 4.2 QR 코드 만료 처리
```http
PUT /qr/expire
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "user_id": "EMP001",
  "check_time": "2025-09-06T08:15:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "QR 코드가 만료 처리되었습니다",
    "expired_at": "2025-09-06T09:00:00Z"
  }
}
```

### 5. 출입 로그

#### 5.1 출입 로그 기록
```http
POST /access-log
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "user_id": "EMP001",
  "user_name": "김철수",
  "action": "scan_success",
  "result": "approved",
  "qr_data": "eyJ1c2VyX2lkIjoiRU1QMDAxIi...",
  "scanner_id": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "log_id": "20250906_081530_EMP001",
    "timestamp": "2025-09-06T08:15:30Z"
  }
}
```

#### 5.2 출입 로그 조회
```http
GET /access-log?date=2025-09-06&limit=50
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-09-06",
    "logs": [
      {
        "timestamp": "2025-09-06T08:15:30Z",
        "user_id": "EMP001",
        "user_name": "김철수",
        "action": "scan_success",
        "result": "approved",
        "scanner_id": "admin"
      },
      {
        "timestamp": "2025-09-06T08:12:15Z",
        "user_id": "EMP002",
        "user_name": "이영희",
        "action": "scan_success",
        "result": "approved",
        "scanner_id": "admin"
      }
    ],
    "total_count": 2
  }
}
```

## 🚨 오류 코드

### 인증 관련
- `USER_NOT_FOUND`: 사용자를 찾을 수 없음
- `INVALID_TOKEN`: 유효하지 않은 토큰
- `TOKEN_EXPIRED`: 토큰 만료
- `FORBIDDEN`: 권한 없음

### 체크리스트 관련
- `INVALID_CHECKLIST`: 유효하지 않은 체크리스트 데이터
- `AI_ANALYSIS_FAILED`: AI 분석 실패
- `MISSING_DATA`: 필수 데이터 누락

### QR 코드 관련
- `QR_EXPIRED`: QR 코드 만료
- `QR_INVALID`: 유효하지 않은 QR 코드
- `QR_NOT_FOUND`: QR 코드를 찾을 수 없음

### 시스템 관련
- `INTERNAL_ERROR`: 내부 서버 오류
- `DATABASE_ERROR`: 데이터베이스 오류

## 📊 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": {
    // 응답 데이터
  }
}
```

### 오류 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "오류 메시지",
    "details": {} // 추가 정보 (선택사항)
  }
}
```

## 🔒 보안 및 제한사항

### Rate Limiting
- **일반 API**: 100 requests/minute/user
- **AI 분석**: 10 requests/minute/user
- **QR 검증**: 50 requests/minute/scanner

### 데이터 크기 제한
- **이미지 업로드**: 최대 5MB
- **Request Body**: 최대 1MB
- **QR 코드**: 최대 2KB

### CORS 설정
```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}
```

## 🧪 테스트

### cURL 예제

#### 작업자 로그인
```bash
curl -X POST https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod/auth/worker \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "EMP001"}'
```

#### 체크리스트 제출
```bash
curl -X POST https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod/checklist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user_id": "EMP001",
    "items": {
      "symptoms": "아니오",
      "respiratory": "아니오",
      "wounds": "아니오",
      "uniform": "예",
      "accessories": "예",
      "hair": "예",
      "nails": "예",
      "makeup": "예",
      "personal_items": "예"
    }
  }'
```

#### QR 코드 검증
```bash
curl -X POST https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod/qr/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "qr_data": "eyJ1c2VyX2lkIjoiRU1QMDAxIi...",
    "scanner_id": "admin"
  }'
```

## 📈 모니터링

### CloudWatch 메트릭
- Lambda 함수 실행 시간
- API Gateway 요청 수
- DynamoDB 읽기/쓰기 용량
- 오류 발생률

### 로그 확인
```bash
# Lambda 로그 확인
aws logs filter-log-events --log-group-name /aws/lambda/gmp-checkmaster-AuthHandler

# API Gateway 로그 확인  
aws logs filter-log-events --log-group-name API-Gateway-Execution-Logs
```

## 🎯 사용 예제

### JavaScript (Fetch API)
```javascript
// 작업자 로그인
const loginResponse = await fetch('https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod/auth/worker', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    employee_id: 'EMP001'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.session_token;

// 체크리스트 제출
const checklistResponse = await fetch('https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod/checklist', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    user_id: 'EMP001',
    items: {
      symptoms: '아니오',
      respiratory: '아니오',
      wounds: '아니오',
      uniform: '예',
      accessories: '예',
      hair: '예',
      nails: '예',
      makeup: '예',
      personal_items: '예'
    }
  })
});

const checklistData = await checklistResponse.json();
console.log('QR Code:', checklistData.data.qr_code);
```

---

**개발팀**: drug qrew (백승재, 풍기덕)  
**해커톤**: AWS 해커톤 2025.09.05-06  
**API 버전**: v1.0  
**최종 업데이트**: 2025-09-06 02:50
