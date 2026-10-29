output "proxy_public_ip" {
  value = module.compute.proxy_public_ip
}

output "app_private_ip" {
  value = module.compute.app_private_ip
}

output "jenkins_public_ip" {
  value = module.compute.jenkins_public_ip
}

output "mysql_endpoint" {
  value = module.database.mysql_endpoint
}

output "docdb_endpoint" {
  value = module.database.docdb_endpoint
}

output "vpc_id" {
  value = module.networking.vpc_id
}
