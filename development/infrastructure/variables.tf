variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "프로젝트 이름"
  type        = string
  default     = "gmp-checkmaster"
}

variable "environment" {
  description = "환경 (dev, prod)"
  type        = string
  default     = "dev"
}
