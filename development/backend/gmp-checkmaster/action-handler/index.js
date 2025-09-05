const { successResponse, errorResponse } = require('../shared/response-utils');

exports.handler = async (event) => {
  try {
    console.log('Action Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    if (path === '/actions/list' && method === 'GET') {
      return await getActionList(event);
    }
    
    if (path.match(/\/actions\/(.+)\/status/) && method === 'PUT') {
      return await updateActionStatus(event);
    }
    
    if (path.match(/\/actions\/(.+)\/complete/) && method === 'POST') {
      return await completeAction(event);
    }
    
    if (path.match(/\/actions\/status\/(.+)/) && method === 'GET') {
      return await getActionStatus(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('Action Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function getActionList(event) {
  const actions = [
    {
      action_id: 'action_001',
      record_id: 'record_001',
      user_id: 'worker1',
      user_name: '김작업',
      team: '생산팀A',
      status: 'pending',
      priority: 'high',
      ai_result: 'rejected',
      ai_reason: '발열 증상으로 출입 불가',
      action_reason: '발열 38.2도로 즉시 귀가 조치',
      action_content: '1. 즉시 귀가 조치\n2. 의료진 상담 후 진단서 제출\n3. 증상 완화 확인 후 재검토 예정',
      created_at: '2025-09-05T08:20:00Z',
      assigned_to: 'operator1'
    },
    {
      action_id: 'action_002',
      record_id: 'record_002',
      user_id: 'worker2',
      user_name: '박작업',
      team: '생산팀B',
      status: 'in_progress',
      priority: 'medium',
      ai_result: 'recheck',
      ai_reason: '장신구 착용으로 재확인 필요',
      action_reason: '장신구 제거 후 재확인 필요',
      action_content: '장신구 제거 확인 후 출입 허용',
      created_at: '2025-09-05T08:25:00Z',
      assigned_to: 'operator1'
    }
  ];
  
  return successResponse(actions, 'Action list retrieved');
}

async function updateActionStatus(event) {
  const recordId = event.pathParameters.record_id;
  const data = JSON.parse(event.body);
  
  const result = {
    action_id: `action_${recordId}`,
    record_id: recordId,
    old_status: 'pending',
    new_status: data.status,
    updated_by: data.updated_by || 'operator1',
    updated_at: new Date().toISOString(),
    notes: data.notes || ''
  };
  
  return successResponse(result, 'Action status updated');
}

async function completeAction(event) {
  const recordId = event.pathParameters.record_id;
  const data = JSON.parse(event.body);
  
  const result = {
    action_id: `action_${recordId}`,
    record_id: recordId,
    status: 'completed',
    completion_notes: data.completion_notes || '',
    completed_by: data.completed_by || 'operator1',
    completed_at: new Date().toISOString(),
    final_result: data.final_result || 'resolved'
  };
  
  return successResponse(result, 'Action completed successfully');
}

async function getActionStatus(event) {
  const recordId = event.pathParameters.record_id;
  
  const actionStatus = {
    action_id: `action_${recordId}`,
    record_id: recordId,
    current_status: 'in_progress',
    progress_steps: [
      {
        step: 1,
        name: '조치 시작',
        status: 'completed',
        completed_at: '2025-09-05T08:20:00Z',
        completed_by: 'operator1'
      },
      {
        step: 2,
        name: '책임자 승인',
        status: 'completed',
        completed_at: '2025-09-05T08:25:00Z',
        completed_by: 'supervisor1'
      },
      {
        step: 3,
        name: '조치 실행',
        status: 'in_progress',
        started_at: '2025-09-05T08:30:00Z',
        assigned_to: 'operator1'
      },
      {
        step: 4,
        name: '진행 상황 확인',
        status: 'pending'
      },
      {
        step: 5,
        name: '최종 완료',
        status: 'pending'
      }
    ],
    estimated_completion: '2025-09-05T17:00:00Z'
  };
  
  return successResponse(actionStatus, 'Action status retrieved');
}
