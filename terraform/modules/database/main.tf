# --- MySQL (RDS) ---

resource "random_password" "mysql" {
  length  = 20
  special = false # JDBC URLs break on special characters
}

resource "aws_db_subnet_group" "mysql" {
  name       = "${var.name_prefix}-mysql-subnet-group"
  subnet_ids = var.data_private_subnet_ids

  tags = {
    Name = "${var.name_prefix}-mysql-subnet-group"
  }
}

resource "aws_db_instance" "mysql" {
  identifier             = "${var.name_prefix}-mysql"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = var.mysql_instance_class
  allocated_storage      = 20
  db_name                = var.mysql_db_name
  username               = var.mysql_username
  password               = random_password.mysql.result
  db_subnet_group_name   = aws_db_subnet_group.mysql.name
  vpc_security_group_ids = [var.rds_sg_id]
  publicly_accessible    = false
  multi_az               = false
  skip_final_snapshot    = true
  apply_immediately      = true

  tags = {
    Name = "${var.name_prefix}-mysql"
  }
}

# --- DocumentDB ---
# TLS disabled on the cluster parameter group: mini-project scope only — accepted
# trade-off since the DocumentDB Java driver compatibility story around a custom
# truststore is more hardening than this assignment needs. Revisit in P6.

resource "random_password" "docdb" {
  length  = 20
  special = false # Mongo connection string breaks on special characters
}

resource "aws_docdb_subnet_group" "this" {
  name       = "${var.name_prefix}-docdb-subnet-group"
  subnet_ids = var.data_private_subnet_ids

  tags = {
    Name = "${var.name_prefix}-docdb-subnet-group"
  }
}

resource "aws_docdb_cluster_parameter_group" "this" {
  name        = "${var.name_prefix}-docdb-params"
  family      = "docdb5.0"
  description = "TLS disabled for this mini-project (Spring Data MongoDB 5 / Java driver 5.x compatibility)"

  parameter {
    name  = "tls"
    value = "disabled"
  }
}

resource "aws_docdb_cluster" "this" {
  cluster_identifier              = "${var.name_prefix}-docdb"
  engine                          = "docdb"
  master_username                 = var.docdb_username
  master_password                 = random_password.docdb.result
  db_subnet_group_name            = aws_docdb_subnet_group.this.name
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.this.name
  vpc_security_group_ids          = [var.docdb_sg_id]
  skip_final_snapshot             = true
  apply_immediately               = true

  tags = {
    Name = "${var.name_prefix}-docdb"
  }
}

resource "aws_docdb_cluster_instance" "this" {
  identifier         = "${var.name_prefix}-docdb-instance-1"
  cluster_identifier = aws_docdb_cluster.this.id
  instance_class     = var.docdb_instance_class

  tags = {
    Name = "${var.name_prefix}-docdb-instance-1"
  }
}
