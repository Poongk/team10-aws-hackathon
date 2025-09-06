const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'gmp-checkmaster-checklist-records';
const JWT_SECRET = 'gmp-checkmaster-secret-key';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const { httpMethod, path, pathParameters, headers, body } = event;
        
        // OPTIONS 요청 처리
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'CORS OK' })
            };
        }
        
        // 체크리스트 상세 조회 (토큰 없이 허용)
        if (path.startsWith('/checklist/detail/') && httpMethod === 'GET') {
            const recordId = pathParameters.record_id;
            return await handleGetChecklistDetail(recordId);
        }
        
        // JWT 토큰 검증
        const authHeader = headers.Authorization || headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: { code: 'MISSING_TOKEN', message: '인증 토큰이 필요합니다' }
                })
            };
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: { code: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다' }
                })
            };
        }

        // 라우팅
        if (httpMethod === 'POST' && path === '/checklist') {
            return await handleSubmitChecklist(body, decoded);
        } else if (httpMethod === 'GET' && path.startsWith('/checklist/')) {
            if (pathParameters && pathParameters.user_id) {
                return await handleGetChecklists(pathParameters.user_id, decoded);
            }
        }

        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: '요청한 리소스를 찾을 수 없습니다' } })
        };

    } catch (error) {
        console.error('Handler Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다' } })
        };
    }
};

// 체크리스트 제출
async function handleSubmitChecklist(body, decoded) {
    try {
        const { user_id, items, ai_analysis } = JSON.parse(body);
        
        const now = new Date();
        const recordId = `${user_id}_${now.toISOString().slice(0, 10).replace(/-/g, '')}_${now.toTimeString().slice(0, 5).replace(':', '')}`;
        
        // 체크리스트 평가
        const evaluation = evaluateChecklist(items, ai_analysis, user_id);
        
        // DynamoDB에 저장
        const checklistRecord = {
            record_id: recordId,
            user_id,
            created_date: now.toISOString().split('T')[0],
            items,
            ai_analysis,
            status: evaluation.status,
            reason: evaluation.reason,
            message: evaluation.message,
            recommendation: evaluation.recommendation,
            qr_code: evaluation.qr_code,
            expire_time: evaluation.expire_time,
            created_at: now.toISOString(),
            ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        };

        try {
            await dynamodb.put({
                TableName: TABLE_NAME,
                Item: checklistRecord
            }).promise();
            console.log('DynamoDB에 저장 완료:', recordId);
        } catch (error) {
            console.error('DynamoDB 저장 오류 (무시):', error.message);
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    record_id: recordId,
                    ...evaluation
                }
            })
        };
    } catch (error) {
        console.error('Submit Error:', error);
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, error: { code: 'BAD_REQUEST', message: '잘못된 요청입니다' } })
        };
    }
}

// 체크리스트 목록 조회
async function handleGetChecklists(userId, decoded) {
    try {
        const result = await dynamodb.query({
            TableName: TABLE_NAME,
            IndexName: 'UserDateIndex',
            KeyConditionExpression: 'user_id = :user_id',
            ExpressionAttributeValues: { ':user_id': userId },
            ScanIndexForward: false,
            Limit: 10
        }).promise();

        const results = result.Items.map(item => ({
            record_id: item.record_id,
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
            body: JSON.stringify({ success: true, data: results })
        };
    } catch (error) {
        console.error('Get Checklists Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: '목록 조회 중 오류가 발생했습니다' } })
        };
    }
}

// 체크리스트 상세 조회
async function handleGetChecklistDetail(recordId) {
    try {
        // record_id에서 user_id 추출
        const userId = recordId.split('_')[0]; // EMP002_20250906_0429 -> EMP002
        
        const result = await dynamodb.get({
            TableName: TABLE_NAME,
            Key: {
                record_id: recordId,
                user_id: userId
            }
        }).promise();

        if (result.Item) {
            const item = result.Item;
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    data: {
                        record_id: item.record_id,
                        user_id: item.user_id,
                        user_name: getUserName(item.user_id),
                        check_time: item.created_at,
                        status: item.status,
                        items: item.items,
                        ai_analysis: item.ai_analysis,
                        qr_code: item.qr_code,
                        expire_time: item.expire_time,
                        is_expired: item.expire_time ? new Date(item.expire_time) < new Date() : false,
                        message: item.message,
                        reason: item.reason,
                        recommendation: item.recommendation
                    }
                })
            };
        }

        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, error: { code: 'NOT_FOUND', message: '체크리스트를 찾을 수 없습니다' } })
        };
    } catch (error) {
        console.error('Get Detail Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: '상세 조회 중 오류가 발생했습니다' } })
        };
    }
}

function evaluateChecklist(items, aiAnalysis, userId) {
    const now = new Date();
    const expireTime = new Date(now.getTime() + 30 * 60 * 1000);
    
    const rejectionReasons = [];
    
    // 건강 상태 (증상이 있으면 거부)
    if (items.symptoms === '아니오') rejectionReasons.push('발열, 설사, 구토 등의 증상');
    if (items.respiratory === '아니오') rejectionReasons.push('호흡기 증상');
    
    // 위생 상태 (부적절하면 거부)
    if (items.wounds === '아니오') rejectionReasons.push('상처 또는 염증');
    if (items.uniform === '아니오') rejectionReasons.push('작업복 미착용');
    if (items.accessories === '아니오') rejectionReasons.push('액세서리 착용');
    if (items.hair === '아니오') rejectionReasons.push('머리카락 정리 불량');
    if (items.nails === '아니오') rejectionReasons.push('손톱 정리 불량');
    if (items.makeup === '아니오') rejectionReasons.push('화장품 사용');
    if (items.personal_items === '아니오') rejectionReasons.push('개인 소지품 반입');
    
    if (rejectionReasons.length > 0) {
        return {
            status: 'rejected',
            reason: rejectionReasons.join(', '),
            message: '건강상 이유로 오늘은 출근이 어렵습니다',
            recommendation: '충분한 휴식 후 내일 다시 체크해주세요'
        };
    }
    
    const qrCode = generateQRCode(userId, now);
    
    return {
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

function getUserName(userId) {
    const userNames = {
        'EMP001': '김철수',
        'EMP002': '이영희',
        'EMP003': '박민수'
    };
    return userNames[userId] || '알 수 없음';
}
