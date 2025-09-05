# Slack 연동 방안

## 개요
작업(Task) 생성/할당/완료 시 Slack으로 실시간 알림 받기

## 연동 방법들

### 1. GitHub Actions + Slack (추천)
GitHub에 파일 변경 시 자동으로 Slack 알림

#### 설정 방법
```yaml
# .github/workflows/task-notification.yml
name: Task Notification
on:
  push:
    paths:
      - 'project-management/todo_tasks.json'
      - 'project-management/tasks/*.md'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Slack Notification
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "📋 작업 업데이트",
              attachments: [{
                color: "good",
                fields: [{
                  title: "변경된 파일",
                  value: "${{ github.event.head_commit.message }}",
                  short: false
                }]
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 2. Slack Webhook 직접 사용
간단한 스크립트로 Slack에 메시지 전송

#### Python 스크립트 예시
```python
import requests
import json

def send_slack_notification(task_info):
    webhook_url = "YOUR_SLACK_WEBHOOK_URL"
    
    message = {
        "text": f"📋 새로운 작업이 할당되었습니다!",
        "attachments": [
            {
                "color": "good",
                "fields": [
                    {
                        "title": "작업 ID",
                        "value": task_info["id"],
                        "short": True
                    },
                    {
                        "title": "제목",
                        "value": task_info["title"],
                        "short": True
                    },
                    {
                        "title": "담당자",
                        "value": task_info["assigned_to"],
                        "short": True
                    },
                    {
                        "title": "우선순위",
                        "value": task_info["priority"],
                        "short": True
                    }
                ]
            }
        ]
    }
    
    requests.post(webhook_url, json=message)

# 사용 예시
task = {
    "id": "TASK-006",
    "title": "새로운 작업",
    "assigned_to": "백승재",
    "priority": "HIGH"
}
send_slack_notification(task)
```

### 3. Git Hook 사용
Git 커밋 시 자동으로 Slack 알림

#### pre-commit hook 예시
```bash
#!/bin/bash
# .git/hooks/pre-commit

# todo_tasks.json 변경 감지
if git diff --cached --name-only | grep -q "todo_tasks.json"; then
    # Slack 알림 전송
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"📋 작업 목록이 업데이트되었습니다!"}' \
        YOUR_SLACK_WEBHOOK_URL
fi
```

## 실제 구현 방안

### 단계 1: Slack Webhook URL 생성
1. Slack 워크스페이스에서 App 생성
2. Incoming Webhooks 활성화
3. 채널 선택 후 Webhook URL 복사

### 단계 2: GitHub Secrets 설정
1. GitHub 저장소 → Settings → Secrets
2. `SLACK_WEBHOOK_URL` 추가

### 단계 3: 알림 스크립트 작성
```bash
# notify_task.sh
#!/bin/bash

TASK_ID=$1
ACTION=$2  # created, assigned, completed
ASSIGNEE=$3

curl -X POST -H 'Content-type: application/json' \
    --data "{
        \"text\": \"📋 작업 알림\",
        \"attachments\": [{
            \"color\": \"good\",
            \"fields\": [
                {\"title\": \"작업 ID\", \"value\": \"$TASK_ID\", \"short\": true},
                {\"title\": \"액션\", \"value\": \"$ACTION\", \"short\": true},
                {\"title\": \"담당자\", \"value\": \"$ASSIGNEE\", \"short\": true}
            ]
        }]
    }" \
    $SLACK_WEBHOOK_URL
```

### 단계 4: 사용 방법
```bash
# 새 작업 생성 시
./notify_task.sh "TASK-006" "created" "백승재"

# 작업 완료 시  
./notify_task.sh "TASK-006" "completed" "백승재"
```

## 고급 기능

### 1. 멘션 기능
```json
{
    "text": "📋 <@백승재> 새로운 작업이 할당되었습니다!",
    "channel": "#hackathon-team10"
}
```

### 2. 버튼 액션
```json
{
    "text": "작업이 완료되었나요?",
    "attachments": [{
        "actions": [
            {
                "type": "button",
                "text": "완료",
                "value": "complete_task"
            }
        ]
    }]
}
```

### 3. 일정 알림
```bash
# cron으로 매일 오전 9시 진행 상황 알림
0 9 * * * /path/to/daily_task_summary.sh
```

## 추천 구현 순서

### 즉시 구현 (5분)
1. Slack Webhook URL 생성
2. 간단한 curl 명령어로 테스트

### 단기 구현 (30분)
1. GitHub Actions 설정
2. JSON 파일 변경 시 자동 알림

### 장기 구현 (해커톤 후)
1. 버튼 액션 기능
2. 멘션 및 채널 관리
3. 일정 알림 기능

---
**작성일**: 2025-09-05 13:58
**우선순위**: Medium (기본 협업 후 추가)
**예상 시간**: 30분 (기본 구현)
