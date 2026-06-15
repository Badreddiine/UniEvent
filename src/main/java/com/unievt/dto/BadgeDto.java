package com.unievt.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Badge with embedded QR code")
public class BadgeDto {

    @Schema(description = "Badge UUID — used as verification token", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID token;

    @Schema(description = "Template / display name", example = "Tech Day 2025 — Standard")
    private String templateNom;

    @Schema(description = "Event ID")
    private Long evenementId;

    @Schema(description = "Event title")
    private String evenementTitre;

    @Schema(description = "Attendee user ID")
    private Long utilisateurId;

    @Schema(description = "Attendee full name")
    private String utilisateurNom;

    @Schema(description = "Registration ID")
    private Long inscriptionId;

    @Schema(description = "Generation timestamp")
    private LocalDateTime genereLe;

    @Schema(description = "QR code image as Base64-encoded PNG (data URI ready)")
    private String qrImage;
}
