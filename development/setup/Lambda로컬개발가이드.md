# Lambda 로컬 개발 가이드

## 개요
AWS Lambda 함수를 로컬 환경에서 개발하고 테스트하는 방법

## 🛠️ **로컬 Lambda 개발 방법**

### 1. **SAM Local 사용 (권장)**
```bash
# SAM CLI 설치 (이미 개발환경가이드에 포함)
pip install aws-sam-cli

# 로컬에서 API Gateway + Lambda 실행
cd development/backend
sam local start-api --port 3001

# 개별 Lambda 함수 테스트
sam local invoke AuthHandler --event events/login.json
```

### 2. **프로젝트 구조**
```
development/backend/
├── template.yaml              # SAM 템플릿
├── lambda/
│   ├── auth-handler/
│   │   ├── index.js          # Lambda 함수 코드
│   │   ├── package.json      # 의존성
│   │   └── test/             # 테스트 파일
│   ├── checklist-handler/
│   ├── ai-judgment-handler/
│   ├── qr-handler/
│   └── dashboard-handler/
├── events/                   # 테스트 이벤트 JSON
│   ├── login.json
│   ├── checklist-submit.json
│   └── ai-judge.json
└── shared/                   # 공통 라이브러리
    ├── db-utils.js
    ├── auth-utils.js
    └── response-utils.js
```

### 3. **SAM 템플릿 예시**
```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: nodejs18.x
    Timeout: 30
    Environment:
      Variables:
        DYNAMODB_TABLE_PREFIX: gmp-checkmaster-local

Resources:
  AuthHandler:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: lambda/auth-handler/
      Handler: index.handler
      Events:
        LoginApi:
          Type: Api
          Properties:
            Path: /auth/login
            Method: post

  ChecklistHandler:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: lambda/checklist-handler/
      Handler: index.handler
      Events:
        GetTemplates:
          Type: Api
          Properties:
            Path: /checklists/templates
            Method: get
        SubmitChecklist:
          Type: Api
          Properties:
            Path: /checklists/submit
            Method: post
```

### 4. **로컬 DynamoDB 사용**
```bash
# DynamoDB Local 실행
docker run -p 8000:8000 amazon/dynamodb-local

# 또는 Java 버전
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
```

### 5. **Lambda 함수 예시**
```javascript
// lambda/auth-handler/index.js
const AWS = require('aws-sdk');

// 로컬 환경에서는 DynamoDB Local 사용
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'ap-northeast-2',
  endpoint: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : undefined
});

exports.handler = async (event) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const { user_id, password } = JSON.parse(event.body);
    
    // 간소화된 인증 로직 (해커톤용)
    const demoUsers = {
      'worker1': { name: '김작업', role: 'worker' },
      'operator1': { name: '박운영', role: 'operator' },
      'supervisor1': { name: '이책임', role: 'supervisor' }
    };
    
    if (demoUsers[user_id]) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          token: 'demo-jwt-token',
          user: demoUsers[user_id]
        })
      };
    }
    
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Invalid credentials'
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
};
```

### 6. **테스트 이벤트**
```json
// events/login.json
{
  "httpMethod": "POST",
  "path": "/auth/login",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"user_id\":\"worker1\",\"password\":\"demo123\"}"
}
```

### 7. **로컬 개발 스크립트**
```bash
#!/bin/bash
# scripts/dev-start.sh

echo "🚀 로컬 개발 환경 시작..."

# DynamoDB Local 시작 (백그라운드)
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local

# 테이블 생성 (초기 1회만)
node scripts/create-local-tables.js

# SAM Local API 시작
cd development/backend
sam local start-api --port 3001 --env-vars env.json

echo "✅ 로컬 환경 준비 완료!"
echo "🌐 API: http://localhost:3001"
echo "🗄️ DynamoDB: http://localhost:8000"
```

### 8. **프론트엔드 연동**
```javascript
// React 앱에서 로컬 API 사용
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : 'https://your-api-gateway-url';

// API 호출
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ user_id: 'worker1', password: 'demo123' })
});
```

## 💡 **해커톤 최적화 팁**

### **간소화 방법**
1. **DynamoDB Local 대신 메모리 사용**: 빠른 개발
   ```javascript
   // 메모리 기반 간단 저장소
   const memoryStore = {
     users: { /* 하드코딩된 사용자 데이터 */ },
     checklists: { /* 하드코딩된 체크리스트 데이터 */ }
   };
   ```

2. **하드코딩된 데이터**: 실제 DB 없이 테스트
   ```javascript
   // 실제 DB 대신 하드코딩
   const DEMO_TEMPLATES = [
     { id: 'hygiene', name: '위생상태점검표', items: [...] }
   ];
   ```

3. **CORS 모든 허용**: 개발 편의성
   ```javascript
   headers: {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': '*',
     'Access-Control-Allow-Headers': '*'
   }
   ```

4. **로그 많이 출력**: 디버깅 편의성
   ```javascript
   console.log('Request:', event);
   console.log('Processing:', data);
   console.log('Response:', result);
   ```

### **빠른 개발 워크플로우**
1. **Lambda 함수 작성** → `lambda/function-name/index.js`
2. **로컬 테스트** → `sam local invoke`
3. **API 테스트** → `sam local start-api`
4. **프론트엔드 연동** → React에서 `localhost:3001` 호출
5. **배포** → Terraform으로 AWS 배포

### **디버깅 팁**
- **CloudWatch 로그 대신**: `console.log` 많이 사용
- **에러 처리**: 모든 함수에 try-catch 추가
- **응답 형식**: 일관된 JSON 응답 구조 사용
- **CORS 문제**: 모든 응답에 CORS 헤더 추가

## 참고 자료
- `development/setup/개발환경가이드.md`
- `planning/design/architecture/API명세서.md`
- `planning/design/architecture/시스템아키텍처.md`
- AWS SAM 공식 문서: https://docs.aws.amazon.com/serverless-application-model/

---
**작성일**: 2025-09-05  
**용도**: 해커톤 Lambda 개발  
**대상**: 백엔드 개발자
