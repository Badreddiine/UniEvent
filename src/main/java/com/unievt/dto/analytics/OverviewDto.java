package com.unievt.dto.analytics;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Platform-wide summary statistics")
public class OverviewDto {

    @Schema(description = "Total number of events (all statuses)", example = "142")
    private long totalEvents;

    @Schema(description = "Total registered users", example = "1850")
    private long totalUsers;

    @Schema(description = "Total non-cancelled registrations", example = "4320")
    private long totalRegistrations;

    @Schema(description = "Overall occupancy rate: confirmed registrations / total capacity (0–100)",
            example = "73.4")
    private double occupancyRate;
}
