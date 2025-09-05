# 프론트엔드 자동화 도구

## 개요
GMP CheckMaster AI React 앱의 자동 테스트 및 스크린샷 촬영 도구

## 설치 및 실행

### 1. Python 가상환경 생성
```bash
cd /home/sjbaek/projects/aws/team10-aws-hackathon/development/frontend/automation
python3 -m venv venv
source venv/bin/activate
```

### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. React 앱 실행 확인
```bash
# 다른 터미널에서 React 앱이 실행 중인지 확인
curl http://localhost:3001
```

### 4. 스크린샷 촬영
```bash
python screenshot.py
```

## 기능

### 📸 자동 스크린샷
- **모든 페이지 촬영**: 6개 핵심 화면 자동 스크린샷
- **사용자 플로우**: 실제 사용자 동작 시뮬레이션
- **타임스탬프**: 파일명에 촬영 시간 포함

### 📝 콘솔 로그 수집
- **브라우저 콘솔**: JavaScript 오류, 경고 수집
- **자동 저장**: 텍스트 파일로 저장
- **디버깅 지원**: 오류 분석용 로그

### 🎭 해커톤 시연 지원
- **데모 플로우**: 실제 시연 순서대로 스크린샷
- **호버 상태**: 이스터에그 기능 테스트
- **전체 플로우**: 작업자 → AI 판정 → QR → 스캔 → 결과

## 출력 파일

### 스크린샷
```
screenshots/
├── 01_로그인화면_20250905_220500.png
├── 02_작업자대시보드_20250905_220502.png
├── 03_체크리스트화면_20250905_220504.png
├── 04_결과화면_20250905_220506.png
├── 07_QR스캐너화면_20250905_220508.png
└── 08_출입결과화면_20250905_220510.png
```

### 콘솔 로그
```
screenshots/
└── console_logs_20250905_220512.txt
```

## Q CLI 연동

### 스크린샷 분석 요청
```
이 스크린샷을 분석해줘: development/frontend/automation/screenshots/01_로그인화면_20250905_220500.png
```

### 콘솔 로그 분석 요청
```
이 콘솔 로그를 분석해줘: development/frontend/automation/screenshots/console_logs_20250905_220512.txt
```

## 사용 예시

### 문제 상황 분석
1. **React 앱 실행**: `npm run dev`
2. **스크린샷 촬영**: `python screenshot.py`
3. **Q CLI에서 분석**: 촬영된 이미지/로그 파일 경로 제공

### 해커톤 시연 준비
1. **전체 플로우 테스트**: 모든 화면이 정상 작동하는지 확인
2. **시연 자료 준비**: 스크린샷을 PPT나 문서에 활용
3. **오류 사전 점검**: 콘솔 로그로 숨겨진 오류 발견

## 주의사항
- Chrome 브라우저가 설치되어 있어야 함
- React 앱이 http://localhost:3001에서 실행 중이어야 함
- 가상환경 활성화 후 실행 권장
