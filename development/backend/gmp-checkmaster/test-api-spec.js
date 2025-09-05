const https = require('https');

// API 기본 설정
const API_BASE = 'https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod';
let authToken = '';

// 테스트 실행
async function runTests() {
    console.log('🚀 API 명세서 기준 테스트 시작\n');
    
    try {
        // 1. 작업자 로그인 테스트
        console.log('1️⃣ 작업자 로그인 테스트');
        const workerLogin = await testWorkerLogin();
        authToken = workerLogin.data.session_token;
        console.log('✅ 작업자 로그인 성공\n');
        
        // 2. 관리자 로그인 테스트
        console.log('2️⃣ 관리자 로그인 테스트');
        const adminLogin = await testAdminLogin();
        const adminToken = adminLogin.data.session_token;
        console.log('✅ 관리자 로그인 성공\n');
        
        // 3. 체크리스트 제출 테스트 (적합)
        console.log('3️⃣ 체크리스트 제출 테스트 (적합)');
        const approvedChecklist = await testChecklistSubmit(authToken, 'approved');
        console.log('✅ 적합 체크리스트 제출 성공\n');
        
        // 4. 체크리스트 제출 테스트 (부적합)
        console.log('4️⃣ 체크리스트 제출 테스트 (부적합)');
        const rejectedChecklist = await testChecklistSubmit(authToken, 'rejected');
        console.log('✅ 부적합 체크리스트 제출 성공\n');
        
        // 5. AI 상처 분석 테스트
        console.log('5️⃣ AI 상처 분석 테스트');
        await testWoundAnalysis(authToken);
        console.log('✅ AI 상처 분석 성공\n');
        
        // 6. QR 코드 검증 테스트
        console.log('6️⃣ QR 코드 검증 테스트');
        if (approvedChecklist.data.qr_code) {
            await testQRVerification(adminToken, approvedChecklist.data.qr_code);
            console.log('✅ QR 코드 검증 성공\n');
        }
        
        // 7. 사용자별 체크리스트 조회 테스트
        console.log('7️⃣ 사용자별 체크리스트 조회 테스트');
        await testGetUserChecklist(authToken, 'EMP001');
        console.log('✅ 체크리스트 조회 성공\n');
        
        // 8. 출입 로그 조회 테스트
        console.log('8️⃣ 출입 로그 조회 테스트');
        await testGetAccessLogs(adminToken);
        console.log('✅ 출입 로그 조회 성공\n');
        
        console.log('🎉 모든 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
    }
}

// 1. 작업자 로그인 테스트
async function testWorkerLogin() {
    const data = {
        employee_id: 'EMP001'
    };
    
    const response = await makeRequest('POST', '/auth/worker', data);
    console.log('작업자 로그인 응답:', JSON.stringify(response, null, 2));
    
    if (!response.success || !response.data.session_token) {
        throw new Error('작업자 로그인 실패');
    }
    
    return response;
}

// 2. 관리자 로그인 테스트
async function testAdminLogin() {
    const data = {
        admin_id: 'admin'
    };
    
    const response = await makeRequest('POST', '/auth/admin', data);
    console.log('관리자 로그인 응답:', JSON.stringify(response, null, 2));
    
    if (!response.success || !response.data.session_token) {
        throw new Error('관리자 로그인 실패');
    }
    
    return response;
}

// 3. 체크리스트 제출 테스트
async function testChecklistSubmit(token, type) {
    const data = type === 'approved' ? {
        user_id: 'EMP001',
        items: {
            symptoms: '아니오',
            respiratory: '아니오',
            wounds: '아니오',
            uniform: '예',
            accessories: '예',
            hair: '예',
            nails: '예',
            makeup: '예',
            personal_items: '예'
        }
    } : {
        user_id: 'EMP001', // 같은 사용자로 변경
        items: {
            symptoms: '예', // 부적합 조건
            respiratory: '아니오',
            wounds: '아니오',
            uniform: '예',
            accessories: '예',
            hair: '예',
            nails: '예',
            makeup: '예',
            personal_items: '예'
        }
    };
    
    const response = await makeRequest('POST', '/checklist', data, token);
    console.log(`체크리스트 제출 응답 (${type}):`, JSON.stringify(response, null, 2));
    
    if (!response.success) {
        throw new Error(`체크리스트 제출 실패 (${type})`);
    }
    
    return response;
}

// 4. AI 상처 분석 테스트
async function testWoundAnalysis(token) {
    // JSON 형식으로 변경
    const data = {
        user_id: 'EMP001',
        image_base64: 'fake_base64_image_data_for_testing'
    };
    
    const response = await makeRequest('POST', '/ai/analyze-wound', data, token);
    console.log('AI 상처 분석 응답:', JSON.stringify(response, null, 2));
    
    if (!response.success) {
        throw new Error('AI 상처 분석 실패');
    }
    
    return response;
}

// 5. QR 코드 검증 테스트
async function testQRVerification(token, qrCode) {
    const data = {
        qr_data: qrCode,
        scanner_id: 'admin'
    };
    
    const response = await makeRequest('POST', '/qr/verify', data, token);
    console.log('QR 코드 검증 응답:', JSON.stringify(response, null, 2));
    
    if (!response.success) {
        throw new Error('QR 코드 검증 실패');
    }
    
    return response;
}

// 6. 사용자별 체크리스트 조회 테스트
async function testGetUserChecklist(token, userId) {
    const response = await makeRequest('GET', `/checklist/${userId}?limit=5`, null, token);
    console.log('체크리스트 조회 응답:', JSON.stringify(response, null, 2));
    
    if (!response.success) {
        throw new Error('체크리스트 조회 실패');
    }
    
    return response;
}

// 7. 출입 로그 조회 테스트
async function testGetAccessLogs(token) {
    const today = new Date().toISOString().slice(0, 10);
    const response = await makeRequest('GET', `/access-log?date=${today}&limit=10`, null, token);
    console.log('출입 로그 조회 응답:', JSON.stringify(response, null, 2));
    
    if (!response.success) {
        throw new Error('출입 로그 조회 실패');
    }
    
    return response;
}

// HTTP 요청 헬퍼 함수
function makeRequest(method, path, data, token, contentType = 'application/json') {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': contentType,
                'Accept': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        let postData = '';
        if (data && method !== 'GET') {
            if (contentType === 'application/json') {
                postData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            } else {
                postData = data;
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }
        }
        
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve(response);
                } catch (error) {
                    reject(new Error(`JSON 파싱 오류: ${body}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// multipart/form-data 생성 헬퍼
function createFormData(fields) {
    const boundary = '----formdata-boundary-' + Math.random().toString(36);
    let formData = '';
    
    for (const [key, value] of Object.entries(fields)) {
        formData += `--${boundary}\r\n`;
        formData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        formData += `${value}\r\n`;
    }
    
    formData += `--${boundary}--\r\n`;
    return formData;
}

// 로컬 테스트용 (API Gateway URL이 없는 경우)
function runLocalTests() {
    console.log('🧪 로컬 테스트 모드');
    console.log('API Gateway URL을 설정하고 runTests()를 실행하세요.');
    console.log('예: API_BASE = "https://your-api-id.execute-api.us-east-1.amazonaws.com/Prod"');
}

// 실행
if (API_BASE.includes('your-api-gateway-url')) {
    runLocalTests();
} else {
    runTests();
}
