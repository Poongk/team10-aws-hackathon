# GMP CheckMaster AI - DynamoDB 테이블

# 1. 사용자 테이블
resource "aws_dynamodb_table" "users" {
  name           = "${var.project_name}-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  tags = {
    Name        = "GMP CheckMaster Users"
    Environment = var.environment
  }
}

# 2. 체크리스트 템플릿 테이블
resource "aws_dynamodb_table" "checklist_templates" {
  name           = "${var.project_name}-checklist-templates"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "template_id"

  attribute {
    name = "template_id"
    type = "S"
  }

  tags = {
    Name        = "GMP CheckMaster Checklist Templates"
    Environment = var.environment
  }
}

# 3. 체크리스트 기록 테이블
resource "aws_dynamodb_table" "checklist_records" {
  name           = "${var.project_name}-checklist-records"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "record_id"
  range_key      = "user_id"

  attribute {
    name = "record_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "created_date"
    type = "S"
  }

  global_secondary_index {
    name            = "UserDateIndex"
    hash_key        = "user_id"
    range_key       = "created_date"
    projection_type = "ALL"
  }

  tags = {
    Name        = "GMP CheckMaster Checklist Records"
    Environment = var.environment
  }
}

# 4. AI 판정 결과 테이블
resource "aws_dynamodb_table" "ai_judgments" {
  name           = "${var.project_name}-ai-judgments"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "judgment_id"

  attribute {
    name = "judgment_id"
    type = "S"
  }

  attribute {
    name = "record_id"
    type = "S"
  }

  global_secondary_index {
    name            = "RecordIndex"
    hash_key        = "record_id"
    projection_type = "ALL"
  }

  tags = {
    Name        = "GMP CheckMaster AI Judgments"
    Environment = var.environment
  }
}

# 5. QR 코드 테이블
resource "aws_dynamodb_table" "qr_codes" {
  name           = "${var.project_name}-qr-codes"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "qr_code"

  attribute {
    name = "qr_code"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name            = "UserIndex"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  tags = {
    Name        = "GMP CheckMaster QR Codes"
    Environment = var.environment
  }
}
# 6. 알림 테이블 (새로 추가)
resource "aws_dynamodb_table" "notifications" {
  name           = "${var.project_name}-notifications"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "notification_id"

  attribute {
    name = "notification_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  global_secondary_index {
    name               = "UserIndex"
    hash_key           = "user_id"
    range_key          = "created_at"
    projection_type    = "ALL"
  }

  tags = {
    Name        = "GMP CheckMaster Notifications"
    Environment = var.environment
  }
}
