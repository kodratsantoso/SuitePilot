#!/usr/bin/env sh
set -eu

ENVIRONMENT="${1:-development}"

case "$ENVIRONMENT" in
  development)
    HEALTH_URL="${HEALTH_URL:-http://localhost:5001/api/health/ready}"
    ;;
  staging)
    HEALTH_URL="${HEALTH_URL:-https://staging-api.suitepilot.example/api/health/ready}"
    ;;
  production)
    HEALTH_URL="${HEALTH_URL:-https://api.suitepilot.example/api/health/ready}"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT" >&2
    exit 1
    ;;
esac

curl --fail --silent --show-error "$HEALTH_URL" >/dev/null
echo "Health check passed for $ENVIRONMENT: $HEALTH_URL"
