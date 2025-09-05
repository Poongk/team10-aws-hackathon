const { successResponse, errorResponse } = require('../shared/response-utils');

exports.handler = async (event) => {
  try {
    console.log('Notification Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    if (path === '/notification/send' && method === 'POST') {
      return await sendNotification(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('Notification Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function sendNotification(event) {
  const data = JSON.parse(event.body);
  
  const result = {
    notification_id: `notif_${Date.now()}`,
    sent_count: data.target_users.length,
    sent_at: new Date().toISOString()
  };
  
  return successResponse(result, 'Notification sent');
}
