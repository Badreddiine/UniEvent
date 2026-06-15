package com.unievt.dto.analytics;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Detailed statistics for one event")
public class EventAnalyticsDto {

    @Schema(description = "Event ID")
    private Long eventId;

    @Schema(description = "Event title")
    private String eventTitle;

    @Schema(description = "Declared capacity (null = unlimited)", example = "200")
    private Integer capacite;

    @Schema(description = "Confirmed registrations", example = "178")
    private long confirmedRegistrations;

    @Schema(description = "Waitlisted registrations", example = "14")
    private long waitlistSize;

    @Schema(description = "Cancelled registrations", example = "9")
    private long cancelledRegistrations;

    @Schema(description = "Attendance rate: confirmed / capacite × 100 (null if no capacity set)",
            example = "89.0")
    private Double attendanceRate;

    @Schema(description = "Daily registration counts from first registration to event date")
    private List<DailyCountDto> registrationsOverTime;

    @Schema(description = "Approved hours per reserved room")
    private List<RoomUtilizationDto> roomUtilization;
}
