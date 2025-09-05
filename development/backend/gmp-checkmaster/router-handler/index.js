// API 라우터 - 모든 요청을 적절한 핸들러로 라우팅
const authHandler = require('../auth-handler/index');
const checklistHandler = require('../checklist-handler/index');
const aiHandler = require('../ai-judgment-handler/index');
const qrHandler = require('../qr-handler/index');
const dashboardHandler = require('../dashboard-handler/index');
const assignmentHandler = require('../assignment-handler/index');
const notificationHandler = require('../notification-handler/index');
const adminHandler = require('../admin-handler/index');
const actionHandler = require('../action-handler/index');

exports.handler = async (event) => {
  try {
    console.log('Router Event:', JSON.stringify(event, null, 2));
    
    const path = event.path || event.pathParameters?.proxy || '';
    
    // 경로에 따라 적절한 핸들러로 라우팅
    if (path.startsWith('/auth') || path.includes('auth')) {
      return await authHandler.handler(event);
    }
    
    if (path.startsWith('/checklists') || path.includes('checklist')) {
      return await checklistHandler.handler(event);
    }
    
    if (path.startsWith('/ai') || path.includes('ai')) {
      return await aiHandler.handler(event);
    }
    
    if (path.startsWith('/qr') || path.includes('qr')) {
      return await qrHandler.handler(event);
    }
    
    if (path.startsWith('/dashboard') || path.includes('dashboard')) {
      return await dashboardHandler.handler(event);
    }
    
    if (path.startsWith('/assignment') || path.includes('assignment')) {
      return await assignmentHandler.handler(event);
    }
    
    if (path.startsWith('/notification') || path.includes('notification')) {
      return await notificationHandler.handler(event);
    }
    
    if (path.startsWith('/admin') || path.startsWith('/operator') || path.includes('admin')) {
      return await adminHandler.handler(event);
    }
    
    if (path.startsWith('/actions') || path.includes('action')) {
      return await actionHandler.handler(event);
    }
    
    // 기본 응답
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: `Route not found: ${path}`,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Router Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal Server Error',
        timestamp: new Date().toISOString()
      })
    };
  }
};
