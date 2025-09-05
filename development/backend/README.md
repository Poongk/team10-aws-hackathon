# Backend 개발 가이드

## 개요
GMP CheckMaster AI의 서버 사이드 로직 및 AI 연동

## 구조
```
backend/
├── lambda/                # AWS Lambda 함수들
│   ├── checklist/         # 체크리스트 관련 API
│   ├── ai-analysis/       # AI 분석 로직
│   └── notifications/     # 알림 시스템
├── api/                   # API 엔드포인트 정의
├── ai/                    # AI 서비스 연동
│   ├── q-developer/       # Amazon Q Developer 연동
│   └── bedrock/           # Amazon Bedrock 연동
├── models/                # 데이터 모델
├── utils/                 # 유틸리티 함수
├── tests/                 # 테스트 코드
├── requirements.txt       # Python 의존성
└── README.md             # 이 파일
```

## 주요 기능

### 1. 체크리스트 API
- **POST /checklist**: 새 체크리스트 생성
- **GET /checklist/{id}**: 체크리스트 조회
- **PUT /checklist/{id}**: 체크리스트 업데이트
- **DELETE /checklist/{id}**: 체크리스트 삭제

### 2. AI 분석 API
- **POST /ai/analyze**: 건강상태 패턴 분석
- **POST /ai/predict**: 컨디션 예측
- **POST /ai/recommend**: 권장사항 생성

### 3. 알림 API
- **POST /notifications/send**: 알림 발송
- **GET /notifications/status**: 알림 상태 확인

## 개발 환경 설정

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정
```bash
export AWS_REGION=ap-northeast-2
export DYNAMODB_TABLE=gmp-checklist
export BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

### 3. 로컬 실행
```bash
python -m uvicorn main:app --reload --port 8000
```

## AI 서비스 연동

### Amazon Q Developer
```python
from ai.q_developer import QDeveloperClient

client = QDeveloperClient()
response = client.ask_gmp_question("체온 37.2도면 출입 가능한가요?")
```

### Amazon Bedrock
```python
from ai.bedrock import BedrockAnalyzer

analyzer = BedrockAnalyzer()
insights = analyzer.analyze_health_pattern(user_data)
```

## 데이터 모델

### ChecklistEntry
```python
{
    "id": "string",
    "user_id": "string", 
    "timestamp": "datetime",
    "temperature": "float",
    "symptoms": ["string"],
    "status": "approved|rejected|pending"
}
```

### HealthInsight
```python
{
    "user_id": "string",
    "pattern": "string",
    "risk_level": "low|medium|high",
    "recommendations": ["string"]
}
```

## 테스트

### 단위 테스트
```bash
pytest tests/unit/
```

### 통합 테스트
```bash
pytest tests/integration/
```

## 배포
Lambda 함수별로 개별 배포:
```bash
cd lambda/checklist
zip -r checklist.zip .
aws lambda update-function-code --function-name gmp-checklist --zip-file fileb://checklist.zip
```

---
**담당자**: 백승재 (SAP 개발자)  
**최종 업데이트**: 2025-09-05 14:35
