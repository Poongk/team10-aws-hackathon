# 🚀 프론트엔드 배포 가이드

## 📋 환경별 API URL 설정

### 1. **개발 환경 (로컬)**
```bash
# .env.development
REACT_APP_ENV=development
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=10000
```

### 2. **프로덕션 환경 (AWS)**
```bash
# .env.production
REACT_APP_ENV=production
REACT_APP_API_BASE_URL=https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod
REACT_APP_API_TIMEOUT=15000
```

## 🔧 배포 전 설정 변경

### 1. **API Gateway URL 확인**
```bash
# 백엔드 배포 후 API Gateway URL 확인
cd development/backend/gmp-checkmaster
sam deploy --guided

# 출력에서 API Gateway endpoint URL 복사
# 예: https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod/
```

### 2. **프로덕션 환경변수 업데이트**
```bash
# .env.production 파일 수정
REACT_APP_API_BASE_URL=https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod
```

### 3. **API 설정 파일 확인**
```javascript
// src/config/api.js에서 자동으로 환경 감지
// localhost → development
// 배포된 도메인 → production
```

## 🌐 배포 방법

### **AWS Amplify 배포**
```bash
# 1. 프로덕션 빌드
npm run build

# 2. Amplify 배포 (자동으로 .env.production 사용)
amplify publish
```

### **수동 S3 + CloudFront 배포**
```bash
# 1. 프로덕션 빌드
REACT_APP_ENV=production npm run build

# 2. S3 업로드
aws s3 sync build/ s3://your-bucket-name --delete

# 3. CloudFront 캐시 무효화
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🔍 환경 확인 방법

### **브라우저 콘솔에서 확인**
```javascript
// 개발자 도구 콘솔에서 실행
import { getApiConfig } from './src/config/api';
console.log(getApiConfig());

// 출력 예시:
// {
//   environment: "production",
//   baseUrl: "https://abc123def4.execute-api.ap-northeast-2.amazonaws.com/Prod",
//   timeout: 15000
// }
```

### **네트워크 탭에서 확인**
- 로그인 시 API 호출 URL 확인
- `localhost:3001` → 개발 환경
- `execute-api.amazonaws.com` → 프로덕션 환경

## ⚠️ 주의사항

### **CORS 설정**
백엔드에서 프론트엔드 도메인을 CORS에 추가해야 합니다:
```javascript
// 백엔드 template.yaml
Environment:
  Variables:
    CORS_ORIGIN: "https://your-frontend-domain.com"
```

### **HTTPS 필수**
- 프로덕션에서는 반드시 HTTPS 사용
- API Gateway도 HTTPS 엔드포인트 사용

### **환경변수 보안**
- `.env` 파일은 Git에 커밋하지 않음
- 민감한 정보는 환경변수로 관리

## 🎯 배포 체크리스트

- [ ] 백엔드 API Gateway URL 확인
- [ ] `.env.production` 파일 업데이트
- [ ] 프로덕션 빌드 테스트
- [ ] CORS 설정 확인
- [ ] HTTPS 인증서 설정
- [ ] 도메인 연결
- [ ] API 호출 테스트
- [ ] 로그인/체크리스트 플로우 테스트

## 🔄 롤백 방법

### **문제 발생 시 빠른 롤백**
```bash
# 1. 이전 버전으로 롤백
git checkout previous-working-commit

# 2. 다시 빌드 및 배포
npm run build
amplify publish
```

### **API URL 문제 시**
```bash
# 개발 환경 URL로 임시 변경
REACT_APP_API_BASE_URL=http://localhost:3001 npm run build
```

---

**📝 배포 완료 후 테스트 시나리오:**
1. 프론트엔드 접속 → 로그인 화면
2. EMP001 로그인 → JWT 토큰 확인
3. 체크리스트 작성 → 백엔드 API 호출 확인
4. QR 코드 생성 → 실제 QR 이미지 확인
5. 네트워크 탭에서 API URL 확인
