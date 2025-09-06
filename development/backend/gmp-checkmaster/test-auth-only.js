// 인증 로직만 테스트 (DynamoDB 없이)
const jwt = require('jsonwebtoken');

// 사용자 데이터 (auth-handler에서 복사)
const users = {
    'EMP001': { name: '김철수', type: 'worker' },
    'EMP002': { name: '이영희', type: 'worker' },
    'EMP003': { name: '박민수', type: 'worker' },
    'EMP004': { name: '정수연', type: 'worker' },
    'EMP005': { name: '최수진', type: 'worker' },
    'admin': { name: '시스템 관리자', type: 'admin' }
};

const JWT_SECRET = 'gmp-checkmaster-secret-key';

function testWorkerAuth() {
    console.log('🔐 작업자 인증 로직 테스트');
    
    const employee_id = 'EMP001';
    const user = users[employee_id];
    
    if (!user || user.type !== 'worker') {
        console.log('❌ 사용자를 찾을 수 없음');
        return;
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
        { user_id: employee_id, user_type: 'worker' },
        JWT_SECRET,
        { expiresIn: '8h' }
    );
    
    console.log('✅ 토큰 생성 성공');
    console.log('사용자:', user.name);
    console.log('토큰:', token.substring(0, 50) + '...');
    
    // 토큰 검증
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ 토큰 검증 성공');
        console.log('디코딩된 정보:', decoded);
        return token;
    } catch (error) {
        console.log('❌ 토큰 검증 실패:', error.message);
    }
}

function testAdminAuth() {
    console.log('\n🔐 관리자 인증 로직 테스트');
    
    const admin_id = 'admin';
    const password = 'admin123';
    const user = users[admin_id];
    
    if (!user || user.type !== 'admin') {
        console.log('❌ 관리자를 찾을 수 없음');
        return;
    }
    
    if (password !== 'admin123') {
        console.log('❌ 비밀번호 불일치');
        return;
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
        { user_id: admin_id, user_type: 'admin' },
        JWT_SECRET,
        { expiresIn: '8h' }
    );
    
    console.log('✅ 관리자 토큰 생성 성공');
    console.log('관리자:', user.name);
    console.log('토큰:', token.substring(0, 50) + '...');
    
    return token;
}

function testChecklistLogic(token) {
    console.log('\n📋 체크리스트 로직 테스트');
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ 토큰 검증 성공:', decoded.user_id);
        
        // 체크리스트 평가 로직
        const items = {
            symptoms: '예',
            respiratory: '예', 
            wounds: '예',
            uniform: '예',
            accessories: '예',
            hair: '예',
            nails: '예',
            makeup: '예',
            personal_items: '예'
        };
        
        // 간단한 평가 로직
        const failedItems = Object.entries(items).filter(([key, value]) => value === '아니오');
        const isApproved = failedItems.length === 0;
        
        console.log('체크리스트 항목:', Object.keys(items).length);
        console.log('실패 항목:', failedItems.length);
        console.log('최종 판정:', isApproved ? '✅ 적합' : '❌ 부적합');
        
        if (!isApproved) {
            console.log('실패 사유:', failedItems.map(([key]) => key));
        }
        
        return {
            user_id: decoded.user_id,
            status: isApproved ? 'approved' : 'rejected',
            items: items,
            failed_items: failedItems.map(([key]) => key),
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.log('❌ 토큰 검증 실패:', error.message);
    }
}

function runTests() {
    console.log('🚀 GMP CheckMaster 로직 테스트 시작\n');
    
    // 1. 작업자 인증
    const workerToken = testWorkerAuth();
    
    // 2. 관리자 인증
    const adminToken = testAdminAuth();
    
    // 3. 체크리스트 로직
    if (workerToken) {
        const result = testChecklistLogic(workerToken);
        console.log('\n📊 최종 결과:', result);
    }
    
    console.log('\n✨ 모든 테스트 완료!');
}

runTests();
