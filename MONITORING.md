# UniEvent — Monitoring & Observability

## Stack

| Tool | Purpose | Where |
|------|---------|-------|
| **Betterstack Logtail** | Structured log ingestion + alerts | logtail.com |
| **Betterstack Uptime** | HTTP uptime checks + on-call | uptime.betterstack.com |
| **Grafana Cloud** | Prometheus dashboards + alerting | grafana.com |
| **Spring Boot Actuator** | Health, info, Prometheus scrape endpoint | `/actuator/*` |

---

## 1 — Betterstack Logtail (structured logs)

### How logs flow

```
Spring Boot (prod profile)
  → logback-spring.xml (LogstashEncoder → JSON to stdout)
  → Docker stdout
  → Render log drain
  → Betterstack Logtail
```

### Setup

1. Create a **Logtail Source** of type "HTTP" in Betterstack.
2. In Render dashboard → your backend service → **Log Drains** → add the Betterstack drain URL with your source token.
3. Logs arrive as JSON with these fields:

| Field | Example | Source |
|-------|---------|--------|
| `service` | `unievent-backend` | logback-spring.xml customFields |
| `env` | `prod` | logback-spring.xml customFields |
| `traceId` | `550e8400-e29b-…` | MdcLoggingFilter |
| `userId` | `42` / `anonymous` | MdcLoggingFilter |
| `level` | `INFO` | Logback |
| `message` | Log message text | Application |
| `logger_name` | `com.unievt.service.…` | Logback |

### Useful Logtail queries

```sql
-- All errors in the last hour
level = "ERROR"

-- Slow requests or errors for a specific user
userId = "42" AND level IN ("WARN", "ERROR")

-- Trace a specific request end-to-end
traceId = "550e8400-e29b-41d4-a716-446655440000"

-- Auth failures
message LIKE "%authentication%"
```

### Recommended alerts

| Alert | Condition | Urgency |
|-------|-----------|---------|
| Error spike | > 10 ERROR logs in 5 min | High |
| Auth failures | > 20 in 10 min | Critical |
| Slow DB queries | message contains "HHH90000011" | Medium |

---

## 2 — Betterstack Uptime (health checks)

### Monitors to create

| Monitor | URL | Check interval |
|---------|-----|---------------|
| Backend health | `https://your-render-url.onrender.com/actuator/health` | 1 min |
| Frontend | `https://your-vercel-url.vercel.app` | 1 min |
| API smoke test | `https://your-render-url.onrender.com/api/v1/evenements?page=0&size=1` | 5 min |

Expected responses:
- `/actuator/health` → `{"status":"UP"}` (HTTP 200)
- Frontend → HTTP 200

### On-call setup

1. Create a **team** in Betterstack.
2. Add escalation policy: page on-call after 2 consecutive failures.
3. Integrate with email / Slack webhook.

---

## 3 — Grafana Cloud (Prometheus metrics)

### Setup Prometheus scrape

1. In Grafana Cloud → **Connections** → **Add new connection** → **Prometheus**.
2. Use the **Grafana Agent** or **Prometheus remote_write** to scrape your Render backend.

Since Render doesn't expose a static scrape target, use **Grafana Agent** deployed separately or use **Betterstack** to push metrics, OR use the simpler option: **Render → custom metrics via remote_write**.

Simplest option for Render:
```yaml
# grafana-agent.yml (run as a separate service or locally)
metrics:
  global:
    scrape_interval: 30s
  configs:
    - name: unievent
      scrape_configs:
        - job_name: unievent-backend
          static_configs:
            - targets: ['your-render-url.onrender.com']
          metrics_path: /actuator/prometheus
          scheme: https
      remote_write:
        - url: https://prometheus-prod-XX.grafana.net/api/prom/push
          basic_auth:
            username: <grafana-cloud-user-id>
            password: <grafana-cloud-api-key>
```

### Custom metrics exposed by `UniEventMetrics`

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `unievent_registrations_total` | Counter | `status` (CONFIRMED/WAITLISTED/CANCELLED) | Event registrations |
| `unievent_badges_generated_total` | Counter | — | QR badges generated |
| `unievent_reports_generated_total` | Counter | `type` (PDF/EXCEL) | Reports generated |
| `unievent_auth_failures_total` | Counter | — | Authentication failures |
| `unievent_events_active` | Gauge | — | Currently active/approved events |
| `unievent_users_total` | Gauge | — | Total registered users |
| `unievent_report_generation_seconds` | Timer | `type` (PDF/EXCEL) | Report generation duration |

### Using UniEventMetrics in services

Inject `UniEventMetrics` and call the appropriate method:

```java
@Service
@RequiredArgsConstructor
public class InscriptionService {
    private final UniEventMetrics metrics;

    public InscriptionResponseDTO inscrire(...) {
        // ... business logic ...
        metrics.incrementRegistration(inscription.getStatut().name());
        return mapper.toDto(inscription);
    }
}
```

### Recommended Grafana dashboards

**Import dashboard IDs from grafana.com:**
- `4701` — JVM Micrometer dashboard
- `11378` — Spring Boot Statistics

**Custom panels to add:**
```promql
# Registration rate (per minute)
rate(unievent_registrations_total[5m]) * 60

# Error rate from Spring Boot
rate(http_server_requests_seconds_count{status=~"5.."}[5m])

# P95 response time
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# Badge generation trend
increase(unievent_badges_generated_total[1h])
```

### Recommended alerts in Grafana

| Alert | PromQL | Threshold |
|-------|--------|-----------|
| High error rate | `rate(http_server_requests_seconds_count{status=~"5.."}[5m])` | > 0.1/s |
| High latency | `histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))` | > 2s |
| Auth failures | `increase(unievent_auth_failures_total[5m])` | > 10 |
| JVM memory | `jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}` | > 0.85 |

---

## 3bis — Local observability stack (Docker Compose)

The `docker-compose.yml` ships a self-contained observability stack — no cloud
account needed. Kafka has been removed from the stack.

### Services & ports

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** (Next.js) | http://localhost:3001 | Web UI |
| **Backend** (Spring Boot) | http://localhost:8080 | API + `/actuator/prometheus` |
| **Grafana** | http://localhost:3000 | Dashboards (admin / admin) |
| **Prometheus** | http://localhost:9090 | Metrics scrape |
| **Loki** | http://localhost:3100 | Log aggregation |
| **Promtail** | — | Ships Docker container logs → Loki |
| **pgAdmin** | http://localhost:5050 | DB browser |
| **MailHog** | http://localhost:8025 | Captured emails |

### How logs reach Grafana

```
Containers (stdout)
  → Docker json-file logs
  → Promtail (scrapes via docker.sock, labels: container, service, stack)
  → Loki (http://loki:3100)
  → Grafana (provisioned "Loki" datasource)
```

Datasources and dashboards are auto-provisioned from
`monitoring/grafana/provisioning/` and `monitoring/grafana/dashboards/`.

### Provisioned dashboards

| Dashboard | UID | Contents |
|-----------|-----|----------|
| **UniEvent — Logs** | `unievent-logs` | Live logs, per-service volume, error rate; filter by `service` + free-text search |
| **UniEvent — Tableau de bord Doyen (Admin)** | `unievent-doyen` | Backend health, HTTP traffic by status, error/warning rate, and a decisions & access journal (reservations, approvals/rejections, auth) tailored for the doyen/admin |

### Run it

```bash
docker compose up -d
# Grafana:  http://localhost:3000  (admin / admin)
# Frontend: http://localhost:3001
```

Open Grafana → Dashboards → the two UniEvent dashboards appear automatically.

---

## 4 — Local development

In dev profile, logs are plain text (not JSON). No Prometheus scrape needed.

```bash
# View logs with trace IDs
make logs

# Access Actuator locally (dev profile exposes all endpoints)
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/prometheus | grep unievent
```

---

## 5 — Runbook

### Backend is down (Uptime alert)

1. Check Render dashboard → backend service → logs.
2. Check `/actuator/health` response.
3. Check Logtail for ERROR logs in the last 5 minutes.
4. Common causes: DB connection exhausted (check Hikari pool metrics), OOM (check JVM heap gauge), migration failure on startup.

### Auth failure spike

1. Query Logtail: `level = "ERROR" AND message LIKE "%authentication%"`.
2. Check if a specific IP is brute-forcing → block at Render/Cloudflare level.
3. Check if JWT secret was rotated without updating the env var.

### High latency alert

1. Check `http_server_requests_seconds` by URI to find the slow endpoint.
2. Check `unievent_report_generation_seconds` — PDF/Excel generation is CPU-bound.
3. Check Hikari pool wait time: `hikaricp_connections_pending`.

### Memory leak suspicion

1. Check `jvm_memory_used_bytes{area="heap"}` trend over time.
2. Trigger a thread dump via `curl -X POST http://localhost:8080/actuator/threaddump` (local).
3. In prod: Render → service → restart if immediate relief needed, then investigate.
