#!/bin/bash
cd /home/sjbaek/projects/aws/team10-aws-hackathon/development/frontend/gmp-app
nohup npm run dev > logs/dev-server.log 2>&1 &
echo "프론트엔드 서버가 백그라운드에서 실행 중입니다"
echo "PID: $!"
echo "로그 확인: tail -f logs/dev-server.log"
echo "서버 중지: pkill -f 'npm run dev'"
