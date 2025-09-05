# 단일 파일 Lambda ZIP 생성
data "archive_file" "simple_lambda_zip" {
  type        = "zip"
  source_file = "../backend/simple-lambda/index.js"
  output_path = "../backend/simple-lambda/simple-lambda.zip"
}

# 새로운 단일 Lambda 함수
resource "aws_lambda_function" "simple_gmp_api" {
  filename         = data.archive_file.simple_lambda_zip.output_path
  function_name    = "${var.project_name}-simple-api"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.simple_lambda_zip.output_base64sha256
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = {
      NODE_ENV                    = var.environment
      USERS_TABLE                = aws_dynamodb_table.users.name
      CHECKLIST_TEMPLATES_TABLE  = aws_dynamodb_table.checklist_templates.name
      CHECKLIST_RECORDS_TABLE    = aws_dynamodb_table.checklist_records.name
      AI_JUDGMENTS_TABLE         = aws_dynamodb_table.ai_judgments.name
      QR_CODES_TABLE            = aws_dynamodb_table.qr_codes.name
    }
  }
}

# 새로운 API Gateway
resource "aws_api_gateway_rest_api" "simple_gmp_api" {
  name        = "${var.project_name}-simple-api"
  description = "GMP CheckMaster Simple API"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# 프록시 리소스
resource "aws_api_gateway_resource" "simple_proxy" {
  rest_api_id = aws_api_gateway_rest_api.simple_gmp_api.id
  parent_id   = aws_api_gateway_rest_api.simple_gmp_api.root_resource_id
  path_part   = "{proxy+}"
}

# 프록시 메서드
resource "aws_api_gateway_method" "simple_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.simple_gmp_api.id
  resource_id   = aws_api_gateway_resource.simple_proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

# 루트 메서드
resource "aws_api_gateway_method" "simple_root" {
  rest_api_id   = aws_api_gateway_rest_api.simple_gmp_api.id
  resource_id   = aws_api_gateway_rest_api.simple_gmp_api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# Lambda 통합
resource "aws_api_gateway_integration" "simple_lambda_proxy" {
  rest_api_id = aws_api_gateway_rest_api.simple_gmp_api.id
  resource_id = aws_api_gateway_resource.simple_proxy.id
  http_method = aws_api_gateway_method.simple_proxy.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.simple_gmp_api.invoke_arn
}

resource "aws_api_gateway_integration" "simple_root_integration" {
  rest_api_id = aws_api_gateway_rest_api.simple_gmp_api.id
  resource_id = aws_api_gateway_rest_api.simple_gmp_api.root_resource_id
  http_method = aws_api_gateway_method.simple_root.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.simple_gmp_api.invoke_arn
}

# Lambda 권한
resource "aws_lambda_permission" "simple_api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.simple_gmp_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.simple_gmp_api.execution_arn}/*/*"
}

# 배포
resource "aws_api_gateway_deployment" "simple_gmp_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.simple_lambda_proxy,
    aws_api_gateway_integration.simple_root_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.simple_gmp_api.id
  stage_name  = var.environment
}
