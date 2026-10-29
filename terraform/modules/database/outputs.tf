output "mysql_endpoint" {
  value = aws_db_instance.mysql.address
}

output "mysql_port" {
  value = aws_db_instance.mysql.port
}

output "mysql_db_name" {
  value = var.mysql_db_name
}

output "mysql_username" {
  value = var.mysql_username
}

output "mysql_password" {
  value     = random_password.mysql.result
  sensitive = true
}

output "docdb_endpoint" {
  value = aws_docdb_cluster.this.endpoint
}

output "docdb_port" {
  value = aws_docdb_cluster.this.port
}

output "docdb_username" {
  value = var.docdb_username
}

output "docdb_password" {
  value     = random_password.docdb.result
  sensitive = true
}
