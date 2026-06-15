package com.unievt.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body for creating a room reservation")
public class CreateReservationRequest {

    @NotNull
    @Schema(description = "Room ID to reserve", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long salleId;

    @NotNull
    @Schema(description = "Event ID this reservation is for", example = "42", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long evenementId;

    @NotNull
    @Schema(description = "Reservation start datetime", example = "2025-10-01T08:00:00",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime dateDebut;

    @NotNull
    @Schema(description = "Reservation end datetime", example = "2025-10-01T18:00:00",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime dateFin;

    @Schema(description = "Optional comments or special requirements")
    private String commentaire;
}
