locals {
  name_suffix = substr(var.railway_environment_id, 0, 8)

  # Actual services in this repository
  default_services = {
    coordinator = {
      name = "coordinator-${local.name_suffix}"
      env = {
        PORT            = "3000"
        NODE_ENV        = "production"
        GRPC_ENABLED    = "true"
        GRPC_PORT       = "50051"
        DEFAULT_PROTOCOL = "http"
        LOG_LEVEL       = "info"
      }
    }

    ms1 = {
      name = "ms1-${local.name_suffix}"
      env = {
        PORT     = "3000"
        NODE_ENV = "production"
      }
    }

    ms2 = {
      name = "ms2-${local.name_suffix}"
      env = {
        PORT     = "3000"
        NODE_ENV = "production"
      }
    }
  }
}

module "services" {
  source = "./services"

  railway_project_id     = var.railway_project_id
  railway_environment_id = var.railway_environment_id
  services               = local.default_services
}

