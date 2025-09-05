const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

// Mock 데이터 삽입
async function initializeData() {
  console.log('🚀 DynamoDB 초기 데이터 삽입 시작...');

  // 1. 사용자 데이터
  const users = [
    {
      user_id: 'worker1',
      name: '김작업',
      role: 'worker',
      team: '생산팀A',
      email: 'worker1@company.com',
      phone: '010-1111-1111',
      created_at: new Date().toISOString()
    },
    {
      user_id: 'operator1',
      name: '박운영',
      role: 'operator',
      team: '운영팀',
      email: 'operator1@company.com',
      phone: '010-2222-2222',
      created_at: new Date().toISOString()
    },
    {
      user_id: 'supervisor1',
      name: '이책임',
      role: 'supervisor',
      team: '생산팀A',
      email: 'supervisor1@company.com',
      phone: '010-3333-3333',
      created_at: new Date().toISOString()
    },
    {
      user_id: 'admin1',
      name: '최관리',
      role: 'admin',
      team: 'IT팀',
      email: 'admin1@company.com',
      phone: '010-4444-4444',
      created_at: new Date().toISOString()
    },
    {
      user_id: 'security1',
      name: '정보안',
      role: 'security',
      team: '보안팀',
      email: 'security1@company.com',
      phone: '010-5555-5555',
      created_at: new Date().toISOString()
    }
  ];

  // 2. 체크리스트 템플릿
  const template = {
    template_id: 'hygiene_checklist',
    name: '위생상태점검표',
    type: 'hygiene',
    items: [
      { id: 'symptoms', question: '발열, 설사, 구토 증상이 있나요?', type: 'select', options: ['없음', '있음'] },
      { id: 'respiratory', question: '호흡기 질환은 없나요?', type: 'select', options: ['없음', '있음'] },
      { id: 'wound', question: '신체에 상처가 있나요?', type: 'select', options: ['없음', '있음'] },
      { id: 'clothing', question: '작업복 착용이 적절한가요?', type: 'select', options: ['적절', '부적절'] },
      { id: 'accessories', question: '장신구를 제거했나요?', type: 'select', options: ['제거함', '착용중'] },
      { id: 'hair', question: '두발 상태가 적절한가요?', type: 'select', options: ['적절', '부적절'] },
      { id: 'nails', question: '손톱이 깨끗하고 짧은가요?', type: 'select', options: ['적절', '부적절'] },
      { id: 'makeup', question: '화장을 하지 않았나요?', type: 'select', options: ['안함', '함'] },
      { id: 'personal_items', question: '개인 물품을 반입하지 않았나요?', type: 'select', options: ['반입안함', '반입함'] }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    // 사용자 데이터 삽입
    for (const user of users) {
      await dynamodb.put({
        TableName: 'gmp-checkmaster-users',
        Item: user
      }).promise();
      console.log(`✅ 사용자 추가: ${user.name} (${user.user_id})`);
    }

    // 템플릿 데이터 삽입
    await dynamodb.put({
      TableName: 'gmp-checkmaster-checklist-templates',
      Item: template
    }).promise();
    console.log('✅ 체크리스트 템플릿 추가');

    console.log('🎉 초기 데이터 삽입 완료!');
  } catch (error) {
    console.error('❌ 데이터 삽입 실패:', error);
  }
}

// 실행
if (require.main === module) {
  initializeData();
}

module.exports = { initializeData };
