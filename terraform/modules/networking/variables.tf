variable "name_prefix" {
  description = "Prefix applied to all resource Name tags, e.g. \"sals\""
  type        = string
  default     = "sals"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones to spread subnets across (exactly 2 expected)"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDRs for the public subnets (proxy EC2, NAT gateway, Jenkins EC2), one per AZ"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "app_private_subnet_cidrs" {
  description = "CIDRs for the private app-tier subnets (app EC2), one per AZ"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "data_private_subnet_cidrs" {
  description = "CIDRs for the private data-tier subnets (RDS, DocumentDB), one per AZ"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "enable_nat" {
  description = "Whether to create the NAT gateway (and its EIP). Set to false to save cost while infra is idle; the app-private route table simply has no internet route when false."
  type        = bool
  default     = true
}
