# TASK-006: Slack 연동 설정

## 작업 개요
- **담당자**: 풍기덕
- **할당자**: 백승재
- **우선순위**: MEDIUM
- **예상 시간**: 0.5시간
- **마감**: 2025-09-05 15:30

## 작업 내용
1. Slack Webhook URL 생성
2. GitHub Actions 설정 (todo_tasks.json 변경 감지)
3. 기본 알림 테스트
4. 팀원들과 알림 테스트

## 상세 구현 사항

### 1단계: Slack Webhook 생성
1. Slack 워크스페이스에서 새 App 생성
2. Incoming Webhooks 기능 활성화
3. 알림 받을 채널 선택 (#hackathon 또는 DM)
4. Webhook URL 복사

### 2단계: GitHub Actions 설정
파일 경로: `.github/workflows/task-notification.yml`
```yaml
name: Task Notification
on:
  push:
    paths:
      - 'project-management/todo_tasks.json'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Parse Task Changes
        id: parse
        run: |
          # JSON 파싱해서 변경된 작업 찾기
          echo "message=📋 작업 목록이 업데이트되었습니다!" >> $GITHUB_OUTPUT
      
      - name: Slack Notification
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "${{ steps.parse.outputs.message }}",
              attachments: [{
                color: "good",
                fields: [{
                  title: "커밋 메시지",
                  value: "${{ github.event.head_commit.message }}",
                  short: false
                }, {
                  title: "변경자",
                  value: "${{ github.actor }}",
                  short: true
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 3단계: GitHub Secrets 설정
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. New repository secret 클릭
3. Name: `SLACK_WEBHOOK_URL`
4. Value: 1단계에서 생성한 Webhook URL

### 4단계: 테스트
1. todo_tasks.json 파일 수정
2. 커밋 & 푸시
3. Slack 알림 확인

## 완료 기준
- [ ] Slack Webhook URL 생성 완료
- [ ] GitHub Actions 파일 작성
- [ ] GitHub Secrets 설정 완료
- [ ] 테스트 알림 성공
- [ ] 백승재와 알림 테스트 완료

## 참고 자료
- 상세 구현 방법: `팀협업관리/slack_integration.md`
- Slack API 문서: https://api.slack.com/messaging/webhooks
- GitHub Actions 문서: https://docs.github.com/en/actions

## 완료 후 사용법
```bash
# 새 작업 할당 시 커밋 메시지에 포함
git commit -m "TASK-007: 새 작업 할당 - API 개발 (백승재)"

# 작업 완료 시
git commit -m "TASK-006: Slack 연동 완료 ✅"
```

## 추가 기능 (시간 여유 시)
- [ ] 멘션 기능 (@백승재, @풍기덕)
- [ ] 우선순위별 색상 구분
- [ ] 작업 상태별 이모지 (📋 할당, ✅ 완료, ⚠️ 지연)

---
**할당 일시**: 2025-09-05 13:59  
**할당자**: 백승재 → 풍기덕  
**알림 방법**: 수동 (연동 전까지)
