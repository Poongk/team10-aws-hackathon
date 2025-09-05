#!/usr/bin/env python3
"""
GMP CheckMaster AI - 프론트엔드 자동 스크린샷 도구
브라우저를 자동으로 제어해서 각 페이지의 스크린샷을 촬영
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import os
import sys
import argparse
from datetime import datetime

class GMPScreenshotTool:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.setup_driver()
        
    def setup_driver(self):
        """Chrome 드라이버 설정 (WSL 환경 최적화)"""
        chrome_options = Options()
        # WSL 환경을 위한 headless 모드 설정
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1440,900")  # 더 큰 화면으로 변경
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--disable-features=VizDisplayCompositor")
        chrome_options.add_argument("--remote-debugging-port=9222")
        # SSL 인증서 무시 (HTTPS 로컬 개발용)
        chrome_options.add_argument("--ignore-ssl-errors")
        chrome_options.add_argument("--ignore-certificate-errors")
        chrome_options.add_argument("--allow-running-insecure-content")
        chrome_options.add_argument("--disable-extensions")
        # 한글 폰트 렌더링 개선
        chrome_options.add_argument("--lang=ko-KR")
        chrome_options.add_argument("--force-device-scale-factor=1")
        chrome_options.add_argument("--disable-font-subpixel-positioning")
        
        # 로컬 ChromeDriver 경로 사용
        chromedriver_path = os.path.join(os.path.dirname(__file__), "chromedriver-linux64", "chromedriver")
        if os.path.exists(chromedriver_path):
            service = Service(chromedriver_path)
        else:
            # fallback to webdriver-manager
            service = Service(ChromeDriverManager().install())
        
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        
    def take_screenshot(self, page_name, url_path=""):
        """특정 페이지의 스크린샷 촬영"""
        try:
            full_url = f"{self.base_url}{url_path}"
            print(f"📸 스크린샷 촬영 중: {page_name} ({full_url})")
            
            self.driver.get(full_url)
            time.sleep(2)  # 페이지 로딩 대기
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"screenshots/{page_name}_{timestamp}.png"
            
            self.driver.save_screenshot(filename)
            print(f"✅ 저장 완료: {filename}")
            return filename
            
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            return None
    
    def take_single_screenshot(self, url, filename=None):
        """단일 URL 스크린샷 촬영"""
        try:
            print(f"📸 스크린샷 촬영 중: {url}")
            
            self.driver.get(url)
            time.sleep(2)  # 페이지 로딩 대기
            
            # 페이지 전체 높이로 윈도우 크기 조정
            total_height = self.driver.execute_script("return document.body.scrollHeight")
            self.driver.set_window_size(1440, total_height + 100)  # 여유 공간 추가
            
            # 스크롤을 맨 아래로 내린 후 다시 맨 위로
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1)
            
            if not filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                # URL을 파일명으로 사용 가능하게 변환
                url_part = url.replace("://", "_").replace("/", "_").replace("?", "_").replace("&", "_").replace("=", "_")
                if len(url_part) > 50:  # 너무 긴 경우 축약
                    url_part = url_part[:50]
                filename = f"screenshots/{url_part}_{timestamp}.png"
            
            self.driver.save_screenshot(filename)
            print(f"✅ 저장 완료: {filename}")
            return filename
            
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            return None
    
    def capture_all_pages(self):
        """모든 페이지 스크린샷 촬영"""
        pages = [
            ("01_로그인화면", "/"),
            ("02_작업자대시보드", "/dashboard"),
            ("03_체크리스트화면", "/checklist"),
            ("04_결과화면", "/result"),
            ("07_QR스캐너화면", "/scanner"),
            ("08_출입결과화면", "/access-result")
        ]
        
        screenshots = []
        for page_name, url_path in pages:
            filename = self.take_screenshot(page_name, url_path)
            if filename:
                screenshots.append(filename)
                
        return screenshots
    
    def capture_user_flow(self):
        """사용자 플로우 시뮬레이션 + 스크린샷"""
        print("🎭 해커톤 시연 플로우 시뮬레이션 시작")
        
        # 1. 로그인 페이지
        self.take_screenshot("01_로그인_초기화면", "/")
        
        # 2. 데모 계정 선택 (JavaScript 실행)
        self.driver.execute_script("document.querySelector('.btn-primary').click();")
        time.sleep(1)
        self.take_screenshot("01_로그인_호버상태", "/")
        
        # 3. 대시보드
        self.driver.get(f"{self.base_url}/dashboard")
        time.sleep(2)
        self.take_screenshot("02_대시보드_메인", "/dashboard")
        
        # 4. 체크리스트
        self.driver.get(f"{self.base_url}/checklist")
        time.sleep(2)
        self.take_screenshot("03_체크리스트_빈폼", "/checklist")
        
        print("✅ 사용자 플로우 스크린샷 완료")
    
    def get_console_logs(self):
        """브라우저 콘솔 로그 수집"""
        logs = self.driver.get_log('browser')
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        with open(f"screenshots/console_logs_{timestamp}.txt", "w") as f:
            f.write("=== GMP CheckMaster AI 콘솔 로그 ===\n")
            f.write(f"수집 시간: {datetime.now()}\n")
            f.write(f"URL: {self.driver.current_url}\n\n")
            
            for log in logs:
                f.write(f"[{log['level']}] {log['message']}\n")
        
        print(f"📝 콘솔 로그 저장 완료: console_logs_{timestamp}.txt")
    
    def close(self):
        """드라이버 종료"""
        self.driver.quit()

def main():
    parser = argparse.ArgumentParser(description='GMP CheckMaster AI 스크린샷 도구')
    parser.add_argument('--url', '-u', type=str, help='스크린샷을 촬영할 URL')
    parser.add_argument('--base-url', '-b', type=str, default='http://localhost:3001', 
                       help='기본 URL (기본값: http://localhost:3001)')
    parser.add_argument('--all', '-a', action='store_true', help='모든 페이지 스크린샷 촬영')
    parser.add_argument('--flow', '-f', action='store_true', help='사용자 플로우 시뮬레이션')
    parser.add_argument('--console', '-c', action='store_true', help='콘솔 로그 수집')
    parser.add_argument('--output', '-o', type=str, help='출력 파일명')
    
    args = parser.parse_args()
    
    tool = GMPScreenshotTool(base_url=args.base_url)
    
    try:
        if args.url:
            # 단일 URL 스크린샷
            tool.take_single_screenshot(args.url, args.output)
        elif args.all:
            # 모든 페이지 스크린샷
            screenshots = tool.capture_all_pages()
            print(f"🎉 완료! {len(screenshots)}개 스크린샷 촬영")
        elif args.flow:
            # 사용자 플로우 시뮬레이션
            tool.capture_user_flow()
        else:
            # 기본: 모든 페이지 스크린샷
            print("🚀 GMP CheckMaster AI 스크린샷 도구 시작")
            screenshots = tool.capture_all_pages()
            print(f"🎉 완료! {len(screenshots)}개 스크린샷 촬영")
        
        if args.console:
            tool.get_console_logs()
            
    except Exception as e:
        print(f"❌ 전체 오류: {e}")
    finally:
        tool.close()

if __name__ == "__main__":
    main()
