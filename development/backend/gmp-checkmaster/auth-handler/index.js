const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE;
const JWT_SECRET = 'gmp-checkmaster-secret-key';

// CORS 헤더
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// 사용자 데이터 (실제로는 DB에서 조회)
const users = {
    'EMP001': { name: '김철수', type: 'worker' },
    'EMP002': { name: '이영희', type: 'worker' },
    'EMP003': { name: '박민수', type: 'worker' },
    'EMP004': { name: '정수연', type: 'worker' },
    'EMP005': { name: '최수진', type: 'worker' },
    'admin': { name: '시스템 관리자', type: 'admin' }
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const { httpMethod, path } = event;
        
        // OPTIONS 요청 처리
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }
        
        const body = JSON.parse(event.body || '{}');
        
        if (path === '/auth/worker' && httpMethod === 'POST') {
            return await handleWorkerLogin(body);
        }
        
        if (path === '/auth/admin' && httpMethod === 'POST') {
            return await handleAdminLogin(body);
        }
        
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: '요청한 엔드포인트를 찾을 수 없습니다'
                }
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: '서버 내부 오류가 발생했습니다'
                }
            })
        };
    }
};

async function handleWorkerLogin(body) {
    const { employee_id } = body;
    
    if (!employee_id) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'MISSING_EMPLOYEE_ID',
                    message: '사번을 입력해주세요'
                }
            })
        };
    }
    
    const user = users[employee_id];
    if (!user || user.type !== 'worker') {
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: '등록되지 않은 사번입니다'
                }
            })
        };
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
        { user_id: employee_id, user_type: 'worker' },
        JWT_SECRET,
        { expiresIn: '8h' }
    );
    
    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
            success: true,
            data: {
                user_id: employee_id,
                name: user.name,
                user_type: 'worker',
                session_token: token
            }
        })
    };
}

async function handleAdminLogin(body) {
    const { admin_id } = body;
    
    if (!admin_id) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'MISSING_ADMIN_ID',
                    message: '관리자 ID를 입력해주세요'
                }
            })
        };
    }
    
    const user = users[admin_id];
    if (!user || user.type !== 'admin') {
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: '등록되지 않은 관리자 ID입니다'
                }
            })
        };
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
        { user_id: admin_id, user_type: 'admin' },
        JWT_SECRET,
        { expiresIn: '8h' }
    );
    
    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
            success: true,
            data: {
                user_id: admin_id,
                name: user.name,
                user_type: 'admin',
                session_token: token
            }
        })
    };
}
