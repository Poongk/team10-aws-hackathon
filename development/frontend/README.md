# Frontend 개발 가이드

## 개요
GMP CheckMaster AI의 사용자 인터페이스 및 웹 애플리케이션

## 구조
```
frontend/
├── src/
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   ├── Checklist/     # 체크리스트 관련 컴포넌트
│   │   ├── Dashboard/     # 대시보드 컴포넌트
│   │   └── Common/        # 공통 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── ChecklistPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── SettingsPage.jsx
│   ├── hooks/             # 커스텀 훅
│   ├── services/          # API 서비스
│   ├── utils/             # 유틸리티 함수
│   └── styles/            # 스타일 파일
├── public/                # 정적 파일
├── package.json           # 의존성 관리
└── README.md             # 이 파일
```

## 주요 기능

### 1. 체크리스트 작성
- **모바일 친화적 UI**: 터치 최적화
- **실시간 검증**: 입력값 즉시 확인
- **오프라인 지원**: 임시 저장 기능

### 2. AI 대시보드
- **패턴 시각화**: Chart.js 기반 그래프
- **실시간 인사이트**: AI 분석 결과 표시
- **알림 센터**: 중요 알림 관리

### 3. 관리자 패널
- **사용자 관리**: 권한 및 상태 관리
- **통계 대시보드**: 전체 현황 모니터링
- **설정 관리**: 시스템 설정 변경

## 기술 스택

### Core
- **React 18**: 함수형 컴포넌트 + Hooks
- **TypeScript**: 타입 안정성
- **Vite**: 빠른 개발 서버

### UI/UX
- **Material-UI**: 디자인 시스템
- **Chart.js**: 데이터 시각화
- **React Router**: 페이지 라우팅

### State Management
- **React Context**: 전역 상태 관리
- **React Query**: 서버 상태 관리

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000
VITE_AWS_REGION=ap-northeast-2
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## 컴포넌트 가이드

### ChecklistForm
```jsx
import { ChecklistForm } from './components/Checklist/ChecklistForm';

<ChecklistForm 
  onSubmit={handleSubmit}
  initialData={data}
  disabled={loading}
/>
```

### AIInsightCard
```jsx
import { AIInsightCard } from './components/Dashboard/AIInsightCard';

<AIInsightCard 
  insight={insight}
  onAction={handleAction}
/>
```

## API 연동

### 체크리스트 API
```javascript
import { checklistService } from './services/checklist';

// 체크리스트 제출
const result = await checklistService.submit(checklistData);

// AI 분석 요청
const insights = await checklistService.getInsights(userId);
```

## 스타일 가이드

### 색상 팔레트
```css
:root {
  --primary-color: #1976d2;
  --secondary-color: #dc004e;
  --success-color: #2e7d32;
  --warning-color: #ed6c02;
  --error-color: #d32f2f;
}
```

### 반응형 브레이크포인트
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

## 테스트

### 컴포넌트 테스트
```bash
npm run test
```

### E2E 테스트
```bash
npm run test:e2e
```

## 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### AWS Amplify 배포
```bash
amplify publish
```

---
**담당자**: 풍기덕 (SAP 운영자)  
**최종 업데이트**: 2025-09-05 14:35
