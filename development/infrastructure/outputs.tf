output "bucket_name" {
  description = "S3 버킷 이름"
  value       = data.aws_s3_bucket.hello_world.id
}

output "website_endpoint" {
  description = "S3 웹사이트 엔드포인트"
  value       = aws_s3_bucket_website_configuration.hello_world.website_endpoint
}

output "website_url" {
  description = "프론트엔드 웹사이트 URL"
  value       = "http://${aws_s3_bucket_website_configuration.hello_world.website_endpoint}"
}

output "api_gateway_url" {
  description = "백엔드 API Gateway URL (기존)"
  value       = aws_api_gateway_deployment.gmp_api_deployment.invoke_url
}

output "simple_api_gateway_url" {
  description = "백엔드 Simple API Gateway URL"
  value       = aws_api_gateway_deployment.simple_gmp_api_deployment.invoke_url
}

output "final_api_gateway_url" {
  description = "🔥 최종 DynamoDB 연동 API URL"
  value       = aws_api_gateway_deployment.final_gmp_api_deployment.invoke_url
}

output "lambda_function_name" {
  description = "배포된 Lambda 함수 이름"
  value       = aws_lambda_function.gmp_router.function_name
}

output "final_lambda_function_name" {
  description = "🔥 최종 DynamoDB 연동 Lambda 함수 이름"
  value       = aws_lambda_function.final_gmp_api.function_name
}

output "api_docs_url" {
  description = "API 문서 웹페이지 URL"
  value       = "http://${aws_s3_bucket_website_configuration.hello_world.website_endpoint}/api-docs/"
}

output "dynamodb_tables" {
  description = "생성된 DynamoDB 테이블들"
  value = {
    users               = aws_dynamodb_table.users.name
    checklist_templates = aws_dynamodb_table.checklist_templates.name
    checklist_records   = aws_dynamodb_table.checklist_records.name
    ai_judgments        = aws_dynamodb_table.ai_judgments.name
    qr_codes           = aws_dynamodb_table.qr_codes.name
    notifications      = aws_dynamodb_table.notifications.name
  }
}

# HTTPS URL 추가
output "https_website_url" {
  description = "CloudFront HTTPS 웹사이트 URL"
  value       = "https://${aws_cloudfront_distribution.hello_world.domain_name}"
}

output "cloudfront_domain" {
  description = "CloudFront 도메인"
  value       = aws_cloudfront_distribution.hello_world.domain_name
}

output "hello_world_https_url" {
  description = "Hello World AI 분석기 HTTPS URL"
  value       = "https://${aws_cloudfront_distribution.hello_world.domain_name}/hello-world/"
}
