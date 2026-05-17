# Traefik Routing

Production routing is defined in `docker-compose.prod.yml` using Docker labels.

- `WEB_HOST` routes to the frontend service.
- `API_HOST` routes to the backend service.
- TLS uses the `letsencrypt` certificate resolver.
- Rollback policy is configured with Docker deploy `failure_action: rollback`.
