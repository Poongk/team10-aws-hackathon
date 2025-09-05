#!/bin/bash

echo "🚀 GMP CheckMaster API 빌드 및 배포 시작"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 에러 발생 시 스크립트 중단
set -e

# 1. 의존성 설치
echo -e "${YELLOW}📦 의존성 설치 중...${NC}"

handlers=("auth-handler" "checklist-handler" "ai-analysis-handler" "qr-handler" "access-log-handler")

for handler in "${handlers[@]}"; do
    if [ -d "$handler" ]; then
        echo "  - $handler 의존성 설치"
        cd "$handler"
        npm install --production
        cd ..
    else
        echo -e "${RED}❌ $handler 디렉토리가 없습니다${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ 의존성 설치 완료${NC}"

# 2. SAM 빌드
echo -e "${YELLOW}🔨 SAM 빌드 중...${NC}"
sam build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SAM 빌드 완료${NC}"
else
    echo -e "${RED}❌ SAM 빌드 실패${NC}"
    exit 1
fi

# 3. SAM 배포
echo -e "${YELLOW}🚀 SAM 배포 중...${NC}"
sam deploy --guided

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SAM 배포 완료${NC}"
else
    echo -e "${RED}❌ SAM 배포 실패${NC}"
    exit 1
fi

# 4. API Gateway URL 출력
echo -e "${YELLOW}📋 배포 정보 확인 중...${NC}"
API_URL=$(aws cloudformation describe-stacks --stack-name gmp-checkmaster --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayEndpoint`].OutputValue' --output text)

if [ ! -z "$API_URL" ]; then
    echo -e "${GREEN}🌐 API Gateway URL: $API_URL${NC}"
    
    # 테스트 스크립트 업데이트
    sed -i "s|const API_BASE = '.*';|const API_BASE = '$API_URL';|" test-api-spec.js
    echo -e "${GREEN}✅ 테스트 스크립트 업데이트 완료${NC}"
else
    echo -e "${YELLOW}⚠️  API Gateway URL을 가져올 수 없습니다${NC}"
fi

# 5. 테스트 실행 (선택사항)
echo -e "${YELLOW}🧪 API 테스트를 실행하시겠습니까? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}🧪 API 테스트 실행 중...${NC}"
    node test-api-spec.js
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ API 테스트 완료${NC}"
    else
        echo -e "${RED}❌ API 테스트 실패${NC}"
    fi
fi

echo -e "${GREEN}🎉 배포 완료!${NC}"
echo ""
echo "📋 다음 단계:"
echo "1. API Gateway URL: $API_URL"
echo "2. 테스트: node test-api-spec.js"
echo "3. 프론트엔드에서 API URL 설정"
echo ""
