# GMP CheckMaster AI - 백엔드 인프라 (Terraform)

# Lambda 실행 역할
resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Lambda 기본 정책 연결
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_execution_role.name
}

# 라우터 Lambda 함수 ZIP 파일 생성 (모든 핸들러 포함)
data "archive_file" "router_zip" {
  type        = "zip"
  source_dir  = "../backend/gmp-checkmaster"
  output_path = "../backend/gmp-checkmaster/router.zip"
  
  excludes = [
    ".aws-sam",
    "*.zip",
    "node_modules",
    "test-*.js",
    "events"
  ]
}

# 단일 라우터 Lambda 함수 (모든 API 처리)
resource "aws_lambda_function" "gmp_router" {
  filename         = data.archive_file.router_zip.output_path
  function_name    = "${var.project_name}-router"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "router-handler/index.handler"
  source_code_hash = data.archive_file.router_zip.output_base64sha256
  runtime         = "nodejs18.x"
  timeout         = 30
  
  environment {
    variables = {
      NODE_ENV    = var.environment
      CORS_ORIGIN = "*"
    }
  }
}

# API Gateway
resource "aws_api_gateway_rest_api" "gmp_api" {
  name        = "${var.project_name}-api"
  description = "GMP CheckMaster AI API"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway 프록시 리소스 (모든 경로 처리)
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.gmp_api.id
  parent_id   = aws_api_gateway_rest_api.gmp_api.root_resource_id
  path_part   = "{proxy+}"
}

# API Gateway 프록시 메서드 (모든 HTTP 메서드)
resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.gmp_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Lambda 통합 (라우터가 모든 요청 처리)
resource "aws_api_gateway_integration" "lambda_proxy" {
  rest_api_id = aws_api_gateway_rest_api.gmp_api.id
  resource_id = aws_api_gateway_method.proxy.resource_id
  http_method = aws_api_gateway_method.proxy.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.gmp_router.invoke_arn
}

# 루트 경로 처리
resource "aws_api_gateway_method" "root" {
  rest_api_id   = aws_api_gateway_rest_api.gmp_api.id
  resource_id   = aws_api_gateway_rest_api.gmp_api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "root_integration" {
  rest_api_id = aws_api_gateway_rest_api.gmp_api.id
  resource_id = aws_api_gateway_method.root.resource_id
  http_method = aws_api_gateway_method.root.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.gmp_router.invoke_arn
}

# CORS 설정
resource "aws_api_gateway_method" "cors_method" {
  rest_api_id   = aws_api_gateway_rest_api.gmp_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "cors_integration" {
  rest_api_id = aws_api_gateway_rest_api.gmp_api.id
  resource_id = aws_api_gateway_method.cors_method.resource_id
  http_method = aws_api_gateway_method.cors_method.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "cors_method_response" {
  rest_api_id = aws_api_gateway_rest_api.gmp_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.cors_method.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "cors_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.gmp_api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.cors_method.http_method
  status_code = aws_api_gateway_method_response.cors_method_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Lambda 권한 (API Gateway 호출 허용)
resource "aws_lambda_permission" "api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.gmp_router.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.gmp_api.execution_arn}/*/*"
}

# API Gateway 배포
resource "aws_api_gateway_deployment" "gmp_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_proxy,
    aws_api_gateway_integration.root_integration,
    aws_api_gateway_integration.cors_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.gmp_api.id
  stage_name  = var.environment
}
