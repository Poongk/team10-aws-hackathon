const { successResponse, errorResponse } = require('../shared/response-utils');

exports.handler = async (event) => {
  try {
    console.log('Auth Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    if (path === '/auth/login' && method === 'POST') {
      return await handleLogin(event);
    }
    
    if (path === '/auth/logout' && method === 'POST') {
      return await handleLogout(event);
    }
    
    if (path === '/auth/verify' && method === 'GET') {
      return await handleVerify(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('Auth Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function handleLogin(event) {
  const data = JSON.parse(event.body);
  const { user_id, password } = data;
  
  // DynamoDB 연동 시도
  try {
    const AWS = require('aws-sdk');
    const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
    
    console.log('Trying DynamoDB with table:', process.env.USERS_TABLE);
    
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
    console.error('DynamoDB error:', error);
  }
  
  // Mock 데이터 폴백
  console.log('Using Mock data fallback');
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

async function handleLogout(event) {
  return successResponse({ message: 'Logged out successfully' }, 'Logout successful');
}

async function handleVerify(event) {
  const token = event.headers.Authorization || event.headers.authorization;
  
  if (!token) {
    return errorResponse(401, 'No token provided');
  }
  
  if (token.startsWith('demo-jwt-')) {
    return successResponse({ valid: true }, 'Token is valid');
  }
  
  return errorResponse(401, 'Invalid token');
}
