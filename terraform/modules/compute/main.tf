data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_key_pair" "this" {
  key_name   = "${var.name_prefix}-key"
  public_key = var.ssh_public_key
}

# --- KMS + IAM for the app EC2's SSM access (only the app EC2 may read /sals/prod/*) ---

resource "aws_kms_key" "ssm" {
  description             = "Encrypts the /sals/prod/* SSM SecureString parameters"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "${var.name_prefix}-ssm-key"
  }
}

data "aws_caller_identity" "current" {}

resource "aws_iam_role" "app" {
  name = "${var.name_prefix}-app-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "app_ssm" {
  name = "${var.name_prefix}-app-ssm-read"
  role = aws_iam_role.app.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
        ]
        Resource = "arn:aws:ssm:*:${data.aws_caller_identity.current.account_id}:parameter${var.ssm_parameter_path}/*"
      },
      {
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = aws_kms_key.ssm.arn
      },
    ]
  })
}

resource "aws_iam_instance_profile" "app" {
  name = "${var.name_prefix}-app-ec2-profile"
  role = aws_iam_role.app.name
}

# --- Proxy EC2 (public, Elastic IP) ---

resource "aws_instance" "proxy" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.proxy_instance_type
  subnet_id              = var.public_subnet_ids[0]
  vpc_security_group_ids = [var.proxy_sg_id]
  key_name               = aws_key_pair.this.key_name
  user_data              = file("${path.module}/user_data/proxy.sh")

  tags = {
    Name = "${var.name_prefix}-proxy"
  }
}

resource "aws_eip" "proxy" {
  domain   = "vpc"
  instance = aws_instance.proxy.id

  tags = {
    Name = "${var.name_prefix}-proxy-eip"
  }
}

# --- App EC2 (private, 3 containers via Docker Compose) ---

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.app_instance_type
  subnet_id              = var.app_private_subnet_ids[0]
  vpc_security_group_ids = [var.app_sg_id]
  key_name               = aws_key_pair.this.key_name
  iam_instance_profile   = aws_iam_instance_profile.app.name
  user_data              = file("${path.module}/user_data/app.sh")

  tags = {
    Name = "${var.name_prefix}-app"
  }
}

# --- Jenkins EC2 (public, no EIP — its IP isn't referenced anywhere, so it can float) ---

resource "aws_instance" "jenkins" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.jenkins_instance_type
  subnet_id              = var.public_subnet_ids[length(var.public_subnet_ids) > 1 ? 1 : 0]
  vpc_security_group_ids = [var.jenkins_sg_id]
  key_name               = aws_key_pair.this.key_name
  user_data              = file("${path.module}/user_data/jenkins.sh")

  tags = {
    Name = "${var.name_prefix}-jenkins"
  }
}
