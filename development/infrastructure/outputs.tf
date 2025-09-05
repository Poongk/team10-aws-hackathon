output "bucket_name" {
  description = "S3 버킷 이름"
  value       = data.aws_s3_bucket.hello_world.id
}

output "website_endpoint" {
  description = "S3 웹사이트 엔드포인트"
  value       = aws_s3_bucket_website_configuration.hello_world.website_endpoint
}

output "website_url" {
  description = "웹사이트 URL"
  value       = "http://${aws_s3_bucket_website_configuration.hello_world.website_endpoint}"
}
