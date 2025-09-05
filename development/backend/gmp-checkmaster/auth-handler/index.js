const { successResponse, errorResponse } = require('../shared/response-utils');
const { DEMO_USERS } = require('../shared/mock-data');

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
  const { user_id, password } = JSON.parse(event.body);
  
  if (DEMO_USERS[user_id]) {
    return successResponse({
      token: `demo-jwt-${user_id}-${Date.now()}`,
      user: DEMO_USERS[user_id],
      expires_in: 28800
    }, 'Login successful');
  }
  
  return errorResponse(401, 'Invalid credentials');
}

async function handleLogout(event) {
  return successResponse(null, 'Logout successful');
}

async function handleVerify(event) {
  // Mock 토큰 검증
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer demo-jwt-')) {
    const userId = authHeader.split('-')[2];
    if (DEMO_USERS[userId]) {
      return successResponse({
        valid: true,
        user: DEMO_USERS[userId]
      }, 'Token verified');
    }
  }
  
  return errorResponse(401, 'Invalid token');
}
