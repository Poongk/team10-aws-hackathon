# 개발 환경 설정 가이드

## 개요
GMP CheckMaster AI 시스템 개발을 위한 환경 설정 가이드 모음

## 구조
```
setup/
├── README.md                    # 이 파일 (설정 가이드 개요)
├── 개발환경가이드.md            # 전체 개발 환경 설정 (TASK-20250905-1752에서 생성 예정)
├── aws-setup.md                 # AWS 계정 및 서비스 설정
├── local-development.md         # 로컬 개발 환경 설정
└── deployment-guide.md          # 배포 환경 설정
```

## 설정 순서

### 1. 전체 개발 환경 설정
📄 `개발환경가이드.md` - 시스템 아키텍처 기반 종합 가이드

### 2. AWS 환경 설정
📄 `aws-setup.md` - AWS 계정, IAM, 서비스 설정

### 3. 로컬 개발 환경
📄 `local-development.md` - Node.js, React, 개발 도구 설정

### 4. 배포 환경 설정
📄 `deployment-guide.md` - CI/CD, AWS Amplify 설정

## 기본 정보

### Git 저장소
- **GitHub URL**: https://github.com/Poongk/team10-aws-hackathon
- **저장소명**: team10-aws-hackathon
- **팀명**: drug qrew (team10)
- **Owner**: 풍기덕 (Poongk)
- **Collaborator**: 백승재

### 해커톤 환경
- **AWS 계정**: 팀별 제공 (팀 채널 공지)
- **IAM User**: Hackathon
- **초기 Password**: AWSHackathon!23
- **Amazon Q Developer**: Pro tier 제공

### 개발 도구
- **IDE**: VS Code (Amazon Q Developer 확장)
- **Node.js**: 18.x LTS
- **Package Manager**: npm
- **Git**: 최신 버전

---
**관리**: drug qrew 팀  
**업데이트**: 2025-09-05 17:55  
**상태**: 아키텍처 설계 후 상세 가이드 작성 예정
