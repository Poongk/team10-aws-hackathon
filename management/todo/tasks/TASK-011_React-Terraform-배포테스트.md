# TASK-011: React 헬로월드 + Terraform 배포 테스트

## 태스크 정보
- **생성일**: 2025-09-05 17:18
- **담당자**: 백승재, 풍기덕
- **우선순위**: 높음 (배포 파이프라인 검증)
- **예상 소요시간**: 1-2시간

## 목표
React 기반 헬로월드 앱을 Terraform으로 AWS에 배포하는 전체 파이프라인 테스트

## 작업 단계

### 1. React 헬로월드 앱 생성
- [ ] `development/frontend/` 디렉토리에 React 앱 생성
- [ ] 기본 헬로월드 컴포넌트 구현
- [ ] 빌드 테스트 (npm run build)

### 2. Terraform 인프라 코드 작성
- [ ] `development/infrastructure/` 디렉토리에 Terraform 파일 생성
- [ ] S3 버킷 (정적 웹사이트 호스팅)
- [ ] CloudFront 배포 (선택사항)
- [ ] 필요한 IAM 권한 설정

### 3. 배포 스크립트 작성
- [ ] React 빌드 → S3 업로드 자동화 스크립트
- [ ] Terraform apply 실행 스크립트
- [ ] 배포 후 검증 스크립트

### 4. 테스트 및 검증
- [ ] Terraform plan 실행
- [ ] Terraform apply 실행
- [ ] 웹사이트 접속 확인
- [ ] 리소스 정리 (terraform destroy)

## 성공 기준
- React 앱이 AWS에서 정상적으로 로드됨
- Terraform으로 인프라 생성/삭제가 정상 동작
- 전체 배포 프로세스가 자동화됨

## 다음 단계
이 테스트가 성공하면 GMP CheckMaster AI 메인 앱 배포에 동일한 방식 적용

## 참고사항
- AWS 자격증명 설정 필요
- Terraform 상태 파일 관리 방안 고려
- 도메인 설정은 이후 단계에서 진행
