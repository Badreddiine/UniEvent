package com.unievt.dto.analytics;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Registration count for a single day")
public class DailyCountDto {

    @Schema(description = "Date", example = "2025-10-01")
    private LocalDate date;

    @Schema(description = "Number of registrations on that date", example = "37")
    private long count;
}
