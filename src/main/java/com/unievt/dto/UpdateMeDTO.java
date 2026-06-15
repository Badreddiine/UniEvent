package com.unievt.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Fields the authenticated user can update on their own profile")
public class UpdateMeDTO {

    @Schema(description = "Last name", example = "Alaoui")
    private String nom;

    @Schema(description = "First name", example = "Sara")
    private String prenom;

    @Schema(description = "Profile photo URL")
    private String photo;

    @Schema(description = "Phone number", example = "+212600000010")
    private String telephone;
}
