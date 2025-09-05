const { successResponse, errorResponse } = require('../shared/response-utils');

exports.handler = async (event) => {
  try {
    console.log('AI Judgment Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    if (path === '/ai/judge' && method === 'POST') {
      return await judgeHealth(event);
    }
    
    if (path.match(/\/ai\/judgment\/(.+)/) && method === 'GET') {
      return await getJudgment(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('AI Judgment Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function judgeHealth(event) {
  const { responses } = JSON.parse(event.body);
  
  const judgment = judgeHealthStatus(responses);
  
  return successResponse(judgment, 'AI judgment completed');
}

async function getJudgment(event) {
  const recordId = event.pathParameters.record_id;
  
  const judgment = {
    record_id: recordId,
    judgment: {
      result: 'approved',
      confidence: 0.95,
      reason: '모든 항목이 정상 범위입니다.'
    },
    qr_code: `QR_${recordId}`,
    processed_at: new Date().toISOString()
  };
  
  return successResponse(judgment, 'Judgment retrieved');
}

function judgeHealthStatus(responses) {
  // 1. 발열/설사/구토 증상 있음 → 자동 거부
  if (responses.symptoms === '있음') {
    return {
      result: 'rejected',
      reason: '발열/설사/구토 증상으로 출입 불가',
      confidence: 1.0,
      qr_eligible: false
    };
  }
  
  // 2. 호흡기 증상 있음 → 재확인 필요
  if (responses.respiratory === '있음') {
    return {
      result: 'recheck',
      reason: '호흡기 증상으로 재확인 필요',
      confidence: 0.8,
      qr_eligible: false
    };
  }
  
  // 3. 복장/상처 부적절 → 재확인 필요
  if (responses.clothing === '부적절' || responses.wound === '있음') {
    return {
      result: 'recheck',
      reason: '복장 또는 상처로 재확인 필요',
      confidence: 0.7,
      qr_eligible: false
    };
  }
  
  // 4. 모든 항목 정상 → 출입 가능
  return {
    result: 'approved',
    reason: '모든 항목이 정상 범위입니다',
    confidence: 0.95,
    qr_eligible: true
  };
}
