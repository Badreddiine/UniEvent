package com.unievt.monitoring;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Central place for custom Prometheus metrics.
 * Inject this bean into services that need to record business events.
 */
@Component
public class UniEventMetrics {

    private final MeterRegistry registry;

    // ── Counters ──────────────────────────────────────────────────────────────
    private Counter registrationsConfirmed;
    private Counter registrationsWaitlisted;
    private Counter registrationsCancelled;
    private Counter badgesGenerated;
    private Counter reportsPdf;
    private Counter reportsExcel;
    private Counter authFailures;

    // ── Gauges (backed by atomic longs; update from services) ─────────────────
    private final AtomicLong activeEventsCount = new AtomicLong(0);
    private final AtomicLong totalUsersCount   = new AtomicLong(0);

    // ── Timers ────────────────────────────────────────────────────────────────
    private Timer reportPdfTimer;
    private Timer reportExcelTimer;

    public UniEventMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    @PostConstruct
    private void init() {
        registrationsConfirmed  = Counter.builder("unievent.registrations.total")
                .tag("status", "CONFIRMED")
                .description("Total confirmed registrations")
                .register(registry);

        registrationsWaitlisted = Counter.builder("unievent.registrations.total")
                .tag("status", "WAITLISTED")
                .description("Total waitlisted registrations")
                .register(registry);

        registrationsCancelled  = Counter.builder("unievent.registrations.total")
                .tag("status", "CANCELLED")
                .description("Total cancelled registrations")
                .register(registry);

        badgesGenerated = Counter.builder("unievent.badges.generated.total")
                .description("Total QR badges generated")
                .register(registry);

        reportsPdf = Counter.builder("unievent.reports.generated.total")
                .tag("type", "PDF")
                .description("PDF reports generated")
                .register(registry);

        reportsExcel = Counter.builder("unievent.reports.generated.total")
                .tag("type", "EXCEL")
                .description("Excel reports generated")
                .register(registry);

        authFailures = Counter.builder("unievent.auth.failures.total")
                .description("Authentication failures (bad credentials, expired tokens, etc.)")
                .register(registry);

        Gauge.builder("unievent.events.active", activeEventsCount, AtomicLong::doubleValue)
                .description("Number of currently approved/active events")
                .register(registry);

        Gauge.builder("unievent.users.total", totalUsersCount, AtomicLong::doubleValue)
                .description("Total registered users")
                .register(registry);

        reportPdfTimer = Timer.builder("unievent.report.generation.seconds")
                .tag("type", "PDF")
                .description("Time taken to generate PDF reports")
                .register(registry);

        reportExcelTimer = Timer.builder("unievent.report.generation.seconds")
                .tag("type", "EXCEL")
                .description("Time taken to generate Excel reports")
                .register(registry);
    }

    // ── Public API called by services ─────────────────────────────────────────

    public void incrementRegistration(String status) {
        switch (status) {
            case "CONFIRMEE"     -> registrationsConfirmed.increment();
            case "LISTE_ATTENTE" -> registrationsWaitlisted.increment();
            case "ANNULEE"       -> registrationsCancelled.increment();
            default              -> { /* unknown status — ignore */ }
        }
    }

    public void incrementBadgeGenerated() {
        badgesGenerated.increment();
    }

    public void incrementReportGenerated(String type) {
        if ("PDF".equalsIgnoreCase(type))   reportsPdf.increment();
        else if ("EXCEL".equalsIgnoreCase(type)) reportsExcel.increment();
    }

    public void incrementAuthFailure() {
        authFailures.increment();
    }

    public void recordReportDuration(String type, long millis) {
        Timer timer = "PDF".equalsIgnoreCase(type) ? reportPdfTimer : reportExcelTimer;
        timer.record(millis, TimeUnit.MILLISECONDS);
    }

    public void setActiveEventsCount(long count) {
        activeEventsCount.set(count);
    }

    public void setTotalUsersCount(long count) {
        totalUsersCount.set(count);
    }
}
