// DynamoDB 유틸리티 (Lambda 런타임에서 사용)
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// 환경변수에서 테이블명 가져오기
const TABLES = {
  USERS: process.env.USERS_TABLE,
  CHECKLIST_TEMPLATES: process.env.CHECKLIST_TEMPLATES_TABLE,
  CHECKLIST_RECORDS: process.env.CHECKLIST_RECORDS_TABLE,
  AI_JUDGMENTS: process.env.AI_JUDGMENTS_TABLE,
  QR_CODES: process.env.QR_CODES_TABLE
};

// 사용자 조회
async function getUser(userId) {
  const params = {
    TableName: TABLES.USERS,
    Key: { user_id: userId }
  };
  
  const result = await dynamodb.get(params).promise();
  return result.Item;
}

// 체크리스트 템플릿 조회
async function getChecklistTemplates() {
  const params = {
    TableName: TABLES.CHECKLIST_TEMPLATES
  };
  
  const result = await dynamodb.scan(params).promise();
  return result.Items;
}

// 체크리스트 기록 저장
async function saveChecklistRecord(record) {
  const params = {
    TableName: TABLES.CHECKLIST_RECORDS,
    Item: {
      ...record,
      created_at: new Date().toISOString()
    }
  };
  
  await dynamodb.put(params).promise();
  return record;
}

// AI 판정 결과 저장
async function saveAIJudgment(judgment) {
  const params = {
    TableName: TABLES.AI_JUDGMENTS,
    Item: {
      ...judgment,
      created_at: new Date().toISOString()
    }
  };
  
  await dynamodb.put(params).promise();
  return judgment;
}

// QR 코드 저장
async function saveQRCode(qrData) {
  const params = {
    TableName: TABLES.QR_CODES,
    Item: {
      ...qrData,
      created_at: new Date().toISOString(),
      expires_at: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8시간 후 만료
    }
  };
  
  await dynamodb.put(params).promise();
  return qrData;
}

// QR 코드 검증
async function verifyQRCode(qrCode) {
  const params = {
    TableName: TABLES.QR_CODES,
    Key: { qr_code: qrCode }
  };
  
  const result = await dynamodb.get(params).promise();
  return result.Item;
}

module.exports = {
  getUser,
  getChecklistTemplates,
  saveChecklistRecord,
  saveAIJudgment,
  saveQRCode,
  verifyQRCode,
  TABLES
};
