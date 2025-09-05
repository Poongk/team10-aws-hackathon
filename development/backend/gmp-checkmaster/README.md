# GMP CheckMaster AI - 백엔드 (확장 버전)

## 🚀 빠른 시작

### 로컬 개발 (SAM Local)
```bash
# SAM Local API 시작
sam local start-api --port 3001

# 개별 함수 테스트
sam local invoke AuthHandler --event events/login-test.json
sam local invoke ChecklistHandler --event events/submit-checklist.json
sam local invoke AIJudgmentHandler --event events/ai-judge.json
sam local invoke QRHandler --event events/generate-qr.json
sam local invoke DashboardHandler --event events/dashboard-stats.json
sam local invoke AssignmentHandler --event events/create-assignment.json
sam local invoke NotificationHandler --event events/send-notification.json
sam local invoke AdminHandler --event events/create-template.json
```

### 클라우드 배포
```bash
# 빌드
sam build

# 배포
sam deploy --guided
```

## 📋 API 엔드포인트 (총 22개)

### 인증 (AuthHandler) - 3개
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃
- `GET /auth/verify` - 토큰 검증

### 체크리스트 (ChecklistHandler) - 6개  
- `GET /checklists/templates` - 템플릿 조회
- `POST /checklists/submit` - 체크리스트 제출
- `GET /checklists/records` - 기록 조회
- `PUT /checklists/records/{record_id}` - 체크리스트 수정 (5분 내)
- `POST /checklists/modification-request` - 수정 요청 (5분 후)
- `POST /checklists/emergency-review` - 긴급 재검토 요청

### AI 판정 (AIJudgmentHandler) - 2개
- `POST /ai/judge` - 건강상태 AI 판정
- `GET /ai/judgment/{record_id}` - 판정 결과 조회

### QR 코드 (QRHandler) - 2개
- `POST /qr/generate` - QR 코드 생성
- `POST /qr/verify` - QR 코드 검증

### 대시보드 (DashboardHandler) - 4개
- `GET /dashboard/stats` - 통계 조회
- `GET /dashboard/reports` - 리포트 조회
- `GET /dashboard/status` - 실시간 현황 조회 (운영자용)
- `GET /dashboard/team/{team_id}` - 팀 현황 조회 (책임자용)

### 배정 관리 (AssignmentHandler) - 2개
- `GET /assignment/list` - 배정 목록 조회
- `POST /assignment/create` - 배정 생성

### 알림 (NotificationHandler) - 1개
- `POST /notification/send` - 알림 발송

### 관리자 (AdminHandler) - 3개
- `POST /admin/templates` - 템플릿 생성
- `PUT /admin/qr-validity/template/{template_id}` - QR 유효시간 설정
- `PUT /operator/qr-validity/daily` - QR 유효시간 당일 조정

## 🧪 테스트 데이터

### Demo 사용자
- `worker1` - 김작업 (생산팀A)
- `operator1` - 박운영 (운영팀)
- `supervisor1` - 이책임 (생산팀A)
- `admin1` - 최관리 (IT팀)
- `security1` - 정보보안 (보안팀)

### AI 판정 로직
1. **발열/설사/구토 증상** → 자동 거부
2. **호흡기 증상** → 재확인 필요
3. **복장/상처 부적절** → 재확인 필요
4. **모든 항목 정상** → 출입 승인

## 📁 프로젝트 구조
```
├── template.yaml              # SAM 템플릿 (8개 핸들러)
├── shared/                    # 공통 유틸리티
├── auth-handler/              # 인증 API (3개)
├── checklist-handler/         # 체크리스트 API (6개)
├── ai-judgment-handler/       # AI 판정 API (2개)
├── qr-handler/                # QR 코드 API (2개)
├── dashboard-handler/         # 대시보드 API (4개)
├── assignment-handler/        # 배정 관리 API (2개) 🆕
├── notification-handler/      # 알림 API (1개) 🆕
├── admin-handler/             # 관리자 API (3개) 🆕
└── events/                    # 테스트 이벤트 (10개)
```

## 🆕 새로 추가된 기능
1. **체크리스트 수정/재검토** - 5분 내 수정, 수정 요청, 긴급 재검토
2. **배정 관리** - 사용자별 체크리스트 배정 및 스케줄 관리
3. **알림 시스템** - 마감 알림, 상태 변경 알림
4. **관리자 기능** - 템플릿 생성, QR 유효시간 관리
5. **확장된 대시보드** - 실시간 현황, 팀별 상세 현황

## 📊 API 확장 현황
- **기존**: 5개 핸들러, 12개 API
- **확장**: 8개 핸들러, 22개 API (+10개)
- **커버리지**: API 명세서 대비 78% 구현
