# GMP CheckMaster API - API 명세서 기반 백엔드

## 📋 개요
제약업계 GMP 규정 준수를 위한 지능형 체크리스트 관리 시스템의 백엔드 API

**API 명세서 기반으로 완전히 재구성된 버전**

## 🏗️ 아키텍처

### 📁 디렉토리 구조
```
gmp-checkmaster/
├── auth-handler/              # 인증 관리
├── checklist-handler/         # 체크리스트 관리
├── ai-analysis-handler/       # AI 분석 (상처 분석)
├── qr-handler/               # QR 코드 관리
├── access-log-handler/       # 출입 로그 관리
├── template.yaml             # SAM 템플릿
├── test-api-spec.js          # API 테스트 스크립트
└── build-and-deploy.sh       # 빌드 및 배포 스크립트
```

### 🔧 기술 스택
- **Runtime**: Node.js 18.x
- **Database**: DynamoDB (Single Table Design)
- **Authentication**: JWT
- **AI**: Amazon Bedrock (Claude-3 Sonnet)
- **Deployment**: AWS SAM
- **API**: REST API (API Gateway)

## 🌐 API 엔드포인트

### 🔐 인증
- `POST /auth/worker` - 작업자 로그인
- `POST /auth/admin` - 관리자 로그인

### 📝 체크리스트
- `POST /checklist` - 체크리스트 제출
- `GET /checklist/{user_id}` - 사용자별 체크리스트 조회

### 🤖 AI 분석
- `POST /ai/analyze-wound` - 상처 분석

### 📱 QR 코드
- `POST /qr/verify` - QR 코드 검증
- `PUT /qr/expire` - QR 코드 만료 처리

### 📊 출입 로그
- `POST /access-log` - 출입 로그 기록
- `GET /access-log` - 출입 로그 조회

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
# 각 핸들러별 의존성 설치
cd auth-handler && npm install && cd ..
cd checklist-handler && npm install && cd ..
cd ai-analysis-handler && npm install && cd ..
cd qr-handler && npm install && cd ..
cd access-log-handler && npm install && cd ..
```

### 2. 자동 빌드 및 배포
```bash
./build-and-deploy.sh
```

### 3. 수동 배포
```bash
# SAM 빌드
sam build

# SAM 배포
sam deploy --guided
```

## 🧪 테스트

### API 테스트 실행
```bash
# API Gateway URL을 test-api-spec.js에 설정 후
node test-api-spec.js
```

### 테스트 시나리오
1. ✅ 작업자 로그인 (`EMP001`)
2. ✅ 관리자 로그인 (`admin`)
3. ✅ 체크리스트 제출 (적합/부적합)
4. ✅ AI 상처 분석
5. ✅ QR 코드 검증
6. ✅ 체크리스트 조회
7. ✅ 출입 로그 조회

## 📊 데이터 모델

### DynamoDB Single Table Design
```
PK                    SK                     데이터
USER#EMP001          CHECK#2025-09-06T...   체크리스트 기록
ANALYSIS#EMP001      WOUND#2025-09-06T...   AI 분석 결과
ACCESS_LOG#2025-09-06 2025-09-06T...#EMP001 출입 로그
```

### 주요 속성
- `pk`: Partition Key
- `sk`: Sort Key  
- `ttl`: Time To Live (자동 삭제)
- `created_at`: 생성 시간
- `user_id`: 사용자 ID

## 🔒 보안

### JWT 인증
- **Secret**: `gmp-checkmaster-secret-key`
- **만료시간**: 8시간
- **토큰 형식**: `Bearer {token}`

### 권한 관리
- **작업자**: 본인 데이터만 접근
- **관리자**: 모든 데이터 접근

### CORS 설정
```javascript
{
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}
```

## 🤖 AI 분석

### Bedrock Claude Vision
- **모델**: `anthropic.claude-3-sonnet-20240229-v1:0`
- **기능**: 상처 이미지 분석
- **출력**: 적합/부적합 판정 + 신뢰도

### 분석 기준
- 상처 크기 (small/medium/large)
- 염증 여부 (true/false)
- 출혈 여부 (true/false)
- 감염 위험도 (low/medium/high)

### 폴백 시스템
Bedrock 호출 실패 시 기본 적합 판정 반환

## 📱 QR 코드

### 생성 로직
```javascript
const qrData = {
    user_id: 'EMP001',
    timestamp: '2025-09-06T08:15:00Z',
    expire_time: '2025-09-06T08:45:00Z'
};
const qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');
```

### 만료 시간
- **기본**: 30분
- **시연용**: 수동 만료 가능

## 🔔 알림 시스템

### Slack 연동
- **Webhook URL**: 환경변수 `SLACK_WEBHOOK_URL`
- **트리거**: 부적합 체크리스트 제출 시
- **내용**: 사용자 ID, 부적합 사유, 시간

## 📈 모니터링

### CloudWatch 로그
- 각 Lambda 함수별 로그 그룹
- 에러 및 성능 모니터링

### DynamoDB 메트릭
- 읽기/쓰기 용량 모니터링
- TTL 기반 자동 데이터 정리

## 🛠️ 개발 가이드

### 로컬 개발
```bash
# SAM 로컬 시작
sam local start-api

# 로컬 테스트
sam local invoke AuthHandler -e events/auth-event.json
```

### 환경 변수
```yaml
Environment:
  Variables:
    NODE_ENV: development
    CORS_ORIGIN: "*"
    DYNAMODB_TABLE: !Ref GMPTable
    SLACK_WEBHOOK_URL: "https://hooks.slack.com/..."
```

### 에러 처리
- 표준화된 에러 응답 형식
- 적절한 HTTP 상태 코드
- 상세한 에러 로깅

## 📋 API 명세서 준수

이 백엔드는 `planning/design/mvp/architecture/API명세서.md`를 100% 준수합니다:

✅ **모든 엔드포인트 구현**  
✅ **요청/응답 형식 일치**  
✅ **에러 코드 표준화**  
✅ **인증 방식 통일**  
✅ **데이터 모델 일치**

## 🎯 해커톤 데모

### 시연 시나리오
1. **작업자 로그인** → JWT 토큰 발급
2. **체크리스트 작성** → 적합/부적합 판정
3. **상처 사진 분석** → AI 기반 판정
4. **QR 코드 생성** → 30분 유효
5. **관리자 QR 스캔** → 출입 허용/거부
6. **출입 로그 확인** → 실시간 모니터링

### 핵심 기능
- 🔐 **실제 JWT 인증**
- 🤖 **Bedrock AI 분석**
- 📱 **QR 코드 시스템**
- 🔔 **Slack 실시간 알림**
- 📊 **완전한 로그 시스템**

---

**개발팀**: drug qrew (백승재, 풍기덕)  
**해커톤**: AWS 해커톤 2025.09.05-06  
**완성도**: API 명세서 100% 구현 완료
