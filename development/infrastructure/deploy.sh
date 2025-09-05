#!/bin/bash

# GMP CheckMaster AI - React 헬로월드 배포 스크립트

set -e

PROJECT_ROOT="/mnt/c/Projects/q-hackathon/team10-aws-hackathon"
FRONTEND_DIR="$PROJECT_ROOT/development/frontend/hello-world"
INFRA_DIR="$PROJECT_ROOT/development/infrastructure"

echo "🚀 React 헬로월드 배포 시작..."

# 1. React 앱 빌드
echo "📦 React 앱 빌드 중..."
cd "$FRONTEND_DIR"
npm run build

# 2. Terraform 초기화
echo "🔧 Terraform 초기화 중..."
cd "$INFRA_DIR"
terraform init

# 3. Terraform 계획 확인
echo "📋 Terraform 계획 확인 중..."
terraform plan

# 4. Terraform 적용
echo "🏗️ 인프라 생성 중..."
terraform apply -auto-approve

# 5. S3 버킷 이름 가져오기
BUCKET_NAME=$(terraform output -raw bucket_name)
echo "📤 S3 버킷: $BUCKET_NAME"

# 6. React 빌드 파일 S3 업로드
echo "📤 React 앱 S3 업로드 중..."
aws s3 sync "$FRONTEND_DIR/build/" "s3://$BUCKET_NAME/" --delete

# 7. 웹사이트 URL 출력
WEBSITE_URL=$(terraform output -raw website_url)
echo "✅ 배포 완료!"
echo "🌐 웹사이트 URL: $WEBSITE_URL"

echo ""
echo "🧪 테스트 명령어:"
echo "curl $WEBSITE_URL"
