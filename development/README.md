# 개발 및 배포 시스템

## 개요
GMP CheckMaster AI의 실제 개발 및 배포를 위한 통합 시스템

## 구조
```
development/
├── backend/                # 서버 및 AI 로직
│   ├── lambda/            # AWS Lambda 함수들
│   ├── api/               # API 엔드포인트
│   └── ai/                # AI 연동 코드
├── frontend/              # 사용자 인터페이스
│   ├── src/               # React 소스 코드
│   ├── public/            # 정적 파일
│   └── components/        # 재사용 컴포넌트
├── infrastructure/        # AWS 인프라 및 배포
│   ├── terraform/         # Terraform 코드
│   ├── scripts/           # 배포 스크립트
│   └── configs/           # 설정 파일
└── README.md             # 이 파일
```

## 기술 스택

### Backend
- **Runtime**: Python 3.9, Node.js 18
- **AI Services**: Amazon Q Developer, Amazon Bedrock (Claude-3)
- **AWS Services**: Lambda, DynamoDB, API Gateway, SNS
- **Framework**: FastAPI, Express.js

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI, Chart.js
- **State Management**: React Context API
- **Build Tool**: Vite

### Infrastructure
- **IaC**: Terraform
- **Hosting**: AWS Amplify, CloudFront
- **Storage**: S3
- **Monitoring**: CloudWatch

## 개발 환경 설정

### 1. 사전 요구사항
- Node.js 18+
- Python 3.9+
- AWS CLI 설정
- Terraform 설치

### 2. 로컬 개발 환경
```bash
# Backend 설정
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Frontend 설정
cd frontend
npm install
npm run dev

# Infrastructure 설정
cd infrastructure
terraform init
terraform plan
```

## 배포 가이드

### 1. 개발 환경 배포
```bash
cd infrastructure
terraform workspace select dev
terraform apply
```

### 2. 프로덕션 배포
```bash
cd infrastructure
terraform workspace select prod
terraform apply
```

## 개발 워크플로우

### 1. 기능 개발
1. `management/todo/`에서 작업 확인
2. 기능별 브랜치 생성
3. 개발 및 테스트
4. PR 생성 및 리뷰

### 2. 배포 프로세스
1. 개발 환경 테스트
2. 코드 리뷰 완료
3. main 브랜치 머지
4. 자동 배포 실행

## 폴더별 상세 가이드
- **Backend**: `backend/README.md` 참고
- **Frontend**: `frontend/README.md` 참고  
- **Infrastructure**: `infrastructure/README.md` 참고

---
**관리자**: drug qrew 팀  
**최종 업데이트**: 2025-09-05 14:35
