#!/usr/bin/env bash
set -euo pipefail

echo "Running lint..."
npm run lint

echo "Running build..."
npm run build

echo "Scanning frontend source for forbidden legacy Cloudflare Worker endpoint usage..."
if rg -n -i "workers\.dev|wrangler|cf-worker|cloudflare worker|worker endpoint" \
  App.tsx components services hooks constants.tsx index.tsx types.ts firebase.ts vite.config.ts package.json; then
  echo "Forbidden legacy Cloudflare Worker reference detected in frontend source."
  exit 1
fi

echo "Deployment verification passed: lint/build succeeded and no Worker endpoint references were found in frontend source."
