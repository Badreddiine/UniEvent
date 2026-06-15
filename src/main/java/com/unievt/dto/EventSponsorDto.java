package com.unievt.dto;

import com.unievt.enums.NiveauSponsorEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Sponsor link between a partner and an event")
public class EventSponsorDto {

    @Schema(description = "Sponsor record UUID")
    private UUID id;

    @Schema(description = "Partner details")
    private PartnerDto partenaire;

    @Schema(description = "Sponsorship tier", example = "OR")
    private NiveauSponsorEnum niveau;

    @Schema(description = "Sponsorship amount in MAD", example = "50000.00")
    private BigDecimal montant;

    @Schema(description = "Whether sponsorship is confirmed", example = "true")
    private boolean confirme;

    @Schema(description = "Display order within same tier (lower = first)", example = "1")
    private Integer displayOrder;
}
