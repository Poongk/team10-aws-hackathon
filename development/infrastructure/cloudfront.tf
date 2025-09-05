# CloudFront 배포로 HTTPS 지원

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "hello_world" {
  name                              = "hello-world-oac"
  description                       = "OAC for Hello World S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront 배포
resource "aws_cloudfront_distribution" "hello_world" {
  origin {
    domain_name              = data.aws_s3_bucket.hello_world.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.hello_world.id
    origin_id                = "S3-${data.aws_s3_bucket.hello_world.id}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  # 기본 캐시 동작
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${data.aws_s3_bucket.hello_world.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # 가격 클래스 (가장 저렴한 옵션)
  price_class = "PriceClass_100"

  # 지역 제한 없음
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL 인증서 (CloudFront 기본 인증서 사용)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # 커스텀 에러 페이지
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  # 403 에러도 인덱스로 리다이렉트
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  tags = {
    Name        = "Hello World HTTPS Distribution"
    Environment = var.environment
  }
}

# S3 버킷 정책 업데이트 (CloudFront 전용)
resource "aws_s3_bucket_policy" "hello_world_cloudfront" {
  bucket = data.aws_s3_bucket.hello_world.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${data.aws_s3_bucket.hello_world.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.hello_world.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_cloudfront_distribution.hello_world]
}

# S3 퍼블릭 액세스 차단 (CloudFront만 허용)
resource "aws_s3_bucket_public_access_block" "hello_world_secure" {
  bucket = data.aws_s3_bucket.hello_world.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  depends_on = [aws_cloudfront_distribution.hello_world]
}
