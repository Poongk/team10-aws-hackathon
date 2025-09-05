# 프론트엔드 자동화 도구

## 개요
GMP CheckMaster AI React 앱의 자동 테스트 및 스크린샷 촬영 도구 (WSL 환경 최적화)

## 설치 및 실행

### 1. Python 가상환경 생성
```bash
cd /home/sjbaek/projects/aws/team10-aws-hackathon/development/frontend/automation
python3 -m venv venv
source venv/bin/activate
```

### 2. 의존성 설치
```bash
pip install selenium webdriver-manager
```

### 3. Chrome 및 한글 폰트 설치 (WSL 환경)
```bash
# Chrome 설치
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update && sudo apt install -y google-chrome-stable

# 한글 폰트 설치
sudo apt install -y fonts-nanum fonts-nanum-coding fonts-nanum-extra
```

### 4. 스크린샷 촬영
```bash
# 가상환경 활성화
source venv/bin/activate

# 단일 URL 스크린샷
python screenshot.py --url "http://localhost:3000/dashboard"

# 모든 페이지 스크린샷
python screenshot.py --all

# 사용자 플로우 시뮬레이션
python screenshot.py --flow
```

## 기능

### 📸 자동 스크린샷 (WSL 환경 최적화)
- **Headless Chrome**: WSL 환경에서 GUI 없이 실행
- **한글 폰트 지원**: 나눔폰트로 한글 렌더링 개선
- **URL + 날짜 파일명**: `http_localhost:3000_dashboard_20250905_224234.png` 형식
- **모든 페이지 촬영**: 6개 핵심 화면 자동 스크린샷
- **사용자 플로우**: 실제 사용자 동작 시뮬레이션

### 📝 콘솔 로그 수집
- **브라우저 콘솔**: JavaScript 오류, 경고 수집
- **자동 저장**: 텍스트 파일로 저장
- **디버깅 지원**: 오류 분석용 로그

### 🎭 해커톤 시연 지원
- **데모 플로우**: 실제 시연 순서대로 스크린샷
- **호버 상태**: 이스터에그 기능 테스트
- **전체 플로우**: 작업자 → AI 판정 → QR → 스캔 → 결과

## 출력 파일

### 스크린샷 (URL + 날짜 형식)
```
screenshots/
├── http_localhost:3000_dashboard_20250905_224234.png
├── https_google.com_20250905_223925.png
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

## WSL 환경 최적화 설정

### Chrome 옵션
- `--headless=new`: 새로운 headless 모드
- `--no-sandbox`: WSL 샌드박스 비활성화
- `--disable-dev-shm-usage`: 공유 메모리 사용 안함
- `--lang=ko-KR`: 한국어 로케일
- `--force-device-scale-factor=1`: 스케일링 고정
- `--disable-font-subpixel-positioning`: 폰트 렌더링 개선

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
- **WSL 환경**: Chrome headless 모드로 실행
- **한글 폰트**: 나눔폰트 설치 필요
- **React 앱**: http://localhost:3000 또는 3001에서 실행 중이어야 함
- **가상환경**: 활성화 후 실행 권장
- **ChromeDriver**: 자동 다운로드 및 설치됨

## 트러블슈팅

### WSL 환경에서 Chrome 실행 오류
```bash
# Chrome 및 의존성 재설치
sudo apt update
sudo apt install -y google-chrome-stable fonts-nanum
```

### 스크린샷 품질 개선
- 한글 폰트가 깨질 경우: `sudo apt install -y fonts-nanum-extra`
- 해상도 조정: 스크립트 내 `--window-size=1920,1080` 수정
