# 팀 협업 관리 시스템

## 개요
2명 팀의 효율적 협업을 위한 작업 관리 시스템

## 파일 구조
```
팀협업관리/
├── todo_tasks.json          # 전체 작업 목록 (JSON)
├── tasks/                   # 개별 작업 상세 내역 (MD)
│   ├── TASK-001_요구사항정의서.md
│   ├── TASK-002_Git저장소설정.md
│   └── ...
└── README.md               # 이 파일
```

## 작업 관리 방식

### 1. JSON 파일 (todo_tasks.json)
- 전체 작업 목록 및 상태 관리
- 담당자, 우선순위, 진행상황 추적
- 기계적 처리 가능한 구조화된 데이터

### 2. MD 파일 (tasks/*.md)
- 각 작업의 상세 내역
- 진행 과정, 참고사항, 완료 기준
- 사람이 읽기 쉬운 형태

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

### 1단계: JSON 파일에 작업 추가
`todo_tasks.json`의 `tasks` 배열에 새 객체 추가:

```json
{
  "id": "TASK-XXX",
  "title": "작업 제목",
  "description": "작업 설명",
  "assigned_to": "member1 또는 member2",
  "assigned_by": "할당한 사람 ID",
  "priority": "HIGH|MEDIUM|LOW|URGENT",
  "status": "TODO",
  "estimated_hours": 예상시간(숫자),
  "created_at": "2025-09-05T13:40:00Z",
  "due_date": "2025-09-05T16:00:00Z",
  "details_file": "tasks/TASK-XXX_작업명.md"
}
```

### 2단계: 상세 MD 파일 생성
`tasks/TASK-XXX_작업명.md` 파일을 다음 템플릿으로 생성:

```markdown
# TASK-XXX: 작업 제목

## 작업 개요
- **담당자**: 팀원1/팀원2
- **우선순위**: HIGH/MEDIUM/LOW/URGENT
- **예상 시간**: X시간
- **마감**: YYYY-MM-DD HH:MM

## 작업 내용
1. 구체적인 작업 내용 1
2. 구체적인 작업 내용 2
3. ...

## 산출물
- 예상되는 결과물 목록

## 진행 상황
- [ ] 체크리스트 항목 1
- [ ] 체크리스트 항목 2
- [ ] ...

## 의존성
- 이 작업을 시작하기 전에 완료되어야 할 작업들

## 완료 기준
- [ ] 완료 조건 1
- [ ] 완료 조건 2
- [ ] ...

## 참고사항
- 추가 정보나 주의사항
```

### 3단계: Git 커밋
```bash
git add .
git commit -m "TASK-XXX: 새 작업 추가 - 작업제목"
git push
```

## 작업 상태 업데이트 방법

### JSON 파일 업데이트
1. `todo_tasks.json`에서 해당 작업의 `status` 필드 변경
2. 필요시 `last_updated` 필드도 현재 시간으로 업데이트

### MD 파일 업데이트
1. 진행 상황 체크박스 업데이트: `- [x] 완료된 항목`
2. 새로운 진행 내용이나 이슈 추가

### Git 커밋
```bash
git commit -m "TASK-XXX: 상태 업데이트 - 진행내용 요약"
```

## Git 연동
- 모든 변경사항은 Git으로 버전 관리
- 작업 할당/완료 시 커밋 메시지에 TASK-ID 포함
- 예: `git commit -m "TASK-001: 요구사항 정의서 초안 완성"`

## 팀원 역할
- **백승재**: 백엔드/AI 개발, 아키텍처 설계 (SAP 개발자)
- **풍기덕**: 프론트엔드/배포, UI/UX 설계 (SAP 운영자)

---
**생성일**: 2025-09-05 13:40
**관리자**: 팀원1
