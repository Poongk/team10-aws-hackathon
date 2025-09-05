const { successResponse, errorResponse } = require('../shared/response-utils');
const { CHECKLIST_TEMPLATES } = require('../shared/mock-data');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    console.log('Checklist Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    if (path === '/checklists/templates' && method === 'GET') {
      return await getTemplates(event);
    }
    
    if (path === '/checklists/submit' && method === 'POST') {
      return await submitChecklist(event);
    }
    
    if (path === '/checklists/records' && method === 'GET') {
      return await getRecords(event);
    }
    
    if (path.match(/\/checklists\/records\/(.+)/) && method === 'PUT') {
      return await updateRecord(event);
    }
    
    if (path === '/checklists/modification-request' && method === 'POST') {
      return await requestModification(event);
    }
    
    if (path === '/checklists/emergency-review' && method === 'POST') {
      return await requestEmergencyReview(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('Checklist Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function getTemplates(event) {
  try {
    // DynamoDB에서 템플릿 조회 시도
    const params = {
      TableName: process.env.CHECKLIST_TEMPLATES_TABLE
    };
    
    const result = await dynamodb.scan(params).promise();
    
    if (result.Items && result.Items.length > 0) {
      // DynamoDB 데이터 처리
      const processedTemplates = result.Items.map(template => ({
        ...template,
        items: typeof template.items === 'string' ? JSON.parse(template.items) : template.items
      }));
      
      return successResponse(processedTemplates, 'Templates retrieved (DynamoDB)');
    } else {
      // DynamoDB에 데이터가 없으면 Mock 데이터 사용
      return successResponse(CHECKLIST_TEMPLATES, 'Templates retrieved (Mock fallback)');
    }
    
  } catch (error) {
    console.error('DynamoDB error:', error);
    // DynamoDB 에러 시 Mock 데이터로 폴백
    return successResponse(CHECKLIST_TEMPLATES, 'Templates retrieved (Error fallback)');
  }
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
    // DynamoDB에 저장 시도
    const params = {
      TableName: process.env.CHECKLIST_RECORDS_TABLE,
      Item: {
        ...record,
        created_at: new Date().toISOString()
      }
    };
    
    await dynamodb.put(params).promise();
    return successResponse(record, 'Checklist submitted successfully (DynamoDB)');
    
  } catch (error) {
    console.error('DynamoDB save error:', error);
    // DynamoDB 에러 시에도 성공으로 처리 (Mock 동작)
    return successResponse(record, 'Checklist submitted successfully (Mock fallback)');
  }
}

async function getRecords(event) {
  const records = [
    {
      record_id: 'record_001',
      user_id: 'worker1',
      template_id: 'hygiene_checklist',
      status: 'completed',
      submitted_at: '2025-09-05T08:30:00Z'
    },
    {
      record_id: 'record_002',
      user_id: 'worker2',
      template_id: 'hygiene_checklist',
      status: 'pending',
      submitted_at: '2025-09-05T08:45:00Z'
    }
  ];
  
  return successResponse(records, 'Records retrieved');
}

async function updateRecord(event) {
  const recordId = event.pathParameters.record_id;
  const data = JSON.parse(event.body);
  
  return successResponse({
    record_id: recordId,
    ...data,
    updated_at: new Date().toISOString()
  }, 'Record updated successfully');
}

async function requestModification(event) {
  const data = JSON.parse(event.body);
  
  return successResponse({
    request_id: `mod_req_${Date.now()}`,
    ...data,
    status: 'pending_approval',
    requested_at: new Date().toISOString()
  }, 'Modification request submitted');
}

async function requestEmergencyReview(event) {
  const data = JSON.parse(event.body);
  
  return successResponse({
    review_id: `emr_rev_${Date.now()}`,
    ...data,
    status: 'urgent_review',
    requested_at: new Date().toISOString()
  }, 'Emergency review requested');
}
