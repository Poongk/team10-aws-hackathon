const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  // CORS 처리
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders
    };
  }
  
  try {
    const path = event.path;
    const method = event.httpMethod;
    
    // 로그인 API
    if (path === '/auth/login' && method === 'POST') {
      const data = JSON.parse(event.body);
      const { user_id, password } = data;
      
      console.log('Login attempt for:', user_id);
      
      // DynamoDB 조회
      try {
        const params = {
          TableName: 'gmp-checkmaster-users',
          Key: { user_id: user_id }
        };
        
        const result = await dynamodb.get(params).promise();
        console.log('DynamoDB result:', JSON.stringify(result, null, 2));
        
        if (result.Item && password === 'demo123') {
          const user = result.Item;
          const token = `demo-jwt-${user_id}-${Date.now()}`;
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              data: {
                token,
                user: {
                  id: user.user_id,
                  name: user.name,
                  role: user.role,
                  team: user.team
                },
                expires_in: 28800
              },
              message: 'Login successful (DynamoDB)',
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
            data: {
              token,
              user: mockUser,
              expires_in: 28800
            },
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
      console.log('Getting templates');
      
      // DynamoDB 조회
      try {
        const params = {
          TableName: 'gmp-checkmaster-checklist-templates'
        };
        
        const result = await dynamodb.scan(params).promise();
        console.log('Templates result:', JSON.stringify(result, null, 2));
        
        if (result.Items && result.Items.length > 0) {
          const processedTemplates = result.Items.map(template => ({
            ...template,
            items: typeof template.items === 'string' ? JSON.parse(template.items) : template.items
          }));
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
              success: true,
              data: processedTemplates,
              message: 'Templates retrieved (DynamoDB)',
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
        result,
        reason,
        confidence: 0.95,
        qr_eligible: result === 'approved'
      };
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: judgment,
          message: 'AI judgment completed',
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
