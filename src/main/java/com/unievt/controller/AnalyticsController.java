package com.unievt.controller;

import com.unievt.dto.analytics.DailyCountDto;
import com.unievt.dto.analytics.EventAnalyticsDto;
import com.unievt.dto.analytics.OverviewDto;
import com.unievt.dto.analytics.RoomUtilizationDto;
import com.unievt.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasAnyRole('ADMIN', 'DOYEN', 'RESPONSABLE_EVENEMENTS')")
@Tag(name = "Analytics", description = "Platform and event statistics (admin / doyen / responsable only)")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Platform overview",
               description = "Returns global counters: total events, users, registrations and overall occupancy rate. "
                   + "Result is cached for 5 minutes.")
    @ApiResponse(responseCode = "200", description = "Overview statistics",
        content = @Content(schema = @Schema(implementation = OverviewDto.class)))
    @GetMapping("/overview")
    public OverviewDto overview() {
        return analyticsService.getOverview();
    }

    @Operation(summary = "Per-event statistics",
               description = "Returns detailed stats for one event: registration timeline, "
                   + "attendance rate, waitlist size and room utilisation. Cached per event for 5 minutes.")
    @ApiResponse(responseCode = "200", description = "Event analytics",
        content = @Content(schema = @Schema(implementation = EventAnalyticsDto.class)))
    @GetMapping("/events/{id}")
    public EventAnalyticsDto eventStats(
            @Parameter(description = "Event ID") @PathVariable Long id) {
        return analyticsService.getEventStats(id);
    }

    @Operation(summary = "Daily registration trend",
               description = "Returns the number of registrations per day between `from` and `to`. "
                   + "Cached per date range for 5 minutes.")
    @ApiResponse(responseCode = "200", description = "Daily counts")
    @GetMapping("/registrations/trend")
    public List<DailyCountDto> trend(
            @Parameter(description = "Start date (inclusive), format yyyy-MM-dd", example = "2025-09-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @Parameter(description = "End date (inclusive), format yyyy-MM-dd", example = "2025-12-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getRegistrationTrend(from, to);
    }

    @Operation(summary = "Room utilisation",
               description = "Returns approved hours vs total requested hours per room. "
                   + "Cached globally for 5 minutes.")
    @ApiResponse(responseCode = "200", description = "Room utilisation list")
    @GetMapping("/rooms/utilization")
    public List<RoomUtilizationDto> roomsUtilization() {
        return analyticsService.getRoomsUtilization();
    }
}
