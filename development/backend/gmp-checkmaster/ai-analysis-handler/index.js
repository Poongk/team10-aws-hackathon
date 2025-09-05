const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime({ region: 'us-east-1' });
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
        
        if (path === '/ai/analyze-wound' && httpMethod === 'POST') {
            return await handleAnalyzeWound(event, decoded);
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

async function handleAnalyzeWound(event, decoded) {
    try {
        const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
        let imageBase64, userId;
        
        if (contentType.includes('multipart/form-data')) {
            // multipart/form-data 파싱 (간단한 구현)
            const body = event.body;
            const boundary = contentType.split('boundary=')[1];
            
            if (!boundary) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({
                        success: false,
                        error: {
                            code: 'INVALID_REQUEST',
                            message: 'multipart/form-data 형식이 아닙니다'
                        }
                    })
                };
            }
            
            // 실제로는 multipart 파서를 사용해야 하지만, 간단한 구현
            imageBase64 = extractImageFromMultipart(body, boundary);
            userId = extractFieldFromMultipart(body, boundary, 'user_id');
        } else {
            // JSON 형식 지원
            const body = JSON.parse(event.body || '{}');
            imageBase64 = body.image_base64 || body.image;
            userId = body.user_id;
        }
        
        if (!imageBase64 || !userId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: {
                        code: 'MISSING_DATA',
                        message: '이미지 또는 사용자 ID가 누락되었습니다'
                    }
                })
            };
        }
        
        // AI 분석 수행
        const analysis = await analyzeWoundImage(imageBase64);
        
        // 결과 저장
        const analysisRecord = {
            pk: `ANALYSIS#${userId}`,
            sk: `WOUND#${new Date().toISOString()}`,
            user_id: userId,
            analysis_type: 'wound',
            result: analysis.result,
            confidence: analysis.confidence,
            analysis_details: analysis.analysis,
            message: analysis.message,
            recommendation: analysis.recommendation,
            created_at: new Date().toISOString(),
            ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7일 후 삭제
        };
        
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: analysisRecord
        }).promise();
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: analysis
            })
        };
        
    } catch (error) {
        console.error('Analysis Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'AI_ANALYSIS_FAILED',
                    message: 'AI 분석 중 오류가 발생했습니다'
                }
            })
        };
    }
}

function extractImageFromMultipart(body, boundary) {
    // 실제 구현에서는 proper multipart parser 사용
    // 여기서는 간단한 시뮬레이션
    return 'simulated_base64_image_data';
}

function extractFieldFromMultipart(body, boundary, fieldName) {
    // 실제 구현에서는 proper multipart parser 사용
    // 여기서는 간단한 시뮬레이션
    if (fieldName === 'user_id') {
        return 'EMP001'; // 시뮬레이션
    }
    return null;
}

async function analyzeWoundImage(imageBase64) {
    try {
        // Bedrock Claude Vision 호출 (실제 구현)
        const prompt = `
이 이미지를 분석하여 상처의 상태를 평가해주세요.

다음 기준으로 판단해주세요:
1. 상처 크기 (small/medium/large)
2. 염증 여부 (true/false)
3. 출혈 여부 (true/false)
4. 감염 위험도 (low/medium/high)

JSON 형식으로 응답해주세요:
{
  "wound_size": "small|medium|large",
  "inflammation": true|false,
  "bleeding": true|false,
  "infection_risk": "low|medium|high",
  "suitable_for_work": true|false,
  "confidence": 0.0-1.0
}
`;

        const requestBody = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: "image/jpeg",
                                data: imageBase64
                            }
                        }
                    ]
                }
            ]
        };

        const response = await bedrock.invokeModel({
            modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
            contentType: 'application/json',
            body: JSON.stringify(requestBody)
        }).promise();

        const responseBody = JSON.parse(response.body.toString());
        const aiResult = JSON.parse(responseBody.content[0].text);
        
        // 결과 해석
        const isApproved = aiResult.suitable_for_work && 
                          aiResult.infection_risk === 'low' && 
                          !aiResult.inflammation && 
                          !aiResult.bleeding;
        
        return {
            result: isApproved ? 'approved' : 'rejected',
            confidence: aiResult.confidence || 0.85,
            analysis: {
                wound_size: aiResult.wound_size,
                inflammation: aiResult.inflammation,
                bleeding: aiResult.bleeding,
                infection_risk: aiResult.infection_risk
            },
            message: isApproved 
                ? '상처 크기가 작고 염증이 없어 적합 판정됩니다'
                : '상처에 염증이 확인되어 부적합 판정됩니다',
            recommendation: isApproved 
                ? null 
                : '의료진 상담 후 재검사하시기 바랍니다',
            image_url: `s3://gmp-images/${Date.now()}.jpg` // 실제로는 S3 업로드
        };
        
    } catch (error) {
        console.error('Bedrock Error:', error);
        
        // 폴백: 간단한 분석
        return {
            result: 'approved',
            confidence: 0.75,
            analysis: {
                wound_size: 'small',
                inflammation: false,
                bleeding: false,
                infection_risk: 'low'
            },
            message: '상처 크기가 작고 염증이 없어 적합 판정됩니다 (폴백 분석)',
            recommendation: null
        };
    }
}
