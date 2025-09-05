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
        
        // 토큰 검증
        const token = extractToken(event);
        if (!token) {
            return unauthorizedResponse();
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (path === '/access-log' && httpMethod === 'POST') {
            return await handleCreateLog(event, decoded);
        }
        
        if (path === '/access-log' && httpMethod === 'GET') {
            return await handleGetLogs(event, decoded);
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
        if (error.name === 'JsonWebTokenError') {
            return unauthorizedResponse();
        }
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

function extractToken(event) {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

function unauthorizedResponse() {
    return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: '유효하지 않은 토큰입니다'
            }
        })
    };
}

async function handleCreateLog(event, decoded) {
    const body = JSON.parse(event.body);
    const { user_id, user_name, action, result, qr_data, scanner_id } = body;
    
    if (!user_id || !user_name || !action || !result || !scanner_id) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'MISSING_DATA',
                    message: '필수 데이터가 누락되었습니다'
                }
            })
        };
    }
    
    const now = new Date();
    const logId = `${now.toISOString().replace(/[-:]/g, '').slice(0, 15)}_${user_id}`;
    
    const logRecord = {
        pk: `ACCESS_LOG#${now.toISOString().slice(0, 10)}`,
        sk: `${now.toISOString()}#${user_id}`,
        log_id: logId,
        timestamp: now.toISOString(),
        user_id,
        user_name,
        action,
        result,
        qr_data,
        scanner_id,
        ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30일 후 삭제
    };
    
    try {
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: logRecord
        }).promise();
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    log_id: logId,
                    timestamp: now.toISOString()
                }
            })
        };
        
    } catch (error) {
        console.error('Create Log Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: '로그 기록 중 오류가 발생했습니다'
                }
            })
        };
    }
}

async function handleGetLogs(event, decoded) {
    // 관리자만 로그 조회 가능
    if (decoded.user_type !== 'admin') {
        return {
            statusCode: 403,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: '관리자만 로그를 조회할 수 있습니다'
                }
            })
        };
    }
    
    const queryParams = event.queryStringParameters || {};
    const date = queryParams.date || new Date().toISOString().slice(0, 10);
    const limit = parseInt(queryParams.limit) || 50;
    
    try {
        const result = await dynamodb.query({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: {
                ':pk': `ACCESS_LOG#${date}`
            },
            ScanIndexForward: false, // 최신순 정렬
            Limit: limit
        }).promise();
        
        const logs = result.Items.map(item => ({
            timestamp: item.timestamp,
            user_id: item.user_id,
            user_name: item.user_name,
            action: item.action,
            result: item.result,
            scanner_id: item.scanner_id
        }));
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    date,
                    logs,
                    total_count: logs.length
                }
            })
        };
        
    } catch (error) {
        console.error('Get Logs Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: '로그 조회 중 오류가 발생했습니다'
                }
            })
        };
    }
}
