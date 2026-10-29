#!/bin/bash
set -euxo pipefail

# 1GB swap: t3.micro is tight once Docker + the proxy container are both up.
if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

dnf install -y docker aws-cli
systemctl enable --now docker
usermod -aG docker ec2-user

DOCKER_COMPOSE_VERSION="v2.29.7"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Jenkins' Deploy stage copies deploy/proxy/docker-compose.yml here and runs
# `docker compose up -d` with DOCKERHUB_USER/IMAGE_TAG/APP_HOST/PUBLIC_IP set.
mkdir -p /opt/sals-proxy
chown ec2-user:ec2-user /opt/sals-proxy
