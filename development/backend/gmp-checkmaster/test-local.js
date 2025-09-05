// 로컬 테스트 스크립트
const authHandler = require('./auth-handler/index');
const checklistHandler = require('./checklist-handler/index');
const aiHandler = require('./ai-judgment-handler/index');

async function testAuth() {
  console.log('🔐 인증 테스트...');
  
  const loginEvent = {
    path: '/auth/login',
    httpMethod: 'POST',
    body: JSON.stringify({ user_id: 'worker1', password: 'demo123' })
  };
  
  const result = await authHandler.handler(loginEvent);
  console.log('로그인 결과:', JSON.parse(result.body));
}

async function testChecklist() {
  console.log('\n📋 체크리스트 테스트...');
  
  const templatesEvent = {
    path: '/checklists/templates',
    httpMethod: 'GET'
  };
  
  const result = await checklistHandler.handler(templatesEvent);
  console.log('템플릿 조회:', JSON.parse(result.body));
}

async function testAI() {
  console.log('\n🤖 AI 판정 테스트...');
  
  const aiEvent = {
    path: '/ai/judge',
    httpMethod: 'POST',
    body: JSON.stringify({
      responses: {
        symptoms: '없음',
        respiratory: '없음',
        wound: '없음',
        clothing: '적절'
      }
    })
  };
  
  const result = await aiHandler.handler(aiEvent);
  console.log('AI 판정 결과:', JSON.parse(result.body));
}

async function runTests() {
  try {
    await testAuth();
    await testChecklist();
    await testAI();
    console.log('\n✅ 모든 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

runTests();
