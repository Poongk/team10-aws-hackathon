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

# S3 버킷 퍼블릭 액세스 설정
resource "aws_s3_bucket_public_access_block" "hello_world" {
  bucket = data.aws_s3_bucket.hello_world.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 버킷 정책
resource "aws_s3_bucket_policy" "hello_world" {
  bucket = data.aws_s3_bucket.hello_world.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${data.aws_s3_bucket.hello_world.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.hello_world]
}
