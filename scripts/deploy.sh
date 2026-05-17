#!/usr/bin/env sh
set -eu

ENVIRONMENT="${1:-development}"
IMAGE_TAG="${2:-latest}"

case "$ENVIRONMENT" in
  development)
    IMAGE_TAG="$IMAGE_TAG" docker compose up -d --build
    ;;
  staging|production)
    IMAGE_TAG="$IMAGE_TAG" docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT" >&2
    exit 1
    ;;
esac

./scripts/healthcheck.sh "$ENVIRONMENT"
