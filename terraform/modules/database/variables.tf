variable "name_prefix" {
  type    = string
  default = "sals"
}

variable "data_private_subnet_ids" {
  description = "Data-tier private subnet ids (from the networking module)"
  type        = list(string)
}

variable "rds_sg_id" {
  description = "Security group id allowing 3306 from the app tier (from the security module)"
  type        = string
}

variable "docdb_sg_id" {
  description = "Security group id allowing 27017 from the app tier (from the security module)"
  type        = string
}

variable "mysql_db_name" {
  type    = string
  default = "sals"
}

variable "mysql_username" {
  type    = string
  default = "sals_app"
}

variable "mysql_instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "docdb_username" {
  type    = string
  default = "sals_app"
}

variable "docdb_instance_class" {
  type    = string
  default = "db.t3.medium"
}
