# 최종 Lambda ZIP 생성
data "archive_file" "final_lambda_zip" {
  type        = "zip"
  source_file = "../backend/final-lambda/index.js"
  output_path = "../backend/final-lambda/final-lambda.zip"
}

# 최종 Lambda 함수 (DynamoDB 직접 연동)
resource "aws_lambda_function" "final_gmp_api" {
  filename         = data.archive_file.final_lambda_zip.output_path
  function_name    = "${var.project_name}-final-api"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.final_lambda_zip.output_base64sha256
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      NODE_ENV = var.environment
    }
  }
}

# 최종 API Gateway
resource "aws_api_gateway_rest_api" "final_gmp_api" {
  name        = "${var.project_name}-final-api"
  description = "GMP CheckMaster Final API with DynamoDB"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# 프록시 리소스
resource "aws_api_gateway_resource" "final_proxy" {
  rest_api_id = aws_api_gateway_rest_api.final_gmp_api.id
  parent_id   = aws_api_gateway_rest_api.final_gmp_api.root_resource_id
  path_part   = "{proxy+}"
}

# 프록시 메서드
resource "aws_api_gateway_method" "final_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.final_gmp_api.id
  resource_id   = aws_api_gateway_resource.final_proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

# 루트 메서드
resource "aws_api_gateway_method" "final_root" {
  rest_api_id   = aws_api_gateway_rest_api.final_gmp_api.id
  resource_id   = aws_api_gateway_rest_api.final_gmp_api.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

# Lambda 통합
resource "aws_api_gateway_integration" "final_lambda_proxy" {
  rest_api_id = aws_api_gateway_rest_api.final_gmp_api.id
  resource_id = aws_api_gateway_resource.final_proxy.id
  http_method = aws_api_gateway_method.final_proxy.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.final_gmp_api.invoke_arn
}

resource "aws_api_gateway_integration" "final_root_integration" {
  rest_api_id = aws_api_gateway_rest_api.final_gmp_api.id
  resource_id = aws_api_gateway_rest_api.final_gmp_api.root_resource_id
  http_method = aws_api_gateway_method.final_root.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.final_gmp_api.invoke_arn
}

# Lambda 권한
resource "aws_lambda_permission" "final_api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.final_gmp_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.final_gmp_api.execution_arn}/*/*"
}

# 배포
resource "aws_api_gateway_deployment" "final_gmp_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.final_lambda_proxy,
    aws_api_gateway_integration.final_root_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.final_gmp_api.id
  stage_name  = var.environment
}
