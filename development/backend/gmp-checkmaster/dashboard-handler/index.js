const { successResponse, errorResponse } = require('../shared/response-utils');

exports.handler = async (event) => {
  try {
    console.log('Dashboard Event:', JSON.stringify(event, null, 2));
    
    const path = event.path;
    const method = event.httpMethod;
    
    if (path === '/dashboard/stats' && method === 'GET') {
      return await getStats(event);
    }
    
    if (path === '/dashboard/reports' && method === 'GET') {
      return await getReports(event);
    }
    
    if (path === '/dashboard/status' && method === 'GET') {
      return await getStatus(event);
    }
    
    if (path.match(/\/dashboard\/team\/(.+)/) && method === 'GET') {
      return await getTeamStatus(event);
    }
    
    return errorResponse(404, 'Not Found');
    
  } catch (error) {
    console.error('Dashboard Error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

async function getStats(event) {
  const stats = {
    today: {
      total_submissions: 45,
      approved: 42,
      rejected: 2,
      pending: 1
    },
    this_week: {
      total_submissions: 315,
      approved: 298,
      rejected: 12,
      pending: 5
    },
    compliance_rate: 94.2,
    top_issues: [
      { issue: '복장 부적절', count: 8 },
      { issue: '호흡기 증상', count: 4 },
      { issue: '상처 발견', count: 2 }
    ]
  };
  
  return successResponse(stats, 'Statistics retrieved');
}

async function getReports(event) {
  const reports = [
    {
      date: '2025-09-05',
      team: '생산팀A',
      total: 15,
      approved: 14,
      rejected: 1,
      compliance_rate: 93.3
    },
    {
      date: '2025-09-04',
      team: '생산팀A',
      total: 15,
      approved: 15,
      rejected: 0,
      compliance_rate: 100.0
    }
  ];
  
  return successResponse(reports, 'Reports retrieved');
}

async function getStatus(event) {
  const status = {
    summary: {
      total_users: 50,
      completed: 45,
      pending: 3,
      failed: 2,
      completion_rate: 0.9
    },
    by_team: [
      {
        team: '생산팀A',
        total: 20,
        completed: 18,
        pending: 1,
        failed: 1,
        completion_rate: 0.9
      }
    ],
    recent_submissions: [
      {
        user_name: '김작업',
        team: '생산팀A',
        result: 'approved',
        submitted_at: '2025-09-05T18:13:00Z'
      }
    ],
    updated_at: new Date().toISOString()
  };
  
  return successResponse(status, 'Status retrieved');
}

async function getTeamStatus(event) {
  const teamId = event.pathParameters.team_id;
  
  const teamStatus = {
    team: {
      id: teamId,
      name: '생산팀A',
      supervisor: '이책임'
    },
    summary: {
      total_members: 20,
      completed: 18,
      pending: 1,
      failed: 1,
      completion_rate: 0.9
    },
    members: [
      {
        user_id: 'worker1',
        name: '김작업',
        status: 'approved',
        submitted_at: '2025-09-05T18:13:00Z',
        qr_expires_at: '2025-09-05T18:43:00Z'
      }
    ]
  };
  
  return successResponse(teamStatus, 'Team status retrieved');
}
