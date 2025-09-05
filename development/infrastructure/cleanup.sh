#!/bin/bash

# GMP CheckMaster AI - 리소스 정리 스크립트

set -e

INFRA_DIR="/mnt/c/Projects/q-hackathon/team10-aws-hackathon/development/infrastructure"

echo "🧹 AWS 리소스 정리 시작..."

cd "$INFRA_DIR"

# S3 버킷 비우기
BUCKET_NAME=$(terraform output -raw bucket_name 2>/dev/null || echo "")
if [ ! -z "$BUCKET_NAME" ]; then
    echo "🗑️ S3 버킷 비우는 중: $BUCKET_NAME"
    aws s3 rm "s3://$BUCKET_NAME/" --recursive
fi

# Terraform 리소스 삭제
echo "🏗️ Terraform 리소스 삭제 중..."
terraform destroy -auto-approve

echo "✅ 정리 완료!"
