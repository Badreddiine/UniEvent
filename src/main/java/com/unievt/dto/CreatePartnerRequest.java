package com.unievt.dto;

import com.unievt.enums.TypePartenaireEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body for creating or updating a partner")
public class CreatePartnerRequest {

    @NotBlank
    @Schema(description = "Organisation name", example = "TechCorp SA", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nom;

    @Schema(description = "Description")
    private String description;

    @Schema(description = "Logo URL (stored as URL, no upload)", example = "https://cdn.techcorp.ma/logo.png")
    private String logoUrl;

    @Schema(description = "Website URL", example = "https://techcorp.ma")
    private String siteWeb;

    @Email
    @Schema(description = "Contact email", example = "contact@techcorp.ma")
    private String emailContact;

    @Schema(description = "Contact person name", example = "Ahmed Benali")
    private String nomContact;

    @Schema(description = "Partner type", example = "ENTREPRISE")
    private TypePartenaireEnum type;
}
