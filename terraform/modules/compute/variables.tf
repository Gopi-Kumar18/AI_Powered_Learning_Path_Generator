variable "name_prefix" {
  type    = string
  default = "sals"
}

variable "ssh_public_key" {
  description = "Owner's SSH public key contents (e.g. the contents of id_ed25519.pub), imported as the key pair used by all 3 instances"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet ids (from the networking module). [0] hosts the proxy EC2, [1] hosts Jenkins."
  type        = list(string)
}

variable "app_private_subnet_ids" {
  description = "Private app-tier subnet ids (from the networking module). [0] hosts the app EC2."
  type        = list(string)
}

variable "proxy_sg_id" {
  type = string
}

variable "app_sg_id" {
  type = string
}

variable "jenkins_sg_id" {
  type = string
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

variable "ssm_parameter_path" {
  description = "SSM parameter path prefix the app EC2's role may read (trailing /* applied internally)"
  type        = string
  default     = "/sals/prod"
}
