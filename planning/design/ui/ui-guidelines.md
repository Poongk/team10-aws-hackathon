# GMP CheckMaster UI 가이드라인

## 디자인 원칙

### 1. 모바일 우선 (Mobile First)
- 화면 크기: 320px ~ 400px 최적화
- 터치 인터페이스 고려
- 세로 스크롤 기본

### 2. 직관적 사용성
- 명확한 아이콘과 텍스트
- 상태별 색상 구분
- 간단한 네비게이션

### 3. 접근성 (Accessibility)
- 충분한 색상 대비
- 큰 터치 영역 (최소 44px)
- 명확한 피드백

## 색상 시스템

### 상태 색상
```css
:root {
  /* 상태 색상 */
  --success-color: #52c41a;    /* 승인 - 초록색 */
  --error-color: #f5222d;      /* 거부 - 빨간색 */
  --warning-color: #faad14;    /* 재확인 - 주황색 */
  --primary-color: #1890ff;    /* 기본 - 파란색 */
  
  /* 텍스트 색상 */
  --text-primary: #262626;     /* 주요 텍스트 */
  --text-secondary: #595959;   /* 보조 텍스트 */
  --text-disabled: #8c8c8c;    /* 비활성 텍스트 */
  
  /* 배경 색상 */
  --bg-primary: #ffffff;       /* 기본 배경 */
  --bg-secondary: #f5f5f5;     /* 보조 배경 */
  --bg-disabled: #f0f0f0;      /* 비활성 배경 */
  
  /* 테두리 색상 */
  --border-color: #d9d9d9;     /* 기본 테두리 */
  --border-light: #f0f0f0;     /* 연한 테두리 */
}
```

### 상태별 사용법
- **승인 상태**: 초록색 배경 + 체크마크 아이콘
- **거부 상태**: 빨간색 배경 + X 마크 아이콘  
- **재확인 상태**: 주황색 배경 + 경고 아이콘
- **기본 상태**: 파란색 배경 + 기본 아이콘

## 타이포그래피

### 폰트 크기
```css
.text-title {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}

.text-subtitle {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.4;
}

.text-body {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}

.text-caption {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
}

.text-small {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
}
```

### 사용 예시
- **제목**: 화면 타이틀 (24px, 굵게)
- **부제목**: 섹션 제목 (18px, 중간)
- **본문**: 일반 텍스트 (16px, 보통)
- **캡션**: 설명 텍스트 (14px, 보통)
- **작은글씨**: 부가 정보 (12px, 보통)

## 레이아웃

### 컨테이너
```css
.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 16px;
  background-color: var(--bg-primary);
}

.section {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--bg-secondary);
}
```

### 간격 시스템
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

## 컴포넌트

### 버튼
```css
.btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-success {
  background-color: var(--success-color);
  color: white;
}

.btn-danger {
  background-color: var(--error-color);
  color: white;
}

.btn-warning {
  background-color: var(--warning-color);
  color: white;
}
```

### 입력 필드
```css
.input {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 16px;
  background-color: var(--bg-primary);
}

.input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
```

### 라디오 버튼
```css
.radio-group {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-item.selected {
  border-color: var(--primary-color);
  background-color: rgba(24, 144, 255, 0.1);
}
```

### 카드
```css
.card {
  padding: 16px;
  border-radius: 8px;
  background-color: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.card-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}
```

## 상태별 UI 패턴

### 승인 상태
```css
.status-approved {
  background-color: var(--success-color);
  color: white;
  text-align: center;
  padding: 24px;
  border-radius: 12px;
}

.status-approved::before {
  content: "✅";
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}
```

### 거부 상태
```css
.status-rejected {
  background-color: var(--error-color);
  color: white;
  text-align: center;
  padding: 24px;
  border-radius: 12px;
}

.status-rejected::before {
  content: "❌";
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}
```

### 재확인 상태
```css
.status-recheck {
  background-color: var(--warning-color);
  color: white;
  text-align: center;
  padding: 24px;
  border-radius: 12px;
}

.status-recheck::before {
  content: "⚠️";
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}
```

## QR 코드 영역
```css
.qr-container {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-code {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-disabled);
}
```

## 반응형 고려사항

### 모바일 (320px ~ 768px)
```css
@media (max-width: 768px) {
  .container {
    padding: 12px;
  }
  
  .btn {
    height: 44px;
    font-size: 16px;
  }
  
  .text-title {
    font-size: 20px;
  }
}
```

### 태블릿/데스크톱 (768px+)
```css
@media (min-width: 768px) {
  .container {
    max-width: 400px;
    margin: 40px auto;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
  }
}
```

## 애니메이션

### 기본 전환
```css
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### 로딩 상태
```css
.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## 아이콘 가이드

### 상태 아이콘
- ✅ 승인 완료
- ❌ 거부됨  
- ⚠️ 재확인 필요
- 🔄 처리 중

### 기능 아이콘
- 👤 사용자
- 📅 날짜
- ⏰ 시간
- 📋 체크리스트
- 📊 통계
- 🏭 공장/회사
- 🚫 출입 금지

### 네비게이션 아이콘
- ← 뒤로가기
- ☰ 메뉴
- ⚙️ 설정
- 🔍 검색

---
**작성일**: 2025-09-05 19:20  
**용도**: React 컴포넌트 개발 가이드  
**UI 라이브러리**: Ant Design Mobile 권장
