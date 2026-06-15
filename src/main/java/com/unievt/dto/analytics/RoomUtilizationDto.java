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
@Schema(description = "Room utilisation statistics")
public class RoomUtilizationDto {

    @Schema(description = "Room ID")
    private Long roomId;

    @Schema(description = "Room name", example = "Amphi A")
    private String roomName;

    @Schema(description = "Total non-cancelled reservation requests", example = "28")
    private long totalReservations;

    @Schema(description = "Approved booked hours", example = "112.5")
    private double approvedHours;

    @Schema(description = "Total requested hours (approved + pending + rejected)", example = "145.0")
    private double totalRequestedHours;

    @Schema(description = "Approval rate: approvedHours / totalRequestedHours × 100 (0–100)",
            example = "77.6")
    private double utilizationPercent;
}
