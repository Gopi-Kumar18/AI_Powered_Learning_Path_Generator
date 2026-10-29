#!/bin/bash
# Runs on the app EC2 (via its IAM instance role — no static AWS credentials
# involved). Reads every parameter under /sals/prod/ and writes them as a
# compose env_file at /opt/sals/.env. Jenkins' Deploy stage calls this right
# before `docker compose up -d`.
set -euo pipefail

SSM_PATH="${SSM_PATH:-/sals/prod}"
ENV_FILE="${ENV_FILE:-/opt/sals/.env}"

REQUIRED_KEYS=(
  SPRING_DATASOURCE_URL
  SPRING_DATASOURCE_USERNAME
  SPRING_DATASOURCE_PASSWORD
  SPRING_DATA_MONGODB_URI
  GEMINI_API_KEY
  APP_JWT_SECRET
  SPRING_MAIL_USERNAME
  SPRING_MAIL_PASSWORD
  VITE_FE_URL
)

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

aws ssm get-parameters-by-path \
  --path "$SSM_PATH" \
  --with-decryption \
  --recursive \
  --query "Parameters[].{Name:Name,Value:Value}" \
  --output json >"$tmp_file"

: >"${tmp_file}.env"
while IFS=$'\t' read -r name value; do
  key="${name##*/}"
  printf '%s=%s\n' "$key" "$value" >>"${tmp_file}.env"
done < <(jq -r '.[] | [.Name, .Value] | @tsv' "$tmp_file")

missing=()
for key in "${REQUIRED_KEYS[@]}"; do
  if ! grep -q "^${key}=" "${tmp_file}.env"; then
    missing+=("$key")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "fetch-secrets: missing required SSM parameter(s) under ${SSM_PATH}: ${missing[*]}" >&2
  rm -f "${tmp_file}.env"
  exit 1
fi

mkdir -p "$(dirname "$ENV_FILE")"
mv "${tmp_file}.env" "$ENV_FILE"
chmod 600 "$ENV_FILE"
echo "fetch-secrets: wrote $(wc -l <"$ENV_FILE") values to $ENV_FILE"
