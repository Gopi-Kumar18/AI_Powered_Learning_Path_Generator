variable "name_prefix" {
  description = "Prefix applied to all resource Name tags, e.g. \"sals\""
  type        = string
  default     = "sals"
}

variable "vpc_id" {
  description = "VPC id the security groups belong to (from the networking module)"
  type        = string
}

variable "owner_ip_cidr" {
  description = "Owner's own IP in CIDR form (e.g. \"203.0.113.4/32\"), allowed to reach Jenkins' UI/SSH"
  type        = string
}

variable "github_webhook_cidrs" {
  description = "GitHub's published webhook source CIDRs, allowed to reach Jenkins on 8080 for the push webhook. See https://api.github.com/meta (\"hooks\" key). Leave empty and rely on Poll SCM if you don't want to open this up."
  type        = list(string)
  default     = []
}
