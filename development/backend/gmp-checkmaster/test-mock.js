// DynamoDB 모킹을 통한 로컬 테스트
process.env.DYNAMODB_TABLE = 'gmp-checkmaster-local';
process.env.NODE_ENV = 'development';

// AWS SDK 모킹
const AWS = require('aws-sdk');

// DynamoDB 모킹
const mockDynamoDB = {
    put: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
    }),
    get: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
            Item: null
        })
    }),
    query: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
            Items: []
        })
    })
};

// AWS SDK 모킹 설정
AWS.DynamoDB.DocumentClient = jest.fn(() => mockDynamoDB);

const authHandler = require('./auth-handler/index');

async function testWithoutDB() {
    console.log('🚀 DynamoDB 없이 로직 테스트 시작\n');
    
    // 1. 인증 테스트 (DynamoDB 사용 안함)
    console.log('🔐 작업자 로그인 테스트...');
    
    const loginEvent = {
        httpMethod: 'POST',
        path: '/auth/worker',
        body: JSON.stringify({
            employee_id: 'EMP001'
        })
    };
    
    try {
        const result = await authHandler.handler(loginEvent);
        console.log('✅ 로그인 성공:');
        console.log('Status:', result.statusCode);
        const response = JSON.parse(result.body);
        console.log('User:', response.data.name);
        console.log('Token:', response.data.session_token.substring(0, 50) + '...');
        
        // JWT 토큰 검증
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(response.data.session_token, 'gmp-checkmaster-secret-key');
        console.log('Decoded Token:', decoded);
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error);
    }
    
    console.log('\n✨ 테스트 완료!');
}

// Jest 없이 간단한 모킹
global.jest = {
    fn: (impl) => {
        const mockFn = impl || (() => {});
        mockFn.mockReturnValue = (value) => {
            mockFn._mockReturnValue = value;
            return mockFn;
        };
        mockFn.mockResolvedValue = (value) => {
            mockFn._mockResolvedValue = value;
            return mockFn;
        };
        return mockFn;
    }
};

testWithoutDB().catch(console.error);
