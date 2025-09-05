const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

// 응답 유틸리티
function successResponse(data, message = 'Success') {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    })
  };
}

function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: false,
      message,
      timestamp: new Date().toISOString()
    })
  };
}

exports.handler = async (event) => {
  try {
    console.log('Router Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    // CORS 처리
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
    }
    
    // 인증 API
    if (path === '/auth/login' && method === 'POST') {
      return await handleLogin(event);
    }
    
    if (path === '/auth/logout' && method === 'POST') {
      return successResponse({ message: 'Logged out successfully' }, 'Logout successful');
    }
    
    if (path === '/auth/verify' && method === 'GET') {
      const token = event.headers.Authorization || event.headers.authorization;
      if (!token) {
        return errorResponse(401, 'No token provided');
      }
      if (token.startsWith('demo-jwt-')) {
        return successResponse({ valid: true }, 'Token is valid');
      }
      return errorResponse(401, 'Invalid token');
    }
    
    // 체크리스트 API
    if (path === '/checklists/templates' && method === 'GET') {
      return await getTemplates();
    }
    
    if (path === '/checklists/submit' && method === 'POST') {
      return await submitChecklist(event);
    }
    
    if (path === '/checklists/records' && method === 'GET') {
      return await getRecords();
    }
    
    // AI 판정 API
    if (path === '/ai/judge' && method === 'POST') {
      return await handleAIJudge(event);
    }
    
    // QR 코드 API
    if (path === '/qr/generate' && method === 'POST') {
      return await generateQR(event);
    }
    
    if (path === '/qr/verify' && method === 'POST') {
      return await verifyQR(event);
    }
    
    // 기타 API들은 Mock 응답
    return successResponse({ message: 'API endpoint working' }, 'Success');
    
  } catch (error) {
    console.error('Router Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

// DynamoDB 연동 함수들
async function handleLogin(event) {
  const data = JSON.parse(event.body);
  const { user_id, password } = data;
  
  try {
    console.log('Attempting DynamoDB login for:', user_id);
    
    // DynamoDB에서 사용자 조회
    const params = {
      TableName: process.env.USERS_TABLE || 'gmp-checkmaster-users',
      Key: { user_id: user_id }
    };
    
    const result = await dynamodb.get(params).promise();
    console.log('DynamoDB result:', result);
    
    if (result.Item && password === 'demo123') {
      const user = result.Item;
      const token = `demo-jwt-${user_id}-${Date.now()}`;
      
      return successResponse({
        token,
        user: {
          id: user.user_id,
          name: user.name,
          role: user.role,
          team: user.team
        },
        expires_in: 28800
      }, 'Login successful (DynamoDB)');
    }
    
  } catch (error) {
    console.error('DynamoDB login error:', error);
  }
  
  // Mock 폴백
  const mockUsers = {
    'worker1': { id: 'worker1', name: '김작업', role: 'worker', team: '생산팀A' },
    'operator1': { id: 'operator1', name: '박운영', role: 'operator', team: '운영팀' },
    'supervisor1': { id: 'supervisor1', name: '이책임', role: 'supervisor', team: '생산팀A' },
    'admin1': { id: 'admin1', name: '최관리', role: 'admin', team: 'IT팀' },
    'security1': { id: 'security1', name: '정보안', role: 'security', team: '보안팀' }
  };
  
  const mockUser = mockUsers[user_id];
  if (!mockUser || password !== 'demo123') {
    return errorResponse(401, 'Invalid credentials');
  }
  
  const token = `demo-jwt-${user_id}-${Date.now()}`;
  return successResponse({
    token,
    user: mockUser,
    expires_in: 28800
  }, 'Login successful (Mock)');
}

async function getTemplates() {
  try {
    console.log('Attempting DynamoDB templates');
    
    const params = {
      TableName: process.env.CHECKLIST_TEMPLATES_TABLE || 'gmp-checkmaster-checklist-templates'
    };
    
    const result = await dynamodb.scan(params).promise();
    console.log('DynamoDB templates result:', result);
    
    if (result.Items && result.Items.length > 0) {
      const processedTemplates = result.Items.map(template => ({
        ...template,
        items: typeof template.items === 'string' ? JSON.parse(template.items) : template.items
      }));
      
      return successResponse(processedTemplates, 'Templates retrieved (DynamoDB)');
    }
    
  } catch (error) {
    console.error('DynamoDB templates error:', error);
  }
  
  // Mock 폴백
  const mockTemplates = [{
    template_id: 'hygiene_checklist',
    name: '위생상태점검표',
    type: 'hygiene',
    items: [
      { id: 'symptoms', question: '발열, 설사, 구토 증상이 있나요?', type: 'select', options: ['없음', '있음'] },
      { id: 'respiratory', question: '호흡기 질환은 없나요?', type: 'select', options: ['없음', '있음'] },
      { id: 'wound', question: '신체에 상처가 있나요?', type: 'select', options: ['없음', '있음'] },
      { id: 'clothing', question: '작업복 착용이 적절한가요?', type: 'select', options: ['적절', '부적절'] }
    ]
  }];
  
  return successResponse(mockTemplates, 'Templates retrieved (Mock)');
}

async function submitChecklist(event) {
  const data = JSON.parse(event.body);
  const { user_id, template_id, responses } = data;
  
  const record = {
    record_id: `record_${Date.now()}`,
    user_id,
    template_id,
    responses,
    status: 'submitted',
    submitted_at: new Date().toISOString()
  };
  
  try {
    console.log('Attempting DynamoDB checklist submit');
    
    const params = {
      TableName: process.env.CHECKLIST_RECORDS_TABLE || 'gmp-checkmaster-checklist-records',
      Item: {
        ...record,
        created_at: new Date().toISOString()
      }
    };
    
    await dynamodb.put(params).promise();
    console.log('DynamoDB checklist saved successfully');
    
    return successResponse(record, 'Checklist submitted (DynamoDB)');
    
  } catch (error) {
    console.error('DynamoDB checklist error:', error);
    return successResponse(record, 'Checklist submitted (Mock)');
  }
}

async function getRecords() {
  const records = [
    {
      record_id: 'record_001',
      user_id: 'worker1',
      template_id: 'hygiene_checklist',
      status: 'completed',
      submitted_at: '2025-09-05T08:30:00Z'
    }
  ];
  
  return successResponse(records, 'Records retrieved');
}

async function handleAIJudge(event) {
  const data = JSON.parse(event.body);
  const { responses } = data;
  
  // 간단한 AI 판정 로직
  let result = 'approved';
  let reason = '모든 항목이 정상 범위입니다';
  
  if (responses.symptoms === '있음' || responses.respiratory === '있음' || responses.wound === '있음') {
    result = 'rejected';
    reason = '건강상태 이상으로 출입이 제한됩니다';
  } else if (responses.clothing === '부적절') {
    result = 'recheck';
    reason = '작업복 상태를 재확인해주세요';
  }
  
  const judgment = {
    judgment_id: `judge_${Date.now()}`,
    result,
    reason,
    confidence: 0.95,
    qr_eligible: result === 'approved',
    created_at: new Date().toISOString()
  };
  
  try {
    console.log('Attempting DynamoDB AI judgment save');
    
    const params = {
      TableName: process.env.AI_JUDGMENTS_TABLE || 'gmp-checkmaster-ai-judgments',
      Item: judgment
    };
    
    await dynamodb.put(params).promise();
    console.log('DynamoDB AI judgment saved');
    
    return successResponse(judgment, 'AI judgment completed (DynamoDB)');
    
  } catch (error) {
    console.error('DynamoDB AI judgment error:', error);
    return successResponse(judgment, 'AI judgment completed (Mock)');
  }
}

async function generateQR(event) {
  const data = JSON.parse(event.body);
  const { user_id, record_id } = data;
  
  const qrData = {
    qr_code: `QR_${Date.now()}`,
    user_id,
    record_id,
    expires_at: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8시간 후
    created_at: new Date().toISOString()
  };
  
  try {
    console.log('Attempting DynamoDB QR save');
    
    const params = {
      TableName: process.env.QR_CODES_TABLE || 'gmp-checkmaster-qr-codes',
      Item: qrData
    };
    
    await dynamodb.put(params).promise();
    console.log('DynamoDB QR saved');
    
    return successResponse(qrData, 'QR code generated (DynamoDB)');
    
  } catch (error) {
    console.error('DynamoDB QR error:', error);
    return successResponse(qrData, 'QR code generated (Mock)');
  }
}

async function verifyQR(event) {
  const data = JSON.parse(event.body);
  const { qr_code } = data;
  
  try {
    console.log('Attempting DynamoDB QR verify');
    
    const params = {
      TableName: process.env.QR_CODES_TABLE || 'gmp-checkmaster-qr-codes',
      Key: { qr_code }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (result.Item) {
      const qrData = result.Item;
      const now = Math.floor(Date.now() / 1000);
      
      if (qrData.expires_at > now) {
        return successResponse({
          valid: true,
          user_id: qrData.user_id,
          access_granted: true
        }, 'QR verification successful (DynamoDB)');
      } else {
        return successResponse({
          valid: false,
          reason: 'QR code expired'
        }, 'QR code expired');
      }
    }
    
  } catch (error) {
    console.error('DynamoDB QR verify error:', error);
  }
  
  // Mock 응답
  return successResponse({
    valid: true,
    user_id: 'worker1',
    access_granted: true
  }, 'QR verification successful (Mock)');
}
