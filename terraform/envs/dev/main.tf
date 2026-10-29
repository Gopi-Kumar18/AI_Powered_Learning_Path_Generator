module "networking" {
  source      = "../../modules/networking"
  name_prefix = var.name_prefix
  enable_nat  = var.enable_nat
}

module "security" {
  source               = "../../modules/security"
  name_prefix          = var.name_prefix
  vpc_id               = module.networking.vpc_id
  owner_ip_cidr        = var.owner_ip_cidr
  github_webhook_cidrs = var.github_webhook_cidrs
}

module "database" {
  source                  = "../../modules/database"
  name_prefix             = var.name_prefix
  data_private_subnet_ids = module.networking.data_private_subnet_ids
  rds_sg_id               = module.security.rds_sg_id
  docdb_sg_id             = module.security.docdb_sg_id
}

module "compute" {
  source                 = "../../modules/compute"
  name_prefix            = var.name_prefix
  ssh_public_key         = var.ssh_public_key
  public_subnet_ids      = module.networking.public_subnet_ids
  app_private_subnet_ids = module.networking.app_private_subnet_ids
  proxy_sg_id            = module.security.proxy_sg_id
  app_sg_id              = module.security.app_sg_id
  jenkins_sg_id          = module.security.jenkins_sg_id
  proxy_instance_type    = var.proxy_instance_type
  app_instance_type      = var.app_instance_type
  jenkins_instance_type  = var.jenkins_instance_type
}

locals {
  mysql_jdbc_url = "jdbc:mysql://${module.database.mysql_endpoint}:${module.database.mysql_port}/${module.database.mysql_db_name}?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC"
  mongo_uri      = "mongodb://${module.database.docdb_username}:${module.database.docdb_password}@${module.database.docdb_endpoint}:${module.database.docdb_port}/${module.database.mysql_db_name}?authSource=admin&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
  proxy_url      = "https://${module.compute.proxy_public_ip}"
}

# --- SSM SecureStrings Terraform can derive on its own (RDS/DocumentDB creds + the
# proxy's public URL). GEMINI_API_KEY/APP_JWT_SECRET/SPRING_MAIL_* are entered once
# by hand via `aws ssm put-parameter` — see docs/DEPLOYMENT.md — and are NOT managed
# here, so a `terraform apply` never needs to see those values. ---

resource "aws_ssm_parameter" "datasource_url" {
  name   = "/sals/prod/SPRING_DATASOURCE_URL"
  type   = "SecureString"
  key_id = module.compute.ssm_kms_key_id
  value  = local.mysql_jdbc_url
}

resource "aws_ssm_parameter" "datasource_username" {
  name   = "/sals/prod/SPRING_DATASOURCE_USERNAME"
  type   = "SecureString"
  key_id = module.compute.ssm_kms_key_id
  value  = module.database.mysql_username
}

resource "aws_ssm_parameter" "datasource_password" {
  name   = "/sals/prod/SPRING_DATASOURCE_PASSWORD"
  type   = "SecureString"
  key_id = module.compute.ssm_kms_key_id
  value  = module.database.mysql_password
}

resource "aws_ssm_parameter" "mongodb_uri" {
  name   = "/sals/prod/SPRING_DATA_MONGODB_URI"
  type   = "SecureString"
  key_id = module.compute.ssm_kms_key_id
  value  = local.mongo_uri
}

resource "aws_ssm_parameter" "vite_fe_url" {
  name   = "/sals/prod/VITE_FE_URL"
  type   = "SecureString"
  key_id = module.compute.ssm_kms_key_id
  value  = local.proxy_url
}
