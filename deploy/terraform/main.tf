terraform {
  required_version = ">= 1.7.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

variable "environment" {
  type        = string
  description = "Deployment environment: development, staging, or production."
}

variable "tenant_slug" {
  type        = string
  description = "Optional tenant slug for tenant-aware runtime isolation."
  default     = "shared"
}

locals {
  name_prefix = "suitepilot-${var.environment}-${var.tenant_slug}"
  labels = {
    environment = var.environment
    tenant      = var.tenant_slug
    managed_by  = "terraform"
  }
}

resource "docker_network" "runtime" {
  name   = "${local.name_prefix}-network"
  labels = local.labels
}

output "runtime_network" {
  value = docker_network.runtime.name
}
