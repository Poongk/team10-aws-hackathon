const { successResponse, errorResponse } = require('../shared/response-utils');
const { HYGIENE_TEMPLATE } = require('../shared/mock-data');

exports.handler = async (event) => {
  try {
    console.log('Checklist Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    // 기존 API
    if (path === '/checklists/templates' && method === 'GET') {
      return await getTemplates(event);
    }
    if (path === '/checklists/submit' && method === 'POST') {
      return await submitChecklist(event);
    }
    if (path === '/checklists/records' && method === 'GET') {
      return await getRecords(event);
    }
    
    // 추가 API
    if (path.match(/\/checklists\/records\/(.+)/) && method === 'PUT') {
      return await updateChecklist(event);
    }
    if (path === '/checklists/modification-request' && method === 'POST') {
      return await requestModification(event);
    }
    if (path === '/checklists/emergency-review' && method === 'POST') {
      return await emergencyReview(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('Checklist Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function getTemplates(event) {
  return successResponse([HYGIENE_TEMPLATE], 'Templates retrieved');
}

async function submitChecklist(event) {
  const data = JSON.parse(event.body);
  
  const record = {
    record_id: `record_${Date.now()}`,
    user_id: data.user_id,
    template_id: data.template_id,
    responses: data.responses,
    submitted_at: new Date().toISOString(),
    status: 'pending'
  };
  
  return successResponse(record, 'Checklist submitted');
}

async function getRecords(event) {
  const records = [
    {
      record_id: 'record_1',
      user_id: 'worker1',
      template_id: 'hygiene_checklist',
      status: 'approved',
      submitted_at: '2025-09-05T10:00:00Z'
    }
  ];
  
  return successResponse(records, 'Records retrieved');
}

async function updateChecklist(event) {
  const recordId = event.pathParameters.record_id;
  const data = JSON.parse(event.body);
  
  // 5분 내 수정 가능 체크 (Mock)
  const record = {
    record_id: recordId,
    status: 'updated',
    updated_at: new Date().toISOString(),
    modification_count: 1,
    ai_judgment_pending: true
  };
  
  return successResponse(record, 'Checklist updated');
}

async function requestModification(event) {
  const data = JSON.parse(event.body);
  
  const request = {
    request_id: `mod_req_${Date.now()}`,
    record_id: data.record_id,
    reason: data.reason,
    status: 'pending_approval',
    requested_at: new Date().toISOString()
  };
  
  return successResponse(request, 'Modification request submitted');
}

async function emergencyReview(event) {
  const data = JSON.parse(event.body);
  
  const review = {
    review_id: `emergency_${Date.now()}`,
    record_id: data.record_id,
    reason: data.reason,
    status: 'review_granted',
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5분 후
  };
  
  return successResponse(review, 'Emergency review granted');
}
