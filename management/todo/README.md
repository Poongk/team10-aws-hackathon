# TODO 관리 시스템

## 구조
```
todo/
├── todo_tasks.json          # 전체 작업 목록 (JSON)
├── tasks/                   # 개별 작업 상세 내역 (MD)
│   ├── TASK-001_요구사항정의서.md
│   ├── TASK-002_Git저장소설정.md
│   └── ...
└── README.md               # 이 파일
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
  "id": "TASK-XXX",
  "title": "작업 제목",
  "description": "작업 설명",
  "assigned_to": "백승재|풍기덕",
  "priority": "HIGH|MEDIUM|LOW|URGENT",
  "status": "TODO",
  "estimated_hours": 예상시간,
  "created_at": "2025-09-05T14:26:00Z",
  "due_date": "2025-09-05T18:00:00Z",
  "details_file": "tasks/TASK-XXX_작업명.md"
}
```

### 2. 상세 MD 파일 생성
`tasks/TASK-XXX_작업명.md` 파일 생성:
```markdown
# TASK-XXX: 작업 제목

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
git commit -m "TASK-XXX: 새 작업 추가 - 작업제목"
```

## 작업 상태 업데이트
1. JSON 파일에서 `status` 필드 변경
2. MD 파일에서 진행 상황 체크박스 업데이트
3. Git 커밋: `git commit -m "TASK-XXX: 상태 업데이트 - 내용"`

---
**관리자**: drug qrew 팀
