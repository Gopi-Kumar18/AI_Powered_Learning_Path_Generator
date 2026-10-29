variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "name_prefix" {
  type    = string
  default = "sals"
}

variable "enable_nat" {
  description = "Set false to tear down the NAT gateway (and its EIP) when the infra is idle, to save cost."
  type        = bool
  default     = true
}

variable "owner_ip_cidr" {
  description = "Owner's own IP in CIDR form, e.g. \"203.0.113.4/32\". Required — no safe default."
  type        = string
}

variable "github_webhook_cidrs" {
  description = "GitHub's published webhook CIDRs (https://api.github.com/meta, \"hooks\" key). Leave empty to rely on Poll SCM instead of a live webhook."
  type        = list(string)
  default     = []
}

variable "ssh_public_key" {
  description = "Contents of the owner's SSH public key, imported as the shared key pair for all 3 instances."
  type        = string
}

variable "proxy_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "app_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "jenkins_instance_type" {
  type    = string
  default = "t3.medium"
}
