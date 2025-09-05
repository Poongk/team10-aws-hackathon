#!/bin/bash

# 상처 분석 API 테스트 스크립트

API_URL="https://31cxzj6n06.execute-api.us-east-1.amazonaws.com/dev/ai/wound-analysis"

echo "🩹 상처 분석 API 테스트"
echo "========================"

# 사용법 안내
echo "사용법:"
echo "1. 스마트폰으로 상처 사진 촬영"
echo "2. https://www.base64-image.de/ 에서 Base64 변환"
echo "3. 아래 명령어에서 IMAGE_BASE64 부분을 교체"
echo ""

# 테스트 명령어 예시
echo "테스트 명령어 예시:"
echo "==================="

echo "# 경미한 상처 (손)"
echo "curl -X POST \"$API_URL\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"user_id\":\"worker1\",\"wound_location\":\"hand\",\"image_base64\":\"YOUR_BASE64_HERE\"}'"
echo ""

echo "# 보통 상처 (팔)"
echo "curl -X POST \"$API_URL\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"user_id\":\"worker2\",\"wound_location\":\"arm\",\"image_base64\":\"YOUR_BASE64_HERE\"}'"
echo ""

echo "# 심각한 상처 (머리)"
echo "curl -X POST \"$API_URL\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"user_id\":\"worker3\",\"wound_location\":\"head\",\"image_base64\":\"YOUR_BASE64_HERE\"}'"
echo ""

echo "📍 상처 위치 옵션:"
echo "- hand (손)"
echo "- arm (팔)" 
echo "- leg (다리)"
echo "- head (머리) - 자동으로 심각도 상향"
echo "- eye (눈) - 자동으로 심각도 상향"
echo "- neck (목) - 자동으로 심각도 상향"
echo "- chest (가슴) - 자동으로 심각도 상향"
echo ""

echo "🎯 해커톤 데모 시나리오:"
echo "1. 작은 상처 사진 → minor 판정 → 작업 계속"
echo "2. 큰 상처 사진 → severe 판정 → 긴급 알림 + Slack 전송"
echo "3. 실시간 Slack 알림 확인"
