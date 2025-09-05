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

// 사용자 이름 매핑
const userNames = {
    'EMP001': '김철수',
    'EMP002': '이영희',
    'EMP003': '박민수',
    'EMP004': '정수연',
    'EMP005': '최수진'
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
        
        if (path === '/qr/verify' && httpMethod === 'POST') {
            return await handleVerifyQR(event, decoded);
        }
        
        if (path === '/qr/expire' && httpMethod === 'PUT') {
            return await handleExpireQR(event, decoded);
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

async function handleVerifyQR(event, decoded) {
    const body = JSON.parse(event.body);
    const { qr_data, scanner_id } = body;
    
    if (!qr_data || !scanner_id) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'MISSING_DATA',
                    message: 'QR 데이터 또는 스캐너 ID가 누락되었습니다'
                }
            })
        };
    }
    
    try {
        // QR 코드 디코딩
        const qrInfo = JSON.parse(Buffer.from(qr_data, 'base64').toString());
        const { user_id, timestamp, expire_time } = qrInfo;
        
        if (!user_id || !timestamp || !expire_time) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'QR_INVALID',
                        message: '유효하지 않은 QR 코드입니다'
                    }
                })
            };
        }
        
        // 만료 시간 확인
        const now = new Date();
        const expireDate = new Date(expire_time);
        
        if (now > expireDate) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'QR_EXPIRED',
                        message: '만료된 코드입니다. 재검사 필요',
                        user_name: userNames[user_id] || user_id,
                        expired_at: expire_time
                    }
                })
            };
        }
        
        // 체크리스트 기록 확인
        const checkRecord = await findCheckRecord(user_id, timestamp);
        
        if (!checkRecord) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'QR_NOT_FOUND',
                        message: '해당 QR 코드의 체크리스트 기록을 찾을 수 없습니다'
                    }
                })
            };
        }
        
        // 출입 로그 기록
        await recordAccessLog(user_id, userNames[user_id] || user_id, 'scan_success', 'approved', qr_data, scanner_id);
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    status: 'approved',
                    user_id,
                    user_name: userNames[user_id] || user_id,
                    check_time: timestamp,
                    expire_time,
                    ai_verified: !!checkRecord.ai_analysis,
                    message: `출입 허용 - ${userNames[user_id] || user_id}님`
                }
            })
        };
        
    } catch (error) {
        console.error('QR Verification Error:', error);
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'QR_INVALID',
                    message: '유효하지 않은 QR 코드 형식입니다'
                }
            })
        };
    }
}

async function handleExpireQR(event, decoded) {
    const body = JSON.parse(event.body);
    const { user_id, check_time } = body;
    
    if (!user_id || !check_time) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'MISSING_DATA',
                    message: '사용자 ID 또는 체크 시간이 누락되었습니다'
                }
            })
        };
    }
    
    try {
        // 체크리스트 기록 찾기 및 만료 처리
        const result = await dynamodb.update({
            TableName: TABLE_NAME,
            Key: {
                pk: `USER#${user_id}`,
                sk: `CHECK#${check_time}`
            },
            UpdateExpression: 'SET expire_time = :expire_time, #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':expire_time': new Date().toISOString(),
                ':status': 'expired'
            },
            ReturnValues: 'ALL_NEW'
        }).promise();
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    message: 'QR 코드가 만료 처리되었습니다',
                    expired_at: new Date().toISOString()
                }
            })
        };
        
    } catch (error) {
        console.error('QR Expire Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'QR 코드 만료 처리 중 오류가 발생했습니다'
                }
            })
        };
    }
}

async function findCheckRecord(userId, timestamp) {
    try {
        const result = await dynamodb.query({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'CHECK#'
            },
            ScanIndexForward: false,
            Limit: 10
        }).promise();
        
        // 타임스탬프와 가장 가까운 기록 찾기
        const targetTime = new Date(timestamp);
        return result.Items.find(item => {
            const itemTime = new Date(item.created_at);
            const timeDiff = Math.abs(targetTime - itemTime);
            return timeDiff < 5 * 60 * 1000; // 5분 이내
        });
        
    } catch (error) {
        console.error('Find Check Record Error:', error);
        return null;
    }
}

async function recordAccessLog(userId, userName, action, result, qrData, scannerId) {
    const logRecord = {
        pk: `ACCESS_LOG#${new Date().toISOString().slice(0, 10)}`,
        sk: `${new Date().toISOString()}#${userId}`,
        log_id: `${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}_${userId}`,
        timestamp: new Date().toISOString(),
        user_id: userId,
        user_name: userName,
        action,
        result,
        qr_data: qrData,
        scanner_id: scannerId,
        ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30일 후 삭제
    };
    
    try {
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: logRecord
        }).promise();
    } catch (error) {
        console.error('Access Log Error:', error);
    }
}
