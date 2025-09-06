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
    try {
        const body = JSON.parse(event.body || '{}');
        const { user_id, user_name, action, result, qr_data, scanner_id } = body;
        
        // 필수 필드 검증
        const missingFields = [];
        if (!user_id) missingFields.push('user_id');
        if (!user_name) missingFields.push('user_name');
        if (!action) missingFields.push('action');
        if (!result) missingFields.push('result');
        
        if (missingFields.length > 0) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'MISSING_DATA',
                        message: `필수 데이터가 누락되었습니다: ${missingFields.join(', ')}`
                    }
                })
            };
        }
        
        // action, result 값 검증
        if (!['entry', 'exit'].includes(action)) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'INVALID_ACTION',
                        message: 'action은 entry 또는 exit만 가능합니다'
                    }
                })
            };
        }
        
        if (!['success', 'failed'].includes(result)) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'INVALID_RESULT',
                        message: 'result는 success 또는 failed만 가능합니다'
                    }
                })
            };
        }
        
        const now = new Date();
        const logId = `ACCESS_${now.toISOString().replace(/[-:.]/g, '').slice(0, 15)}_${user_id}`;
        
        const logRecord = {
            record_id: logId,
            user_id: user_id,
            created_date: now.toISOString().slice(0, 10),
            timestamp: now.toISOString(),
            user_name: user_name,
            action: action,
            result: result,
            qr_data: qr_data || null,
            scanner_id: scanner_id || 'DEFAULT',
            log_type: 'ACCESS_LOG',
            ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
        };
        
        console.log('Creating log record:', JSON.stringify(logRecord, null, 2));
        
        await dynamodb.put({
            TableName: TABLE_NAME || 'gmp-checkmaster-checklist-records',
            Item: logRecord
        }).promise();
        
        console.log('Log record created successfully:', logId);
        
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
        console.error('Error in handleCreateLog:', error);
        
        if (error instanceof SyntaxError) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'INVALID_JSON',
                        message: 'JSON 형식이 올바르지 않습니다'
                    }
                })
            };
        }
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: `데이터베이스 오류: ${error.message}`
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
        const result = await dynamodb.scan({
            TableName: TABLE_NAME,
            FilterExpression: 'log_type = :log_type AND created_date = :date',
            ExpressionAttributeValues: {
                ':log_type': 'ACCESS_LOG',
                ':date': date
            },
            Limit: limit
        }).promise();
        
        const logs = result.Items.map(item => ({
            timestamp: item.timestamp,
            user_id: item.user_id,
            user_name: item.user_name,
            action: item.action,
            result: item.result,
            scanner_id: item.scanner_id,
            log_id: item.record_id
        }));
        
        // 최신순 정렬
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
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
