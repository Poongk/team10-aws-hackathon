#!/bin/bash

# Hello World 사진 AI 분석 → Slack 알림 데모 가이드

API_URL="https://31cxzj6n06.execute-api.us-east-1.amazonaws.com/dev/ai/text-analysis"

echo "🎉 Hello World 사진 AI 분석 → Slack 알림 시스템"
echo "=================================================="

echo ""
echo "📸 데모 시나리오:"
echo "1. 종이에 'Hello World' 작성"
echo "2. 스마트폰으로 사진 촬영"
echo "3. Base64 변환 (https://www.base64-image.de/)"
echo "4. API 호출로 AI 분석"
echo "5. 🎉 Slack으로 축하 알림 자동 전송!"

echo ""
echo "🎯 테스트 명령어:"
echo "=================="

echo "# Hello World 텍스트 분석"
echo "curl -X POST \"$API_URL\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"user_id\":\"developer1\",\"image_base64\":\"YOUR_BASE64_HERE\"}'"

echo ""
echo "📝 Hello World 변형들 (AI가 자동 감지):"
echo "- Hello World!"
echo "- Hello, World!"
echo "- HELLO WORLD"
echo "- hello world"
echo "- 안녕하세요 세계"
echo "- Hola Mundo"
echo "- Bonjour le monde"
echo "- Привет мир"
echo "- こんにちは世界"

echo ""
echo "🔔 Slack 알림 내용:"
echo "==================="
echo "제목: 🎉 Hello World 감지!"
echo "사용자: [입력한 사용자명]"
echo "감지된 텍스트: [AI가 분석한 텍스트]"
echo "메시지: 🎉 축하합니다! \"Hello World\"를 성공적으로 작성했습니다!"
echo "신뢰도: [AI 신뢰도 %]"
echo "시간: [현재 시간]"

echo ""
echo "🚀 해커톤 데모 포인트:"
echo "====================="
echo "✨ 사진 한 장으로 텍스트 인식"
echo "✨ 다국어 Hello World 자동 감지"
echo "✨ 실시간 Slack 축하 알림"
echo "✨ DynamoDB에 분석 결과 저장"
echo "✨ 프로그래밍 첫 걸음 축하 시스템"

echo ""
echo "📱 빠른 테스트 방법:"
echo "==================="
echo "1. 스마트폰 메모장에 'Hello World' 입력"
echo "2. 스크린샷 촬영"
echo "3. Base64 변환 사이트에 업로드"
echo "4. 변환된 코드로 API 테스트"
echo "5. Slack에서 축하 알림 확인!"

echo ""
echo "🎊 성공 시 Slack 채널에서 확인하세요!"
