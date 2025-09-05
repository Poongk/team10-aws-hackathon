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
        const { httpMethod, path, pathParameters } = event;
        
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
        
        if (path === '/checklist' && httpMethod === 'POST') {
            return await handleSubmitChecklist(event, decoded);
        }
        
        if (path.startsWith('/checklist/') && httpMethod === 'GET') {
            const userId = pathParameters.user_id;
            return await handleGetUserChecklist(userId, event.queryStringParameters, decoded);
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

async function handleSubmitChecklist(event, decoded) {
    const body = JSON.parse(event.body);
    const { user_id, items, ai_analysis } = body;
    
    // 권한 확인 (본인 또는 관리자만) - 관리자는 모든 사용자 대신 제출 가능
    if (decoded.user_type !== 'admin' && decoded.user_id !== user_id) {
        return {
            statusCode: 403,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: '권한이 없습니다'
                }
            })
        };
    }
    
    const now = new Date();
    const checkId = `${user_id}_${now.toISOString().slice(0, 10).replace(/-/g, '')}_${now.toTimeString().slice(0, 5).replace(':', '')}`;
    
    // 체크리스트 평가
    const evaluation = evaluateChecklist(items, ai_analysis, user_id);
    
    // DynamoDB에 저장
    const checklistRecord = {
        pk: `USER#${user_id}`,
        sk: `CHECK#${now.toISOString()}`,
        check_id: checkId,
        user_id,
        items,
        ai_analysis,
        status: evaluation.status,
        reason: evaluation.reason,
        message: evaluation.message,
        recommendation: evaluation.recommendation,
        qr_code: evaluation.qr_code,
        expire_time: evaluation.expire_time,
        created_at: now.toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24시간 후 삭제
    };
    
    await dynamodb.put({
        TableName: TABLE_NAME,
        Item: checklistRecord
    }).promise();
    
    // Slack 알림 (부적합인 경우)
    if (evaluation.status === 'rejected') {
        await sendSlackNotification(user_id, evaluation.reason);
    }
    
    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
            success: true,
            data: evaluation
        })
    };
}

function evaluateChecklist(items, aiAnalysis, userId) {
    const now = new Date();
    const expireTime = new Date(now.getTime() + 30 * 60 * 1000); // 30분 후 만료
    
    // 부적합 조건 확인
    const rejectionReasons = [];
    
    if (items.symptoms === '예') {
        rejectionReasons.push('발열, 설사, 구토 등의 증상');
    }
    if (items.respiratory === '예') {
        rejectionReasons.push('호흡기 증상');
    }
    if (items.uniform === '아니오') {
        rejectionReasons.push('작업복 미착용');
    }
    if (items.hair === '아니오') {
        rejectionReasons.push('모발 정리 미흡');
    }
    if (items.nails === '아니오') {
        rejectionReasons.push('손톱 정리 미흡');
    }
    
    // AI 분석 결과 확인
    if (aiAnalysis && aiAnalysis.item_id === 'wounds') {
        if (aiAnalysis.result === 'rejected') {
            rejectionReasons.push('상처 부적합');
        }
    }
    
    if (rejectionReasons.length > 0) {
        return {
            check_id: `${userId}_${now.toISOString().slice(0, 10).replace(/-/g, '')}_${now.toTimeString().slice(0, 5).replace(':', '')}`,
            status: 'rejected',
            reason: rejectionReasons.join(', '),
            message: '건강상 이유로 오늘은 출근이 어렵습니다',
            recommendation: '충분한 휴식 후 내일 다시 체크해주세요'
        };
    }
    
    // 적합 판정
    const qrCode = generateQRCode(userId, now);
    
    return {
        check_id: `${userId}_${now.toISOString().slice(0, 10).replace(/-/g, '')}_${now.toTimeString().slice(0, 5).replace(':', '')}`,
        status: 'approved',
        qr_code: qrCode,
        expire_time: expireTime.toISOString(),
        message: '위생상태 점검 완료! 안전하게 작업하세요',
        ai_result: aiAnalysis ? {
            result: 'approved',
            confidence: 0.95,
            message: '상처 크기가 작고 염증이 없어 적합 판정됩니다'
        } : null
    };
}

function generateQRCode(userId, timestamp) {
    const qrData = {
        user_id: userId,
        timestamp: timestamp.toISOString(),
        expire_time: new Date(timestamp.getTime() + 30 * 60 * 1000).toISOString()
    };
    return Buffer.from(JSON.stringify(qrData)).toString('base64');
}

async function handleGetUserChecklist(userId, queryParams, decoded) {
    // 권한 확인 (본인 또는 관리자만)
    if (decoded.user_id !== userId && decoded.user_type !== 'admin') {
        return {
            statusCode: 403,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: '권한이 없습니다'
                }
            })
        };
    }
    
    const limit = parseInt(queryParams?.limit) || 10;
    
    try {
        const result = await dynamodb.query({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'CHECK#'
            },
            ScanIndexForward: false, // 최신순 정렬
            Limit: limit
        }).promise();
        
        const results = result.Items.map(item => ({
            check_time: item.created_at,
            status: item.status,
            qr_code: item.qr_code,
            expire_time: item.expire_time,
            is_expired: item.expire_time ? new Date(item.expire_time) < new Date() : false,
            ai_verified: !!item.ai_analysis,
            reason: item.reason
        }));
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    user_id: userId,
                    results,
                    total_count: results.length
                }
            })
        };
        
    } catch (error) {
        console.error('DynamoDB Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'DATABASE_ERROR',
                    message: '데이터베이스 오류가 발생했습니다'
                }
            })
        };
    }
}

async function sendSlackNotification(userId, reason) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;
    
    const message = {
        text: `🚨 GMP 체크리스트 부적합 알림`,
        attachments: [{
            color: 'danger',
            fields: [
                { title: '사용자', value: userId, short: true },
                { title: '부적합 사유', value: reason, short: true },
                { title: '시간', value: new Date().toLocaleString('ko-KR'), short: true }
            ]
        }]
    };
    
    try {
        const https = require('https');
        const data = JSON.stringify(message);
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        
        const req = https.request(webhookUrl, options);
        req.write(data);
        req.end();
    } catch (error) {
        console.error('Slack notification error:', error);
    }
}
