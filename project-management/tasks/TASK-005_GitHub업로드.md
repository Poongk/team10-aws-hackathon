# TASK-005: 현재 프로젝트 내용 GitHub 업로드

## 작업 개요
- **담당자**: 백승재
- **우선순위**: HIGH
- **예상 시간**: 0.5시간
- **마감**: 2025-09-05 14:30

## 작업 내용
1. GitHub 저장소 클론
2. 현재 로컬 작업 내용 정리 및 업로드
3. 폴더 구조 GitHub 표준에 맞게 재구성
4. 초기 README.md 작성
5. .gitignore 설정

## 업로드할 내용
### 현재 로컬 구조 → GitHub 구조 매핑
```
hackathon_20250905/
├── 아이디어/ → docs/planning/ideas/
├── 자료수집/ → docs/planning/research/
├── 개발/문서/ → docs/
├── 팀협업관리/ → project-management/
├── 참고자료/ → docs/references/
├── CLI대화기록/ → docs/chat-logs/
└── README.md → README.md (업데이트)
```

### GitHub 최종 구조
```
team10-aws-hackathon/
├── docs/
│   ├── planning/
│   │   ├── ideas/
│   │   └── research/
│   ├── references/
│   ├── chat-logs/
│   ├── requirements.md
│   └── environment.md
├── project-management/
│   ├── todo_tasks.json
│   ├── tasks/
│   └── README.md
├── frontend/ (빈 폴더)
├── backend/ (빈 폴더)
├── infrastructure/ (빈 폴더)
├── .gitignore
└── README.md
```

## 실행 명령어
```bash
# 1. 저장소 클론
cd /home/sjbaek/projects/aws/
git clone https://github.com/Poongk/team10-aws-hackathon.git

# 2. 내용 복사 및 구조 정리
cd team10-aws-hackathon
mkdir -p docs/planning/{ideas,research} docs/references docs/chat-logs
mkdir -p project-management/tasks
mkdir -p frontend backend infrastructure

# 3. 파일 복사
cp -r ../hackathon_20250905/아이디어/* docs/planning/ideas/
cp -r ../hackathon_20250905/자료수집/* docs/planning/research/
cp -r ../hackathon_20250905/개발/문서/* docs/
cp -r ../hackathon_20250905/팀협업관리/* project-management/
cp -r ../hackathon_20250905/참고자료/* docs/references/
cp -r ../hackathon_20250905/CLI대화기록/* docs/chat-logs/
cp ../hackathon_20250905/README.md ./

# 4. .gitignore 생성
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc

# Environment
.env
.env.local

# AWS
.aws/
*.pem

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Build
dist/
build/
*.zip
EOF

# 5. 커밋 및 푸시
git add .
git commit -m "Initial project setup: documentation, planning, and team management"
git push origin main
```

## 완료 기준
- [ ] GitHub 저장소 클론 완료
- [ ] 모든 로컬 내용 GitHub에 업로드
- [ ] 폴더 구조 정리 완료
- [ ] .gitignore 설정 완료
- [ ] README.md 업데이트
- [ ] 첫 커밋 및 푸시 완료

## 참고사항
- 현재 작업 내용 백업 목적
- 팀원과 실시간 협업 준비
- 해커톤 제출 준비

## 완료 후 다음 작업
- 풍기덕님과 협업 시작
- 개발 브랜치 전략 적용
- 실시간 작업 공유
