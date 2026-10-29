#!/bin/bash
set -euxo pipefail

# 2GB swap: this box runs Spring + FastAPI(dlib) + the frontend container together.
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

dnf install -y docker aws-cli jq
systemctl enable --now docker
usermod -aG docker ec2-user

DOCKER_COMPOSE_VERSION="v2.29.7"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Jenkins' Deploy stage copies deploy/app/docker-compose.yml + fetch-secrets.sh
# here, runs fetch-secrets.sh (reads /sals/prod/* via this instance's IAM role),
# then `docker compose up -d` with DOCKERHUB_USER/IMAGE_TAG set.
mkdir -p /opt/sals
chown ec2-user:ec2-user /opt/sals
