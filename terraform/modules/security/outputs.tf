output "proxy_sg_id" {
  value = aws_security_group.proxy.id
}

output "app_sg_id" {
  value = aws_security_group.app.id
}

output "rds_sg_id" {
  value = aws_security_group.rds.id
}

output "docdb_sg_id" {
  value = aws_security_group.docdb.id
}

output "jenkins_sg_id" {
  value = aws_security_group.jenkins.id
}
