const { successResponse, errorResponse } = require('../shared/response-utils');

exports.handler = async (event) => {
  try {
    console.log('Assignment Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    if (path === '/assignment/list' && method === 'GET') {
      return await getAssignments(event);
    }
    
    if (path === '/assignment/create' && method === 'POST') {
      return await createAssignment(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('Assignment Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function getAssignments(event) {
  const assignments = [
    {
      assignment_id: 'assign_001',
      template_id: 'template_001',
      template_name: '위생상태점검표',
      user_id: 'worker1',
      user_name: '김작업',
      team: '생산팀A',
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        deadline: '08:20'
      },
      active: true,
      created_at: '2025-09-05T10:00:00Z'
    }
  ];
  
  return successResponse(assignments, 'Assignments retrieved');
}

async function createAssignment(event) {
  const data = JSON.parse(event.body);
  
  const result = {
    created_assignments: data.user_ids.length,
    assignment_ids: data.user_ids.map((_, i) => `assign_${Date.now()}_${i}`)
  };
  
  return successResponse(result, 'Assignments created');
}
