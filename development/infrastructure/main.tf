terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 기존 S3 버킷 사용
data "aws_s3_bucket" "hello_world" {
  bucket = "drug-qrew-test-bucket-hackathon"
}

# S3 버킷 웹사이트 설정
resource "aws_s3_bucket_website_configuration" "hello_world" {
  bucket = data.aws_s3_bucket.hello_world.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# S3 버킷 퍼블릭 액세스 설정 (CloudFront로 대체됨)
# resource "aws_s3_bucket_public_access_block" "hello_world" {
#   bucket = data.aws_s3_bucket.hello_world.id
#   block_public_acls       = false
#   block_public_policy     = false
#   ignore_public_acls      = false
#   restrict_public_buckets = false
# }

# S3 버킷 정책 (CloudFront로 대체됨)
# resource "aws_s3_bucket_policy" "hello_world" {
#   bucket = data.aws_s3_bucket.hello_world.id
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Sid       = "PublicReadGetObject"
#         Effect    = "Allow"
#         Principal = "*"
#         Action    = "s3:GetObject"
#         Resource  = "${data.aws_s3_bucket.hello_world.arn}/*"
#       }
#     ]
#   })
#   depends_on = [aws_s3_bucket_public_access_block.hello_world]
# }

# API 문서 HTML 파일 업로드
resource "aws_s3_object" "api_docs" {
  bucket       = data.aws_s3_bucket.hello_world.id
  key          = "api-docs/index.html"
  source       = "../api-docs/api-docs.html"
  content_type = "text/html"
  etag         = filemd5("../api-docs/api-docs.html")
}

# Hello World 카메라 웹사이트 업로드 (새로 추가)
resource "aws_s3_object" "hello_world_camera" {
  bucket       = data.aws_s3_bucket.hello_world.id
  key          = "hello-world/index.html"
  source       = "../frontend/hello-world-camera.html"
  content_type = "text/html"
  etag         = filemd5("../frontend/hello-world-camera.html")
}

# 메인 인덱스 페이지 (새로 추가)
resource "aws_s3_object" "main_index" {
  bucket       = data.aws_s3_bucket.hello_world.id
  key          = "index.html"
  content      = <<EOF
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎉 GMP CheckMaster AI - 해커톤 데모</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            text-align: center;
            max-width: 600px;
        }
        h1 { color: #333; margin-bottom: 20px; }
        .link-button {
            display: inline-block;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            margin: 10px;
            font-size: 1.1em;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .link-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        .description {
            color: #666;
            margin: 20px 0;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 GMP CheckMaster AI</h1>
        <p class="description">
            AWS 해커톤 2025 - Team 10 "drug qrew"<br>
            제약업계 GMP 규정 준수를 위한 지능형 체크리스트 관리 시스템
        </p>
        
        <div>
            <a href="/hello-world/" class="link-button">
                🩹 상처 AI 분석기
            </a>
            <a href="/api-docs/" class="link-button">
                📚 API 문서
            </a>
        </div>
        
        <div class="description" style="margin-top: 30px;">
            <strong>🚀 데모 기능:</strong><br>
            • 상처 사진 촬영 → AI 심각도 분석<br>
            • 실시간 Slack 긴급 알림 전송<br>
            • 26개 완전한 REST API<br>
            • DynamoDB 실시간 연동
        </div>
    </div>
</body>
</html>
EOF
  content_type = "text/html"
}
