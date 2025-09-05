# TODO 관리 시스템

## 구조
```
todo/
├── todo_tasks.json          # 전체 작업 목록 (JSON)
├── tasks/                   # 개별 작업 상세 내역 (MD)
│   ├── TASK-001_요구사항정의서.md
│   ├── TASK-002_Git저장소설정.md
│   ├── TASK-20250905-1628_사용자스토리정리.md
│   ├── TASK-20250905-1714_요구사항정의서업데이트.md
│   └── ...
└── README.md               # 이 파일
```

## TASK ID 생성 규칙

### 기본 규칙 (순차 번호)
- **형식**: TASK-001, TASK-002, TASK-003, ...
- **용도**: 초기 작업들 (요구사항 정의, Git 설정 등)
- **범위**: TASK-001 ~ TASK-010

### 시간 기반 규칙 (권장)
- **형식**: TASK-YYYYMMDD-HHMM
- **예시**: TASK-20250905-1628, TASK-20250905-1714
- **용도**: 해커톤 진행 중 새로 생성되는 작업들
- **장점**: 
  - 시간 순서 파악 용이
  - ID 충돌 방지 (분 단위 정확도)
  - 작업 생성 시점 추적 가능

### ID 선택 가이드
- **해커톤 시작 전**: 순차 번호 (TASK-001~010)
- **해커톤 진행 중**: 시간 기반 (TASK-YYYYMMDD-HHMM)
- **긴급 작업**: 시간 기반 + 우선순위 URGENT

### 예시
```json
{
  "id": "TASK-20250905-1628",  // 2025-09-05 16:28 생성
  "title": "사용자 스토리 정리 및 완성",
  "created_at": "2025-09-05T16:28:00Z",
  "details_file": "tasks/TASK-20250905-1628_사용자스토리정리.md"
}
```

## 작업 상태
- **TODO**: 시작 전
- **IN_PROGRESS**: 진행 중  
- **REVIEW**: 검토 필요
- **DONE**: 완료
- **BLOCKED**: 차단됨

## 우선순위
- **URGENT**: 즉시 처리 필요
- **HIGH**: 높음
- **MEDIUM**: 보통  
- **LOW**: 낮음

## 새 작업 추가 방법

### 1. JSON 파일에 작업 추가
`todo_tasks.json`에 새 작업 객체 추가:
```json
{
  "id": "TASK-YYYYMMDD-HHMM",  // 시간 기반 ID 권장
  "title": "작업 제목",
  "description": "작업 설명",
  "assigned_to": "백승재|풍기덕",
  "priority": "HIGH|MEDIUM|LOW|URGENT",
  "status": "TODO",
  "estimated_hours": 예상시간,
  "created_at": "2025-09-05T17:44:00Z",
  "due_date": "2025-09-05T18:00:00Z",
  "details_file": "tasks/TASK-YYYYMMDD-HHMM_작업명.md"
}
```

### 2. 상세 MD 파일 생성
`tasks/TASK-YYYYMMDD-HHMM_작업명.md` 파일 생성:
```markdown
# TASK-YYYYMMDD-HHMM: 작업 제목

## 작업 개요
- **담당자**: 백승재/풍기덕
- **우선순위**: HIGH/MEDIUM/LOW/URGENT
- **예상 시간**: X시간
- **마감**: YYYY-MM-DD HH:MM

## 작업 내용
1. 구체적인 작업 내용

## 진행 상황
- [ ] 체크리스트 항목

## 완료 기준
- [ ] 완료 조건

## 참고사항
- 추가 정보
```

### 3. Git 커밋
```bash
git commit -m "TASK-YYYYMMDD-HHMM: 새 작업 추가 - 작업제목"
```

## 작업 상태 업데이트
1. JSON 파일에서 `status` 필드 변경
2. MD 파일에서 진행 상황 체크박스 업데이트
3. Git 커밋: `git commit -m "TASK-YYYYMMDD-HHMM: 상태 업데이트 - 내용"`

## 현재 활용 중인 ID 패턴
- **TASK-001~010**: 초기 설정 작업들
- **TASK-20250905-1628**: 사용자 스토리 정리 및 완성 ✅
- **TASK-20250905-1714**: 요구사항 정의서 업데이트 ✅

---
**관리자**: drug qrew 팀  
**업데이트**: 2025-09-05 17:44 (시간 기반 ID 규칙 추가)
