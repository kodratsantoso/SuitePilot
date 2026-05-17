#!/usr/bin/env sh
set -eu

ENVIRONMENT="${1:-development}"

case "$ENVIRONMENT" in
  development)
    docker compose restart backend frontend
    ;;
  staging|production)
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend="${BACKEND_REPLICAS:-2}" --scale frontend="${FRONTEND_REPLICAS:-2}"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT" >&2
    exit 1
    ;;
esac

./scripts/healthcheck.sh "$ENVIRONMENT"
