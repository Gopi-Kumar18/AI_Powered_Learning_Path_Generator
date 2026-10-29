output "proxy_public_ip" {
  value = aws_eip.proxy.public_ip
}

output "app_private_ip" {
  value = aws_instance.app.private_ip
}

output "jenkins_public_ip" {
  value = aws_instance.jenkins.public_ip
}

output "ssm_kms_key_id" {
  value = aws_kms_key.ssm.key_id
}

output "ssm_kms_key_arn" {
  value = aws_kms_key.ssm.arn
}

output "app_iam_role_name" {
  value = aws_iam_role.app.name
}
