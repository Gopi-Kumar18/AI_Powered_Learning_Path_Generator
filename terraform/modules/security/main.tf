# Jenkins first: its rules only depend on CIDRs, not on the other SGs.
resource "aws_security_group" "jenkins" {
  name        = "${var.name_prefix}-jenkins-sg"
  description = "Jenkins EC2: UI/SSH from the owner, webhook from GitHub"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH from owner"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.owner_ip_cidr]
  }

  ingress {
    description = "Jenkins UI from owner"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.owner_ip_cidr]
  }

  dynamic "ingress" {
    for_each = length(var.github_webhook_cidrs) > 0 ? [1] : []
    content {
      description = "GitHub webhook"
      from_port   = 8080
      to_port     = 8080
      protocol    = "tcp"
      cidr_blocks = var.github_webhook_cidrs
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-jenkins-sg"
  }
}

# Proxy EC2: public 80/443, plus SSH from Jenkins.
resource "aws_security_group" "proxy" {
  name        = "${var.name_prefix}-proxy-sg"
  description = "Reverse-proxy EC2: public HTTP/HTTPS, SSH from Jenkins"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "SSH from Jenkins"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.jenkins.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-proxy-sg"
  }
}

# App EC2: HTTP/app port only from the proxy, SSH only from Jenkins.
resource "aws_security_group" "app" {
  name        = "${var.name_prefix}-app-sg"
  description = "App EC2 (frontend+core-backend+ai-backend containers): reachable only from the proxy and Jenkins"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Frontend container from proxy"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.proxy.id]
  }

  ingress {
    description     = "Spring core-backend from proxy"
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.proxy.id]
  }

  ingress {
    description     = "SSH from Jenkins"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.jenkins.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-app-sg"
  }
}

# RDS MySQL: reachable only from the app EC2.
resource "aws_security_group" "rds" {
  name        = "${var.name_prefix}-rds-sg"
  description = "RDS MySQL: reachable only from the app EC2"
  vpc_id      = var.vpc_id

  ingress {
    description     = "MySQL from app"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-rds-sg"
  }
}

# DocumentDB: reachable only from the app EC2.
resource "aws_security_group" "docdb" {
  name        = "${var.name_prefix}-docdb-sg"
  description = "DocumentDB: reachable only from the app EC2"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Mongo from app"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-docdb-sg"
  }
}
