# ─────────────────────────────────────────────────────────────────────────────
# UniEvent Backend — Makefile
# Requires: Docker, Docker Compose, Maven 3.9+, JDK 21
# ─────────────────────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help
.PHONY: help up down build-all logs logs-all ps restart shell-db shell-backend dev dev-down build test clean migrate lint docker-prod

# ── Load .env.local if present (won't override existing env vars) ─────────────
-include .env.local
export

DB_URL    ?= jdbc:postgresql://localhost:5432/unievtdb
DB_USER   ?= unievt
DB_PASS   ?= unievt

# ── Help ──────────────────────────────────────────────────────────────────────
help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Development ───────────────────────────────────────────────────────────────
dev: ## Start dev environment (PostgreSQL + MailHog + app) via Docker Compose
	docker compose -f docker-compose.dev.yml up --build

dev-down: ## Stop and remove dev containers and volumes
	docker compose -f docker-compose.dev.yml down -v

# ── Build ─────────────────────────────────────────────────────────────────────
build: ## Compile and package the JAR (skips tests)
	mvn package -DskipTests -B -q
	@echo "✓ JAR built: target/unievt-*.jar"

build-docker: ## Build the production Docker image
	docker build -t unievt-backend:latest --target runtime .
	@echo "✓ Docker image: unievt-backend:latest"

# ── Tests ─────────────────────────────────────────────────────────────────────
test: ## Run all tests (requires a running PostgreSQL on 5432)
	mvn test -B

test-unit: ## Run only Mockito unit tests (no DB required)
	mvn test -B -Dgroups=unit

# ── Database migrations ───────────────────────────────────────────────────────
migrate: ## Run Flyway migrations against DB_URL (uses Flyway Docker image)
	@echo "→ Running Flyway migrations on $(DB_URL)"
	docker run --rm \
		--network=host \
		-v "$(CURDIR)/src/main/resources/db/migration:/flyway/sql:ro" \
		flyway/flyway:10-alpine \
		-url=$(DB_URL) \
		-user=$(DB_USER) \
		-password=$(DB_PASS) \
		-baselineOnMigrate=true \
		migrate
	@echo "✓ Migrations applied"

migrate-info: ## Show current migration status
	docker run --rm \
		--network=host \
		-v "$(CURDIR)/src/main/resources/db/migration:/flyway/sql:ro" \
		flyway/flyway:10-alpine \
		-url=$(DB_URL) \
		-user=$(DB_USER) \
		-password=$(DB_PASS) \
		info

# ── Production ────────────────────────────────────────────────────────────────
docker-prod: ## Start full prod stack (requires .env.local with prod credentials)
	docker compose up --build -d
	@echo "✓ Production stack started"

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean: ## Remove build artifacts
	mvn clean -q
	@echo "✓ Build artifacts removed"

lint: ## Run Checkstyle (if configured)
	mvn checkstyle:check -q 2>/dev/null || echo "Checkstyle not configured — skipping"

# ── Docker Compose shortcuts ──────────────────────────────────────────────────
up: ## Start all services (postgres + redis + mailhog + backend + frontend)
	docker compose up -d

down: ## Stop and remove all containers
	docker compose down

build-all: ## Rebuild and start all services
	docker compose up -d --build

logs: ## Tail backend logs
	docker compose logs -f backend

logs-all: ## Tail all service logs
	docker compose logs -f

ps: ## Show running containers
	docker compose ps

restart: ## Restart backend only
	docker compose restart backend

shell-db: ## Open psql shell in postgres container
	docker compose exec postgres psql -U $${POSTGRES_USER:-unievt} -d $${POSTGRES_DB:-unievtdb}

shell-backend: ## Open shell in backend container
	docker compose exec backend sh

reset-db: ## Destroy DB volume and restart fresh
	docker compose down -v
	docker compose up -d postgres
	@echo "Waiting for postgres..."
	@sleep 5
	docker compose up -d
