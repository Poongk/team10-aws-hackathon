// 간단한 로컬 테스트
// 환경변수 설정
process.env.DYNAMODB_TABLE = 'gmp-checkmaster-local';
process.env.NODE_ENV = 'development';

const authHandler = require('./auth-handler/index');
const checklistHandler = require('./checklist-handler/index');

async function testWorkerLogin() {
    console.log('🔐 작업자 로그인 테스트...');
    
    const event = {
        httpMethod: 'POST',
        path: '/auth/worker',
        body: JSON.stringify({
            employee_id: 'EMP001'  // user_id -> employee_id로 수정
        })
    };
    
    try {
        const result = await authHandler.handler(event);
        console.log('✅ 로그인 결과:');
        console.log('Status:', result.statusCode);
        const response = JSON.parse(result.body);
        console.log('Response:', response);
        
        if (response.success) {
            console.log('🎫 JWT Token:', response.data.session_token.substring(0, 50) + '...');
            return response.data.session_token;  // session_token 사용
        }
    } catch (error) {
        console.error('❌ 로그인 실패:', error);
    }
    return null;
}

async function testAdminLogin() {
    console.log('\n🔐 관리자 로그인 테스트...');
    
    const event = {
        httpMethod: 'POST',
        path: '/auth/admin',
        body: JSON.stringify({
            admin_id: 'admin',      // user_id -> admin_id로 수정
            password: 'admin123'
        })
    };
    
    try {
        const result = await authHandler.handler(event);
        console.log('✅ 관리자 로그인 결과:');
        console.log('Status:', result.statusCode);
        const response = JSON.parse(result.body);
        console.log('Response:', response);
        
        if (response.success) {
            console.log('🎫 Admin JWT Token:', response.data.session_token.substring(0, 50) + '...');
            return response.data.session_token;  // session_token 사용
        }
    } catch (error) {
        console.error('❌ 관리자 로그인 실패:', error);
    }
    return null;
}

async function testChecklistSubmit(token) {
    console.log('\n📋 체크리스트 제출 테스트...');
    
    const event = {
        httpMethod: 'POST',
        path: '/checklist',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: 'EMP001',  // user_id 추가
            items: {             // answers -> items로 변경
                symptoms: '예',
                respiratory: '예', 
                wounds: '예',
                uniform: '예',
                accessories: '예',
                hair: '예',
                nails: '예',
                makeup: '예',
                personal_items: '예'
            }
        })
    };
    
    try {
        const result = await checklistHandler.handler(event);
        console.log('✅ 체크리스트 제출 결과:');
        console.log('Status:', result.statusCode);
        const response = JSON.parse(result.body);
        console.log('Response:', response);
    } catch (error) {
        console.error('❌ 체크리스트 제출 실패:', error);
    }
}

async function runTests() {
    console.log('🚀 GMP CheckMaster 백엔드 로컬 테스트 시작\n');
    
    // 1. 작업자 로그인
    const workerToken = await testWorkerLogin();
    
    // 2. 관리자 로그인  
    await testAdminLogin();
    
    // 3. 체크리스트 제출 (작업자 토큰 사용)
    if (workerToken) {
        await testChecklistSubmit(workerToken);
    }
    
    console.log('\n✨ 테스트 완료!');
}

runTests().catch(console.error);
