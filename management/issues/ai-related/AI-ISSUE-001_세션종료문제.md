# AI-ISSUE-001: Windows Ctrl+Z로 인한 세션 종료

## 기본 정보
- **발생 일시**: 2025-09-05 (정확한 시간 미기록)
- **카테고리**: AI
- **심각도**: MEDIUM
- **상태**: RESOLVED

## 문제 상황
### 발생 환경
- 운영체제: Windows
- 사용 도구: Amazon Q CLI
- 관련 서비스: Q Chat 세션

### 문제 설명
Windows 환경에서 Ctrl+Z 단축키 사용 시 예상치 못한 세션 종료 발생

### 재현 단계
1. Amazon Q CLI 세션 진행 중
2. Windows에서 일반적인 Undo 의도로 Ctrl+Z 입력
3. CLI 세션이 갑자기 종료됨

## 해결 과정
### 시도한 방법들
- [x] `/save` 명령어로 대화 저장: 성공
- [x] `/load` 명령어로 세션 복구: 성공

### 최종 해결책
- 정기적인 `/save` 실행으로 세션 백업
- Ctrl+Z 사용 자제

## 예방 조치
### 근본 원인
Windows와 Linux CLI 환경의 단축키 차이
- Windows: Ctrl+Z = Undo
- Linux CLI: Ctrl+Z = 프로세스 일시정지 신호

### 예방책
1. 중요한 작업 중간중간 `/save` 실행
2. CLI 환경에서 Ctrl+Z 사용 주의
3. Windows와 Linux 단축키 차이 인지

### 모니터링 방안
- 30분마다 자동 저장 습관화
- 세션 종료 시 즉시 `/load`로 복구

## 관련 자료
- Amazon Q CLI 문서: `/save`, `/load` 명령어
- Linux 프로세스 제어 신호 관련 문서

---
**작성자**: drug qrew 팀
**검토자**: -
**최종 업데이트**: 2025-09-05 14:24
