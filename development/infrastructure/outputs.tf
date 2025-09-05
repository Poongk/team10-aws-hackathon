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
  description = "백엔드 API Gateway URL"
  value       = aws_api_gateway_deployment.gmp_api_deployment.invoke_url
}

output "lambda_function_name" {
  description = "배포된 Lambda 함수 이름"
  value       = aws_lambda_function.gmp_router.function_name
}

output "api_docs_url" {
  description = "API 문서 웹페이지 URL"
  value       = "http://${aws_s3_bucket_website_configuration.hello_world.website_endpoint}/api-docs/"
}
