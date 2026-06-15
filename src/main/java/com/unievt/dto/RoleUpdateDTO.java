package com.unievt.dto;

import com.unievt.enums.RoleEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Role assignment payload (admin only)")
public class RoleUpdateDTO {

    @NotNull(message = "Le rôle est obligatoire")
    @Schema(description = "New role to assign",
            example = "RESPONSABLE_EVENEMENTS",
            allowableValues = {"ADMIN", "DOYEN", "RESPONSABLE_EVENEMENTS"})
    private RoleEnum role;
}
