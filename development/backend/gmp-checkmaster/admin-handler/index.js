const { successResponse, errorResponse } = require('../shared/response-utils');

exports.handler = async (event) => {
  try {
    console.log('Admin Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    if (path === '/admin/templates' && method === 'POST') {
      return await createTemplate(event);
    }
    
    if (path.match(/\/admin\/qr-validity\/template\/(.+)/) && method === 'PUT') {
      return await setQRValidity(event);
    }
    
    if (path === '/operator/qr-validity/daily' && method === 'PUT') {
      return await adjustDailyQRValidity(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('Admin Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function createTemplate(event) {
  const data = JSON.parse(event.body);
  
  const result = {
    template_id: `template_${Date.now()}`,
    name: data.name,
    created_at: new Date().toISOString()
  };
  
  return successResponse(result, 'Template created');
}

async function setQRValidity(event) {
  const templateId = event.pathParameters.template_id;
  const data = JSON.parse(event.body);
  
  const result = {
    template_id: templateId,
    default_expires_time: data.default_expires_time,
    updated_at: new Date().toISOString()
  };
  
  return successResponse(result, 'QR validity updated');
}

async function adjustDailyQRValidity(event) {
  const data = JSON.parse(event.body);
  
  const result = {
    adjustment_id: `adj_${Date.now()}`,
    date: data.date,
    original_time: '17:30',
    adjusted_time: data.adjusted_expires_time,
    reason: data.reason,
    affected_users: 45,
    adjusted_at: new Date().toISOString()
  };
  
  return successResponse(result, 'Daily QR validity adjusted');
}
