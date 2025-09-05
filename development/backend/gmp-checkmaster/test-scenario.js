const https = require('https');

// API 기본 설정
const API_BASE = 'https://2c0irfuzji.execute-api.us-east-1.amazonaws.com/Prod';

// 시연 시나리오 테스트
async function runScenarioTests() {
    console.log('🎬 위생상태점검표 시연 시나리오 API 테스트 시작\n');
    
    try {
        // 시나리오 1: 정상 케이스 (김철수)
        console.log('📋 시나리오 1: 정상 케이스 (김철수)');
        await testScenario1();
        console.log('✅ 시나리오 1 완료\n');
        
        // 시나리오 2: AI 판별 케이스 (이영희)
        console.log('🤖 시나리오 2: AI 판별 케이스 (이영희)');
        await testScenario2();
        console.log('✅ 시나리오 2 완료\n');
        
        // 시나리오 3: AI 판별 부적합 케이스 (박민수)
        console.log('❌ 시나리오 3: AI 판별 부적합 케이스 (박민수)');
        await testScenario3();
        console.log('✅ 시나리오 3 완료\n');
        
        // 시나리오 4: 일반 부적합 케이스 (정수연)
        console.log('🤒 시나리오 4: 일반 부적합 케이스 (정수연)');
        await testScenario4();
        console.log('✅ 시나리오 4 완료\n');
        
        // 시나리오 5: QR 코드 만료 케이스 (최수진)
        console.log('⏰ 시나리오 5: QR 코드 만료 케이스 (최수진)');
        await testScenario5();
        console.log('✅ 시나리오 5 완료\n');
        
        console.log('🎉 모든 시연 시나리오 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 시나리오 테스트 실패:', error.message);
    }
}

// 시나리오 1: 정상 케이스 (김철수)
async function testScenario1() {
    console.log('  1. 김철수 로그인');
    const loginResponse = await makeRequest('POST', '/auth/worker', {
        employee_id: 'EMP001'
    });
    console.log(`     → ${loginResponse.data.name} 로그인 성공`);
    
    const token = loginResponse.data.session_token;
    
    console.log('  2. 정상 체크리스트 제출');
    const checklistResponse = await makeRequest('POST', '/checklist', {
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
    }, token);
    
    console.log(`     → 상태: ${checklistResponse.data.status}`);
    console.log(`     → 메시지: ${checklistResponse.data.message}`);
    console.log(`     → QR 코드: ${checklistResponse.data.qr_code ? '생성됨' : '없음'}`);
    
    if (checklistResponse.data.qr_code) {
        console.log('  3. 관리자 로그인 및 QR 스캔');
        const adminLogin = await makeRequest('POST', '/auth/admin', {
            admin_id: 'admin'
        });
        
        const qrResponse = await makeRequest('POST', '/qr/verify', {
            qr_data: checklistResponse.data.qr_code,
            scanner_id: 'admin'
        }, adminLogin.data.session_token);
        
        console.log(`     → 스캔 결과: ${qrResponse.data.message}`);
        console.log(`     → AI 검증: ${qrResponse.data.ai_verified ? '완료' : '없음'}`);
    }
}

// 시나리오 2: AI 판별 케이스 (이영희)
async function testScenario2() {
    console.log('  1. 이영희 로그인');
    const loginResponse = await makeRequest('POST', '/auth/worker', {
        employee_id: 'EMP002'
    });
    console.log(`     → ${loginResponse.data.name || 'EMP002'} 로그인 성공`);
    
    const token = loginResponse.data.session_token;
    
    console.log('  2. AI 상처 분석 요청');
    const aiResponse = await makeRequest('POST', '/ai/analyze-wound', {
        user_id: 'EMP002',
        image_base64: 'small_wound_image_data_for_testing'
    }, token);
    
    console.log(`     → AI 결과: ${aiResponse.data.result}`);
    console.log(`     → 신뢰도: ${aiResponse.data.confidence}`);
    console.log(`     → 메시지: ${aiResponse.data.message}`);
    
    console.log('  3. AI 결과 반영한 체크리스트 제출');
    const checklistResponse = await makeRequest('POST', '/checklist', {
        user_id: 'EMP002',
        items: {
            symptoms: '아니오',
            respiratory: '아니오',
            wounds: '아니오', // AI 결과 반영
            uniform: '예',
            accessories: '예',
            hair: '예',
            nails: '예',
            makeup: '예',
            personal_items: '예'
        },
        ai_analysis: {
            item_id: 'wounds',
            result: aiResponse.data.result
        }
    }, token);
    
    console.log(`     → 상태: ${checklistResponse.data.status}`);
    console.log(`     → AI 검증: ${checklistResponse.data.ai_result ? '포함됨' : '없음'}`);
}

// 시나리오 3: AI 판별 부적합 케이스 (박민수)
async function testScenario3() {
    console.log('  1. 박민수 로그인');
    const loginResponse = await makeRequest('POST', '/auth/worker', {
        employee_id: 'EMP003'
    });
    console.log(`     → ${loginResponse.data.name || 'EMP003'} 로그인 성공`);
    
    const token = loginResponse.data.session_token;
    
    console.log('  2. AI 상처 분석 요청 (염증 상처)');
    // AI 분석에서 부적합 결과를 시뮬레이션하기 위해 특별한 이미지 데이터 사용
    const aiResponse = await makeRequest('POST', '/ai/analyze-wound', {
        user_id: 'EMP003',
        image_base64: 'infected_wound_image_data_for_testing'
    }, token);
    
    console.log(`     → AI 결과: ${aiResponse.data.result}`);
    console.log(`     → 메시지: ${aiResponse.data.message}`);
    
    console.log('  3. AI 부적합 결과 반영한 체크리스트 제출');
    const checklistResponse = await makeRequest('POST', '/checklist', {
        user_id: 'EMP003',
        items: {
            symptoms: '아니오',
            respiratory: '아니오',
            wounds: '예', // AI 부적합 결과 반영
            uniform: '예',
            accessories: '예',
            hair: '예',
            nails: '예',
            makeup: '예',
            personal_items: '예'
        },
        ai_analysis: {
            item_id: 'wounds',
            result: 'rejected'
        }
    }, token);
    
    console.log(`     → 상태: ${checklistResponse.data.status}`);
    console.log(`     → 사유: ${checklistResponse.data.reason || '상처 부적합'}`);
    console.log(`     → QR 코드: ${checklistResponse.data.qr_code ? '생성됨' : '생성 안됨'}`);
}

// 시나리오 4: 일반 부적합 케이스 (정수연)
async function testScenario4() {
    console.log('  1. 정수연 로그인');
    const loginResponse = await makeRequest('POST', '/auth/worker', {
        employee_id: 'EMP004'
    });
    console.log(`     → ${loginResponse.data.name || 'EMP004'} 로그인 성공`);
    
    const token = loginResponse.data.session_token;
    
    console.log('  2. 발열 증상 체크리스트 제출');
    const checklistResponse = await makeRequest('POST', '/checklist', {
        user_id: 'EMP004',
        items: {
            symptoms: '예', // 발열 증상 있음
            respiratory: '아니오',
            wounds: '아니오',
            uniform: '예',
            accessories: '예',
            hair: '예',
            nails: '예',
            makeup: '예',
            personal_items: '예'
        }
    }, token);
    
    console.log(`     → 상태: ${checklistResponse.data.status}`);
    console.log(`     → 사유: ${checklistResponse.data.reason}`);
    console.log(`     → 메시지: ${checklistResponse.data.message}`);
    console.log(`     → 권장사항: ${checklistResponse.data.recommendation}`);
    console.log(`     → QR 코드: ${checklistResponse.data.qr_code ? '생성됨' : '생성 안됨'}`);
}

// 시나리오 5: QR 코드 만료 케이스 (최수진)
async function testScenario5() {
    console.log('  1. 최수진 로그인');
    const loginResponse = await makeRequest('POST', '/auth/worker', {
        employee_id: 'EMP005'
    });
    console.log(`     → ${loginResponse.data.name || 'EMP005'} 로그인 성공`);
    
    const token = loginResponse.data.session_token;
    
    console.log('  2. 정상 체크리스트 제출 (QR 생성)');
    const checklistResponse = await makeRequest('POST', '/checklist', {
        user_id: 'EMP005',
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
    }, token);
    
    console.log(`     → QR 코드: ${checklistResponse.data.qr_code ? '생성됨' : '생성 안됨'}`);
    
    if (checklistResponse.data.qr_code) {
        console.log('  3. QR 코드 수동 만료 처리');
        const expireResponse = await makeRequest('PUT', '/qr/expire', {
            user_id: 'EMP005',
            check_time: new Date().toISOString()
        }, token);
        
        console.log(`     → 만료 처리: ${expireResponse.data.message}`);
        
        console.log('  4. 만료된 QR 코드 스캔 시도');
        const adminLogin = await makeRequest('POST', '/auth/admin', {
            admin_id: 'admin'
        });
        
        try {
            const qrResponse = await makeRequest('POST', '/qr/verify', {
                qr_data: checklistResponse.data.qr_code,
                scanner_id: 'admin'
            }, adminLogin.data.session_token);
            
            console.log(`     → 예상치 못한 성공: ${qrResponse.data.message}`);
        } catch (error) {
            console.log(`     → 예상된 실패: QR 코드 만료 감지됨`);
        }
    }
}

// HTTP 요청 헬퍼 함수
function makeRequest(method, path, data, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        let postData = '';
        if (data && method !== 'GET') {
            postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(new Error(response.error?.message || 'API 오류'));
                    }
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

// 실행
runScenarioTests();
