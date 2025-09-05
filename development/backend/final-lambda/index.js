const https = require('https');
const crypto = require('crypto');

// AWS 서명 생성
function createSignature(method, path, headers, payload, region, service, accessKey, secretKey) {
  const algorithm = 'AWS4-HMAC-SHA256';
  const date = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const dateStamp = date.substr(0, 8);
  
  // 정규화된 요청 생성
  const canonicalRequest = [
    method,
    path,
    '',
    Object.keys(headers).sort().map(key => `${key.toLowerCase()}:${headers[key]}`).join('\n') + '\n',
    Object.keys(headers).sort().map(key => key.toLowerCase()).join(';'),
    crypto.createHash('sha256').update(payload).digest('hex')
  ].join('\n');
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    date,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');
  
  const signingKey = ['AWS4' + secretKey, dateStamp, region, service, 'aws4_request']
    .reduce((key, data) => crypto.createHmac('sha256', key).update(data).digest());
  
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  
  return `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${Object.keys(headers).sort().map(k => k.toLowerCase()).join(';')}, Signature=${signature}`;
}

// DynamoDB API 호출
async function callDynamoDB(operation, payload) {
  return new Promise((resolve, reject) => {
    const region = 'us-east-1';
    const service = 'dynamodb';
    const host = `dynamodb.${region}.amazonaws.com`;
    const path = '/';
    
    const headers = {
      'Content-Type': 'application/x-amz-json-1.0',
      'X-Amz-Target': `DynamoDB_20120810.${operation}`,
      'Host': host,
      'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '')
    };
    
    const payloadStr = JSON.stringify(payload);
    
    // 환경변수에서 AWS 자격증명 가져오기 (Lambda에서 자동 제공)
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const sessionToken = process.env.AWS_SESSION_TOKEN;
    
    if (sessionToken) {
      headers['X-Amz-Security-Token'] = sessionToken;
    }
    
    headers['Authorization'] = createSignature('POST', path, headers, payloadStr, region, service, accessKey, secretKey);
    
    const options = {
      hostname: host,
      port: 443,
      path: path,
      method: 'POST',
      headers: headers
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(payloadStr);
    req.end();
  });
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders };
  }
  
  try {
    const path = event.path;
    const method = event.httpMethod;
    
    // 로그인 API - DynamoDB 직접 호출
    if (path === '/auth/login' && method === 'POST') {
      const data = JSON.parse(event.body);
      const { user_id, password } = data;
      
      console.log('Login attempt for:', user_id);
      
      try {
        // DynamoDB GetItem 직접 호출
        const result = await callDynamoDB('GetItem', {
          TableName: 'gmp-checkmaster-users',
          Key: {
            user_id: { S: user_id }
          }
        });
        
        console.log('DynamoDB result:', JSON.stringify(result, null, 2));
        
        if (result.Item && password === 'demo123') {
          const user = {
            id: result.Item.user_id.S,
            name: result.Item.name.S,
            role: result.Item.role.S,
            team: result.Item.team.S
          };
          
          const token = `demo-jwt-${user_id}-${Date.now()}`;
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              data: { token, user, expires_in: 28800 },
              message: 'Login successful (DynamoDB Direct)',
              timestamp: new Date().toISOString()
            })
          };
        }
      } catch (dbError) {
        console.error('DynamoDB error:', dbError);
      }
      
      // Mock 폴백
      const mockUsers = {
        'worker1': { id: 'worker1', name: '김작업', role: 'worker', team: '생산팀A' },
        'operator1': { id: 'operator1', name: '박운영', role: 'operator', team: '운영팀' }
      };
      
      const mockUser = mockUsers[user_id];
      if (mockUser && password === 'demo123') {
        const token = `demo-jwt-${user_id}-${Date.now()}`;
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: { token, user: mockUser, expires_in: 28800 },
            message: 'Login successful (Mock)',
            timestamp: new Date().toISOString()
          })
        };
      }
      
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Invalid credentials',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 체크리스트 템플릿 API
    if (path === '/checklists/templates' && method === 'GET') {
      try {
        const result = await callDynamoDB('Scan', {
          TableName: 'gmp-checkmaster-checklist-templates'
        });
        
        console.log('Templates result:', JSON.stringify(result, null, 2));
        
        if (result.Items && result.Items.length > 0) {
          const templates = result.Items.map(item => ({
            template_id: item.template_id.S,
            name: item.name.S,
            type: item.type.S,
            items: JSON.parse(item.items.S)
          }));
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              data: templates,
              message: 'Templates retrieved (DynamoDB Direct)',
              timestamp: new Date().toISOString()
            })
          };
        }
      } catch (dbError) {
        console.error('DynamoDB templates error:', dbError);
      }
      
      // Mock 폴백
      const mockTemplates = [{
        template_id: 'hygiene_checklist',
        name: '위생상태점검표',
        type: 'hygiene',
        items: [
          { id: 'symptoms', question: '발열, 설사, 구토 증상이 있나요?', type: 'select', options: ['없음', '있음'] },
          { id: 'respiratory', question: '호흡기 질환은 없나요?', type: 'select', options: ['없음', '있음'] },
          { id: 'wound', question: '신체에 상처가 있나요?', type: 'select', options: ['없음', '있음'] },
          { id: 'clothing', question: '작업복 착용이 적절한가요?', type: 'select', options: ['적절', '부적절'] }
        ]
      }];
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockTemplates,
          message: 'Templates retrieved (Mock)',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 체크리스트 제출 API
    if (path === '/checklists/submit' && method === 'POST') {
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
        await callDynamoDB('PutItem', {
          TableName: 'gmp-checkmaster-checklist-records',
          Item: {
            record_id: { S: record.record_id },
            user_id: { S: record.user_id },
            template_id: { S: record.template_id },
            responses: { S: JSON.stringify(record.responses) },
            status: { S: record.status },
            submitted_at: { S: record.submitted_at },
            created_at: { S: new Date().toISOString() }
          }
        });
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: record,
            message: 'Checklist submitted (DynamoDB Direct)',
            timestamp: new Date().toISOString()
          })
        };
      } catch (dbError) {
        console.error('DynamoDB submit error:', dbError);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: record,
            message: 'Checklist submitted (Mock)',
            timestamp: new Date().toISOString()
          })
        };
      }
    }
    
    // AI 판정 API
    if (path === '/ai/judge' && method === 'POST') {
      const data = JSON.parse(event.body);
      const { responses } = data;
      
      let result = 'approved';
      let reason = '모든 항목이 정상 범위입니다';
      
      if (responses.symptoms === '있음' || responses.respiratory === '있음' || responses.wound === '있음') {
        result = 'rejected';
        reason = '건강상태 이상으로 출입이 제한됩니다';
      }
      
      const judgment = {
        judgment_id: `judge_${Date.now()}`,
        result,
        reason,
        confidence: 0.95,
        qr_eligible: result === 'approved',
        created_at: new Date().toISOString()
      };
      
      try {
        await callDynamoDB('PutItem', {
          TableName: 'gmp-checkmaster-ai-judgments',
          Item: {
            judgment_id: { S: judgment.judgment_id },
            result: { S: judgment.result },
            reason: { S: judgment.reason },
            confidence: { N: judgment.confidence.toString() },
            qr_eligible: { BOOL: judgment.qr_eligible },
            created_at: { S: judgment.created_at }
          }
        });
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: judgment,
            message: 'AI judgment completed (DynamoDB Direct)',
            timestamp: new Date().toISOString()
          })
        };
      } catch (dbError) {
        console.error('DynamoDB AI error:', dbError);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: judgment,
            message: 'AI judgment completed (Mock)',
            timestamp: new Date().toISOString()
          })
        };
      }
    }
    
    // 알림 전송 API
    if (path === '/notifications/send' && method === 'POST') {
      const data = JSON.parse(event.body);
      const { user_id, message, type, priority } = data;
      
      const notification = {
        notification_id: `notif_${Date.now()}`,
        user_id,
        message,
        type: type || 'info',
        priority: priority || 'normal',
        status: 'sent',
        created_at: new Date().toISOString(),
        read: false
      };
      
      try {
        // DynamoDB에 알림 저장 (실제로는 별도 테이블 필요하지만 임시로 AI 테이블 사용)
        await callDynamoDB('PutItem', {
          TableName: 'gmp-checkmaster-ai-judgments',
          Item: {
            judgment_id: { S: notification.notification_id },
            result: { S: 'notification' },
            reason: { S: notification.message },
            confidence: { N: '1.0' },
            qr_eligible: { BOOL: false },
            created_at: { S: notification.created_at }
          }
        });
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: notification,
            message: 'Notification sent successfully (DynamoDB Direct)',
            timestamp: new Date().toISOString()
          })
        };
      } catch (dbError) {
        console.error('DynamoDB notification error:', dbError);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: notification,
            message: 'Notification sent successfully (Mock)',
            timestamp: new Date().toISOString()
          })
        };
      }
    }
    
    // 알림 조회 API
    if (path === '/notifications' && method === 'GET') {
      const mockNotifications = [
        {
          notification_id: 'notif_001',
          user_id: 'worker1',
          message: '체크리스트 제출이 완료되었습니다.',
          type: 'success',
          priority: 'normal',
          status: 'sent',
          read: false,
          created_at: '2025-09-05T14:00:00Z'
        },
        {
          notification_id: 'notif_002',
          user_id: 'worker1',
          message: 'AI 판정 결과: 출입 승인되었습니다.',
          type: 'info',
          priority: 'high',
          status: 'sent',
          read: false,
          created_at: '2025-09-05T14:05:00Z'
        }
      ];
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockNotifications,
          message: 'Notifications retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 알림 읽음 처리 API
    if (path.match(/\/notifications\/(.+)\/read/) && method === 'PUT') {
      const notificationId = path.split('/')[2];
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            notification_id: notificationId,
            read: true,
            read_at: new Date().toISOString()
          },
          message: 'Notification marked as read',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // QR 코드 생성 API
    if (path === '/qr/generate' && method === 'POST') {
      const data = JSON.parse(event.body);
      const { user_id, record_id } = data;
      
      const qrData = {
        qr_code: `QR_${Date.now()}`,
        user_id,
        record_id,
        expires_at: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8시간 후
        created_at: new Date().toISOString()
      };
      
      try {
        await callDynamoDB('PutItem', {
          TableName: 'gmp-checkmaster-qr-codes',
          Item: {
            qr_code: { S: qrData.qr_code },
            user_id: { S: qrData.user_id },
            record_id: { S: qrData.record_id || '' },
            expires_at: { N: qrData.expires_at.toString() },
            created_at: { S: qrData.created_at }
          }
        });
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: qrData,
            message: 'QR code generated (DynamoDB Direct)',
            timestamp: new Date().toISOString()
          })
        };
      } catch (dbError) {
        console.error('DynamoDB QR error:', dbError);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: qrData,
            message: 'QR code generated (Mock)',
            timestamp: new Date().toISOString()
          })
        };
      }
    }
    
    // QR 코드 검증 API
    if (path === '/qr/verify' && method === 'POST') {
      const data = JSON.parse(event.body);
      const { qr_code } = data;
      
      try {
        const result = await callDynamoDB('GetItem', {
          TableName: 'gmp-checkmaster-qr-codes',
          Key: {
            qr_code: { S: qr_code }
          }
        });
        
        if (result.Item) {
          const qrData = {
            qr_code: result.Item.qr_code.S,
            user_id: result.Item.user_id.S,
            expires_at: parseInt(result.Item.expires_at.N)
          };
          
          const now = Math.floor(Date.now() / 1000);
          
          if (qrData.expires_at > now) {
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                success: true,
                data: {
                  valid: true,
                  user_id: qrData.user_id,
                  access_granted: true
                },
                message: 'QR verification successful (DynamoDB Direct)',
                timestamp: new Date().toISOString()
              })
            };
          } else {
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                success: true,
                data: {
                  valid: false,
                  reason: 'QR code expired'
                },
                message: 'QR code expired',
                timestamp: new Date().toISOString()
              })
            };
          }
        }
      } catch (dbError) {
        console.error('DynamoDB QR verify error:', dbError);
      }
      
      // Mock 응답
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            valid: true,
            user_id: 'worker1',
            access_granted: true
          },
          message: 'QR verification successful (Mock)',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // === 인증 API 추가 ===
    
    // 로그아웃 API
    if (path === '/auth/logout' && method === 'POST') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: { message: 'Logged out successfully' },
          message: 'Logout successful',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 토큰 검증 API
    if (path === '/auth/verify' && method === 'GET') {
      const token = event.headers.Authorization || event.headers.authorization;
      
      if (!token) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            message: 'No token provided',
            timestamp: new Date().toISOString()
          })
        };
      }
      
      if (token.startsWith('demo-jwt-')) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            success: true,
            data: { valid: true },
            message: 'Token is valid',
            timestamp: new Date().toISOString()
          })
        };
      }
      
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Invalid token',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // === 체크리스트 API 추가 ===
    
    // 체크리스트 기록 조회 API
    if (path === '/checklists/records' && method === 'GET') {
      const mockRecords = [
        {
          record_id: 'record_001',
          user_id: 'worker1',
          template_id: 'hygiene_checklist',
          status: 'completed',
          submitted_at: '2025-09-05T08:30:00Z',
          responses: { symptoms: '없음', respiratory: '없음', wound: '없음', clothing: '적절' }
        },
        {
          record_id: 'record_002',
          user_id: 'worker1',
          template_id: 'hygiene_checklist',
          status: 'pending',
          submitted_at: '2025-09-05T08:45:00Z',
          responses: { symptoms: '없음', respiratory: '없음', wound: '있음', clothing: '적절' }
        }
      ];
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockRecords,
          message: 'Records retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 체크리스트 기록 수정 API
    if (path.match(/\/checklists\/records\/(.+)/) && method === 'PUT') {
      const recordId = path.split('/')[3];
      const data = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            record_id: recordId,
            ...data,
            updated_at: new Date().toISOString()
          },
          message: 'Record updated successfully',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 수정 요청 API
    if (path === '/checklists/modification-request' && method === 'POST') {
      const data = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            request_id: `mod_req_${Date.now()}`,
            ...data,
            status: 'pending_approval',
            requested_at: new Date().toISOString()
          },
          message: 'Modification request submitted',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 긴급 재검토 요청 API
    if (path === '/checklists/emergency-review' && method === 'POST') {
      const data = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            review_id: `emr_rev_${Date.now()}`,
            ...data,
            status: 'urgent_review',
            requested_at: new Date().toISOString()
          },
          message: 'Emergency review requested',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // === AI 판정 API 추가 ===
    
    // AI 판정 결과 상세 조회 API
    if (path.match(/\/ai\/judgment\/(.+)/) && method === 'GET') {
      const judgmentId = path.split('/')[3];
      
      const mockJudgment = {
        judgment_id: judgmentId,
        result: 'approved',
        reason: '모든 항목이 정상 범위입니다',
        confidence: 0.95,
        qr_eligible: true,
        created_at: '2025-09-05T14:00:00Z',
        details: {
          symptoms_score: 1.0,
          respiratory_score: 1.0,
          wound_score: 1.0,
          clothing_score: 0.9,
          overall_score: 0.95
        }
      };
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockJudgment,
          message: 'AI judgment details retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // === 대시보드 API 추가 ===
    
    // 통계 조회 API
    if (path === '/dashboard/stats' && method === 'GET') {
      const mockStats = {
        total_submissions: 156,
        completion_rate: 94.2,
        approval_rate: 87.5,
        rejection_rate: 8.3,
        pending_rate: 4.2,
        daily_stats: [
          { date: '2025-09-01', submissions: 23, approvals: 20, rejections: 2, pending: 1 },
          { date: '2025-09-02', submissions: 28, approvals: 25, rejections: 2, pending: 1 },
          { date: '2025-09-03', submissions: 31, approvals: 27, rejections: 3, pending: 1 },
          { date: '2025-09-04', submissions: 35, approvals: 30, rejections: 3, pending: 2 },
          { date: '2025-09-05', submissions: 39, approvals: 34, rejections: 3, pending: 2 }
        ]
      };
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockStats,
          message: 'Statistics retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 리포트 조회 API
    if (path === '/dashboard/reports' && method === 'GET') {
      const mockReports = [
        {
          report_id: 'report_001',
          title: '주간 위생상태 점검 리포트',
          type: 'weekly',
          period: '2025-09-01 ~ 2025-09-07',
          generated_at: '2025-09-05T14:00:00Z',
          summary: {
            total_checks: 156,
            pass_rate: 87.5,
            major_issues: ['작업복 부적절', '개인물품 반입']
          }
        },
        {
          report_id: 'report_002',
          title: '월간 GMP 준수 현황',
          type: 'monthly',
          period: '2025-08-01 ~ 2025-08-31',
          generated_at: '2025-09-01T09:00:00Z',
          summary: {
            total_checks: 678,
            pass_rate: 89.2,
            major_issues: ['호흡기 질환', '상처 미신고']
          }
        }
      ];
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockReports,
          message: 'Reports retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 실시간 현황 조회 API
    if (path === '/dashboard/status' && method === 'GET') {
      const mockStatus = {
        current_time: new Date().toISOString(),
        active_users: 23,
        pending_reviews: 5,
        today_submissions: 39,
        system_status: 'operational',
        alerts: [
          { type: 'warning', message: '생산팀A 체크리스트 제출률 저조', count: 3 },
          { type: 'info', message: '새로운 템플릿 배포 완료', count: 1 }
        ],
        recent_activities: [
          { user: '김작업', action: '체크리스트 제출', time: '14:15:30' },
          { user: '박운영', action: 'AI 판정 완료', time: '14:12:15' },
          { user: '이책임', action: '조치 완료 처리', time: '14:08:45' }
        ]
      };
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockStatus,
          message: 'Real-time status retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 팀 현황 조회 API
    if (path.match(/\/dashboard\/team\/(.+)/) && method === 'GET') {
      const teamId = path.split('/')[3];
      
      const mockTeamStatus = {
        team_id: teamId,
        team_name: '생산팀A',
        members: [
          { user_id: 'worker1', name: '김작업', status: 'approved', last_check: '14:15:30' },
          { user_id: 'worker2', name: '이작업', status: 'pending', last_check: '14:10:15' },
          { user_id: 'worker3', name: '박작업', status: 'rejected', last_check: '14:05:45' }
        ],
        statistics: {
          total_members: 3,
          checked_today: 3,
          approval_rate: 66.7,
          pending_count: 1,
          rejection_count: 1
        }
      };
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockTeamStatus,
          message: 'Team status retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // === 배정 관리 API 추가 ===
    
    // 배정 목록 조회 API
    if (path === '/assignment/list' && method === 'GET') {
      const mockAssignments = [
        {
          assignment_id: 'assign_001',
          user_id: 'worker1',
          template_id: 'hygiene_checklist',
          assigned_by: 'supervisor1',
          assigned_at: '2025-09-05T08:00:00Z',
          due_date: '2025-09-05T17:00:00Z',
          status: 'completed'
        },
        {
          assignment_id: 'assign_002',
          user_id: 'worker1',
          template_id: 'safety_checklist',
          assigned_by: 'supervisor1',
          assigned_at: '2025-09-05T09:00:00Z',
          due_date: '2025-09-05T18:00:00Z',
          status: 'pending'
        }
      ];
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockAssignments,
          message: 'Assignments retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 새로운 배정 생성 API
    if (path === '/assignment/create' && method === 'POST') {
      const data = JSON.parse(event.body);
      
      const newAssignment = {
        assignment_id: `assign_${Date.now()}`,
        ...data,
        assigned_at: new Date().toISOString(),
        status: 'pending'
      };
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: newAssignment,
          message: 'Assignment created successfully',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // === 관리자 API 추가 ===
    
    // 템플릿 생성 API
    if (path === '/admin/templates' && method === 'POST') {
      const data = JSON.parse(event.body);
      
      const newTemplate = {
        template_id: `template_${Date.now()}`,
        ...data,
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: newTemplate,
          message: 'Template created successfully',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // QR 유효시간 설정 API (템플릿별)
    if (path.match(/\/admin\/qr-validity\/template\/(.+)/) && method === 'PUT') {
      const templateId = path.split('/')[4];
      const data = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            template_id: templateId,
            validity_hours: data.validity_hours,
            updated_at: new Date().toISOString()
          },
          message: 'QR validity updated for template',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // QR 유효시간 당일 조정 API
    if (path === '/operator/qr-validity/daily' && method === 'PUT') {
      const data = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            validity_hours: data.validity_hours,
            effective_date: data.date || new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          },
          message: 'Daily QR validity updated',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // === 조치 관리 API 추가 ===
    
    // 조치 목록 조회 API
    if (path === '/actions/list' && method === 'GET') {
      const mockActions = [
        {
          action_id: 'action_001',
          record_id: 'record_002',
          user_id: 'worker1',
          issue: '상처 발견',
          action_type: 'medical_check',
          status: 'in_progress',
          assigned_to: 'medical_staff',
          created_at: '2025-09-05T08:45:00Z',
          due_date: '2025-09-05T16:00:00Z'
        },
        {
          action_id: 'action_002',
          record_id: 'record_003',
          user_id: 'worker2',
          issue: '작업복 부적절',
          action_type: 'clothing_change',
          status: 'completed',
          assigned_to: 'supervisor1',
          created_at: '2025-09-05T09:15:00Z',
          completed_at: '2025-09-05T09:30:00Z'
        }
      ];
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockActions,
          message: 'Actions retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 조치 상태 업데이트 API
    if (path.match(/\/actions\/(.+)\/status/) && method === 'PUT') {
      const recordId = path.split('/')[2];
      const data = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            record_id: recordId,
            status: data.status,
            updated_at: new Date().toISOString(),
            updated_by: data.updated_by
          },
          message: 'Action status updated',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 조치 완료 처리 API
    if (path.match(/\/actions\/(.+)\/complete/) && method === 'POST') {
      const recordId = path.split('/')[2];
      const data = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            record_id: recordId,
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_by: data.completed_by,
            completion_notes: data.notes
          },
          message: 'Action completed successfully',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 조치 진행 상황 조회 API
    if (path.match(/\/actions\/status\/(.+)/) && method === 'GET') {
      const recordId = path.split('/')[3];
      
      const mockActionStatus = {
        record_id: recordId,
        current_status: 'in_progress',
        progress_percentage: 75,
        steps: [
          { step: 'issue_identified', status: 'completed', completed_at: '2025-09-05T08:45:00Z' },
          { step: 'action_assigned', status: 'completed', completed_at: '2025-09-05T08:50:00Z' },
          { step: 'action_in_progress', status: 'current', started_at: '2025-09-05T09:00:00Z' },
          { step: 'action_completed', status: 'pending', estimated_completion: '2025-09-05T16:00:00Z' }
        ],
        assigned_to: 'medical_staff',
        estimated_completion: '2025-09-05T16:00:00Z'
      };
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: mockActionStatus,
          message: 'Action status retrieved',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // 기본 응답
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: { message: 'API endpoint working' },
        message: 'Success',
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        message: 'Internal Server Error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
