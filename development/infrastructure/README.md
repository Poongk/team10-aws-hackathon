# Infrastructure 배포 가이드

## 개요
GMP CheckMaster AI의 AWS 인프라 구성 및 자동 배포

## 구조
```
infrastructure/
├── terraform/             # Terraform 코드
│   ├── modules/           # 재사용 가능한 모듈
│   │   ├── lambda/        # Lambda 함수 모듈
│   │   ├── api-gateway/   # API Gateway 모듈
│   │   └── dynamodb/      # DynamoDB 모듈
│   ├── environments/      # 환경별 설정
│   │   ├── dev/           # 개발 환경
│   │   └── prod/          # 프로덕션 환경
│   └── main.tf           # 메인 Terraform 파일
├── scripts/               # 배포 스크립트
│   ├── deploy.sh          # 전체 배포 스크립트
│   └── destroy.sh         # 리소스 정리 스크립트
├── configs/               # 설정 파일
│   ├── dev.tfvars         # 개발 환경 변수
│   └── prod.tfvars        # 프로덕션 환경 변수
└── README.md             # 이 파일
```

## AWS 아키텍처

### Core Services
- **API Gateway**: REST API 엔드포인트
- **Lambda**: 서버리스 컴퓨팅
- **DynamoDB**: NoSQL 데이터베이스
- **S3**: 정적 파일 저장
- **CloudFront**: CDN

### AI Services
- **Amazon Q Developer**: 기본 질의응답
- **Amazon Bedrock**: 고급 AI 분석
- **Amazon Comprehend**: 텍스트 분석 (선택사항)

### Monitoring & Security
- **CloudWatch**: 로그 및 모니터링
- **IAM**: 권한 관리
- **SNS**: 알림 서비스

## 사전 요구사항

### 1. 도구 설치
```bash
# Terraform 설치
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# AWS CLI 설치
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 2. AWS 자격 증명 설정
```bash
aws configure
# AWS Access Key ID: [YOUR_ACCESS_KEY]
# AWS Secret Access Key: [YOUR_SECRET_KEY]
# Default region name: ap-northeast-2
# Default output format: json
```

## 배포 가이드

### 1. 개발 환경 배포
```bash
cd terraform
terraform init
terraform workspace new dev
terraform workspace select dev
terraform plan -var-file="../configs/dev.tfvars"
terraform apply -var-file="../configs/dev.tfvars"
```

### 2. 프로덕션 환경 배포
```bash
terraform workspace new prod
terraform workspace select prod
terraform plan -var-file="../configs/prod.tfvars"
terraform apply -var-file="../configs/prod.tfvars"
```

### 3. 자동 배포 스크립트 사용
```bash
# 개발 환경
./scripts/deploy.sh dev

# 프로덕션 환경
./scripts/deploy.sh prod
```

## 환경 변수 설정

### dev.tfvars
```hcl
environment = "dev"
lambda_memory = 256
dynamodb_billing_mode = "PAY_PER_REQUEST"
enable_deletion_protection = false
```

### prod.tfvars
```hcl
environment = "prod"
lambda_memory = 512
dynamodb_billing_mode = "PROVISIONED"
enable_deletion_protection = true
```

## 주요 리소스

### Lambda Functions
- `gmp-checklist-api`: 체크리스트 CRUD API
- `gmp-ai-analyzer`: AI 분석 로직
- `gmp-notification`: 알림 발송

### DynamoDB Tables
- `gmp-checklists`: 체크리스트 데이터
- `gmp-users`: 사용자 정보
- `gmp-insights`: AI 분석 결과

### API Gateway
- `/api/v1/checklist/*`: 체크리스트 API
- `/api/v1/ai/*`: AI 분석 API
- `/api/v1/notifications/*`: 알림 API

## 모니터링

### CloudWatch 대시보드
- Lambda 함수 성능 메트릭
- API Gateway 요청 통계
- DynamoDB 사용량

### 알람 설정
- Lambda 오류율 > 5%
- API Gateway 응답 시간 > 5초
- DynamoDB 스로틀링 발생

## 비용 최적화

### 개발 환경
- Lambda: 128MB 메모리
- DynamoDB: On-Demand 모드
- CloudWatch: 기본 로그 보존

### 프로덕션 환경
- Lambda: 512MB 메모리 (성능 최적화)
- DynamoDB: Provisioned 모드 (예측 가능한 비용)
- CloudWatch: 30일 로그 보존

## 보안 설정

### IAM 역할
- Lambda 실행 역할: 최소 권한 원칙
- API Gateway 역할: 특정 리소스만 접근
- DynamoDB 접근: 테이블별 세분화된 권한

### 네트워크 보안
- API Gateway: CORS 설정
- Lambda: VPC 내 실행 (필요시)
- DynamoDB: 암호화 활성화

## 백업 및 복구

### 자동 백업
```hcl
resource "aws_dynamodb_table" "checklist" {
  point_in_time_recovery {
    enabled = true
  }
}
```

### 수동 백업
```bash
aws dynamodb create-backup \
  --table-name gmp-checklists \
  --backup-name gmp-checklists-$(date +%Y%m%d)
```

## 트러블슈팅

### 일반적인 문제
1. **Terraform 상태 충돌**: `terraform force-unlock [LOCK_ID]`
2. **Lambda 배포 실패**: 패키지 크기 확인
3. **DynamoDB 권한 오류**: IAM 정책 검토

### 로그 확인
```bash
# Lambda 로그
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/gmp"

# API Gateway 로그
aws logs describe-log-groups --log-group-name-prefix "API-Gateway-Execution-Logs"
```

## 리소스 정리

### 개발 환경 정리
```bash
terraform workspace select dev
terraform destroy -var-file="../configs/dev.tfvars"
```

### 전체 정리 스크립트
```bash
./scripts/destroy.sh dev
```

---
**담당자**: drug qrew 팀 (공동 관리)  
**최종 업데이트**: 2025-09-05 14:35
