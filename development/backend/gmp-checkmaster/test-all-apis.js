// 전체 API 테스트 스크립트
const authHandler = require('./auth-handler/index');
const checklistHandler = require('./checklist-handler/index');
const aiHandler = require('./ai-judgment-handler/index');
const qrHandler = require('./qr-handler/index');
const dashboardHandler = require('./dashboard-handler/index');
const assignmentHandler = require('./assignment-handler/index');
const notificationHandler = require('./notification-handler/index');
const adminHandler = require('./admin-handler/index');
const actionHandler = require('./action-handler/index');

async function testAllAPIs() {
  console.log('🧪 GMP CheckMaster AI - 전체 API 테스트 시작 (26개 API)\n');

  // 1. 인증 API 테스트
  console.log('🔐 1. 인증 API 테스트');
  await testAuth();

  // 2. 체크리스트 API 테스트 (확장)
  console.log('\n📋 2. 체크리스트 API 테스트 (6개)');
  await testChecklist();

  // 3. AI 판정 API 테스트 (확장)
  console.log('\n🤖 3. AI 판정 API 테스트 (2개)');
  await testAI();

  // 4. QR 코드 API 테스트
  console.log('\n📱 4. QR 코드 API 테스트');
  await testQR();

  // 5. 대시보드 API 테스트 (확장)
  console.log('\n📊 5. 대시보드 API 테스트 (4개)');
  await testDashboard();

  // 6. 배정 관리 API 테스트 (신규)
  console.log('\n📝 6. 배정 관리 API 테스트 (2개)');
  await testAssignment();

  // 7. 알림 API 테스트 (신규)
  console.log('\n🔔 7. 알림 API 테스트 (1개)');
  await testNotification();

  // 8. 관리자 API 테스트 (신규)
  console.log('\n⚙️ 8. 관리자 API 테스트 (3개)');
  await testAdmin();

  // 9. 조치 관리 API 테스트 (신규)
  console.log('\n🚨 9. 조치 관리 API 테스트 (4개)');
  await testAction();

  console.log('\n✅ 전체 API 테스트 완료! (총 26개 API)');
}

async function testAuth() {
  try {
    const loginEvent = {
      path: '/auth/login',
      httpMethod: 'POST',
      body: JSON.stringify({ user_id: 'worker1', password: 'demo123' })
    };
    
    const result = await authHandler.handler(loginEvent);
    const data = JSON.parse(result.body);
    console.log('  ✅ POST /auth/login:', data.success ? '성공' : '실패');
  } catch (error) {
    console.log('  ❌ POST /auth/login: 실패 -', error.message);
  }
}

async function testChecklist() {
  const tests = [
    { path: '/checklists/templates', method: 'GET', name: 'GET /checklists/templates' },
    { path: '/checklists/submit', method: 'POST', name: 'POST /checklists/submit' },
    { path: '/checklists/records', method: 'GET', name: 'GET /checklists/records' },
    { path: '/checklists/records/record_123', method: 'PUT', name: 'PUT /checklists/records/{id}' },
    { path: '/checklists/modification-request', method: 'POST', name: 'POST /checklists/modification-request' },
    { path: '/checklists/emergency-review', method: 'POST', name: 'POST /checklists/emergency-review' }
  ];

  for (const test of tests) {
    try {
      const event = {
        path: test.path,
        httpMethod: test.method,
        pathParameters: test.path.includes('record_123') ? { record_id: 'record_123' } : {},
        body: test.method === 'POST' || test.method === 'PUT' ? 
          JSON.stringify({ user_id: 'worker1', template_id: 'template_001', responses: {} }) : null
      };
      
      const result = await checklistHandler.handler(event);
      const data = JSON.parse(result.body);
      console.log(`  ✅ ${test.name}:`, data.success ? '성공' : '실패');
    } catch (error) {
      console.log(`  ❌ ${test.name}: 실패 -`, error.message);
    }
  }
}

async function testAI() {
  const tests = [
    { path: '/ai/judge', method: 'POST', name: 'POST /ai/judge' },
    { path: '/ai/judgment/record_123', method: 'GET', name: 'GET /ai/judgment/{id}' }
  ];

  for (const test of tests) {
    try {
      const event = {
        path: test.path,
        httpMethod: test.method,
        pathParameters: test.path.includes('record_123') ? { record_id: 'record_123' } : {},
        body: test.method === 'POST' ? 
          JSON.stringify({ responses: { symptoms: '없음', respiratory: '없음' } }) : null
      };
      
      const result = await aiHandler.handler(event);
      const data = JSON.parse(result.body);
      console.log(`  ✅ ${test.name}:`, data.success ? '성공' : '실패');
    } catch (error) {
      console.log(`  ❌ ${test.name}: 실패 -`, error.message);
    }
  }
}

async function testQR() {
  const tests = [
    { path: '/qr/generate', method: 'POST', name: 'POST /qr/generate' },
    { path: '/qr/verify', method: 'POST', name: 'POST /qr/verify' }
  ];

  for (const test of tests) {
    try {
      const event = {
        path: test.path,
        httpMethod: test.method,
        body: JSON.stringify({ 
          user_id: 'worker1', 
          record_id: 'record_123',
          qr_code: 'QR-worker1-123'
        })
      };
      
      const result = await qrHandler.handler(event);
      const data = JSON.parse(result.body);
      console.log(`  ✅ ${test.name}:`, data.success ? '성공' : '실패');
    } catch (error) {
      console.log(`  ❌ ${test.name}: 실패 -`, error.message);
    }
  }
}

async function testDashboard() {
  const tests = [
    { path: '/dashboard/stats', method: 'GET', name: 'GET /dashboard/stats' },
    { path: '/dashboard/reports', method: 'GET', name: 'GET /dashboard/reports' },
    { path: '/dashboard/status', method: 'GET', name: 'GET /dashboard/status' },
    { path: '/dashboard/team/team_001', method: 'GET', name: 'GET /dashboard/team/{id}' }
  ];

  for (const test of tests) {
    try {
      const event = {
        path: test.path,
        httpMethod: test.method,
        pathParameters: test.path.includes('team_001') ? { team_id: 'team_001' } : {}
      };
      
      const result = await dashboardHandler.handler(event);
      const data = JSON.parse(result.body);
      console.log(`  ✅ ${test.name}:`, data.success ? '성공' : '실패');
    } catch (error) {
      console.log(`  ❌ ${test.name}: 실패 -`, error.message);
    }
  }
}

async function testAssignment() {
  const tests = [
    { path: '/assignment/list', method: 'GET', name: 'GET /assignment/list' },
    { path: '/assignment/create', method: 'POST', name: 'POST /assignment/create' }
  ];

  for (const test of tests) {
    try {
      const event = {
        path: test.path,
        httpMethod: test.method,
        body: test.method === 'POST' ? 
          JSON.stringify({ template_id: 'template_001', user_ids: ['worker1', 'worker2'] }) : null
      };
      
      const result = await assignmentHandler.handler(event);
      const data = JSON.parse(result.body);
      console.log(`  ✅ ${test.name}:`, data.success ? '성공' : '실패');
    } catch (error) {
      console.log(`  ❌ ${test.name}: 실패 -`, error.message);
    }
  }
}

async function testNotification() {
  try {
    const event = {
      path: '/notification/send',
      httpMethod: 'POST',
      body: JSON.stringify({ 
        type: 'reminder',
        target_users: ['worker1', 'worker2'],
        message: '테스트 알림'
      })
    };
    
    const result = await notificationHandler.handler(event);
    const data = JSON.parse(result.body);
    console.log('  ✅ POST /notification/send:', data.success ? '성공' : '실패');
  } catch (error) {
    console.log('  ❌ POST /notification/send: 실패 -', error.message);
  }
}

async function testAdmin() {
  const tests = [
    { path: '/admin/templates', method: 'POST', name: 'POST /admin/templates' },
    { path: '/admin/qr-validity/template/template_001', method: 'PUT', name: 'PUT /admin/qr-validity/template/{id}' },
    { path: '/operator/qr-validity/daily', method: 'PUT', name: 'PUT /operator/qr-validity/daily' }
  ];

  for (const test of tests) {
    try {
      const event = {
        path: test.path,
        httpMethod: test.method,
        pathParameters: test.path.includes('template_001') ? { template_id: 'template_001' } : {},
        body: JSON.stringify({ 
          name: '테스트 템플릿',
          default_expires_time: '17:30',
          date: '2025-09-05'
        })
      };
      
      const result = await adminHandler.handler(event);
      const data = JSON.parse(result.body);
      console.log(`  ✅ ${test.name}:`, data.success ? '성공' : '실패');
    } catch (error) {
      console.log(`  ❌ ${test.name}: 실패 -`, error.message);
    }
  }
}

async function testAction() {
  const tests = [
    { path: '/actions/list', method: 'GET', name: 'GET /actions/list' },
    { path: '/actions/record_001/status', method: 'PUT', name: 'PUT /actions/{id}/status' },
    { path: '/actions/record_001/complete', method: 'POST', name: 'POST /actions/{id}/complete' },
    { path: '/actions/status/record_001', method: 'GET', name: 'GET /actions/status/{id}' }
  ];

  for (const test of tests) {
    try {
      const event = {
        path: test.path,
        httpMethod: test.method,
        pathParameters: test.path.includes('record_001') ? { record_id: 'record_001' } : {},
        body: (test.method === 'POST' || test.method === 'PUT') ? 
          JSON.stringify({ 
            status: 'in_progress',
            updated_by: 'operator1',
            completion_notes: '조치 완료',
            completed_by: 'operator1'
          }) : null
      };
      
      const result = await actionHandler.handler(event);
      const data = JSON.parse(result.body);
      console.log(`  ✅ ${test.name}:`, data.success ? '성공' : '실패');
    } catch (error) {
      console.log(`  ❌ ${test.name}: 실패 -`, error.message);
    }
  }
}

// 테스트 실행
runTests();

async function runTests() {
  try {
    await testAllAPIs();
  } catch (error) {
    console.error('❌ 전체 테스트 실패:', error);
  }
}
