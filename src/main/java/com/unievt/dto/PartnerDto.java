package com.unievt.dto;

import com.unievt.enums.TypePartenaireEnum;
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
@Schema(description = "Partner organisation details")
public class PartnerDto {

    @Schema(description = "Partner UUID")
    private UUID id;

    @Schema(description = "Organisation name", example = "TechCorp SA")
    private String nom;

    @Schema(description = "Description")
    private String description;

    @Schema(description = "Logo URL", example = "https://cdn.techcorp.ma/logo.png")
    private String logoUrl;

    @Schema(description = "Website URL", example = "https://techcorp.ma")
    private String siteWeb;

    @Schema(description = "Contact email", example = "contact@techcorp.ma")
    private String emailContact;

    @Schema(description = "Contact person name", example = "Ahmed Benali")
    private String nomContact;

    @Schema(description = "Partner type", example = "ENTREPRISE")
    private TypePartenaireEnum type;

    @Schema(description = "Is currently active", example = "true")
    private boolean actif;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
}
