package com.unievt.dto;

import com.unievt.enums.NiveauSponsorEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Link a partner to an event as a sponsor")
public class CreateSponsorRequest {

    @NotNull
    @Schema(description = "Partner UUID", requiredMode = Schema.RequiredMode.REQUIRED)
    private UUID partenaireId;

    @NotNull
    @Schema(description = "Sponsorship tier", example = "OR", requiredMode = Schema.RequiredMode.REQUIRED)
    private NiveauSponsorEnum niveau;

    @DecimalMin("0.0")
    @Schema(description = "Sponsorship amount in MAD", example = "50000.00")
    private BigDecimal montant;

    @Schema(description = "Display order within same tier (lower = first)", example = "1")
    private Integer displayOrder;
}
