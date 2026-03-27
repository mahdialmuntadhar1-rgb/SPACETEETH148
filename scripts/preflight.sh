#!/usr/bin/env bash
set -euo pipefail

required_vars=(
  GEMINI_API_KEY
)

missing=0
for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing required env var: ${var}"
    missing=1
  fi
done

if [[ "${missing}" -ne 0 ]]; then
  echo "Preflight failed due to missing required environment variables."
  exit 1
fi

echo "Running lint..."
npm run lint

echo "Running build..."
npm run build

echo "Preflight checks passed for frontend deployment (Firebase + Gemini)."
