#!/usr/bin/env bash
set -euo pipefail

: "${CONNECTION_ARN:?CONNECTION_ARN is required}"
: "${REPO_STRING:?REPO_STRING is required}"
: "${BRANCH:?BRANCH is required}"
: "${VITE_API_BASE_URL:?VITE_API_BASE_URL is required}"

npm ci
npm run build

cd infra
npm ci
npm run build

npx cdk synth \
  -c deployPipeline=true \
  -c connectionArn="${CONNECTION_ARN}" \
  -c repo="${REPO_STRING}" \
  -c branch="${BRANCH}" \
  -c viteApiBaseUrl="${VITE_API_BASE_URL}"