#!/bin/bash
set -euxo pipefail

dnf install -y java-21-amazon-corretto docker git aws-cli

systemctl enable --now docker
usermod -aG docker ec2-user

dnf install -y wget
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
dnf install -y jenkins

# Jenkins' own Docker-build/push and `mvn test` throwaway-DB steps need the
# docker group, same as any other Docker CLI user on this box.
usermod -aG docker jenkins

systemctl enable --now jenkins
