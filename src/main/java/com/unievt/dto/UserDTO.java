package com.unievt.dto;

import com.unievt.enums.RoleEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Public user profile")
public class UserDTO {

    @Schema(description = "Unique identifier", example = "1")
    private Long id;

    @Schema(description = "Last name", example = "Alaoui")
    private String nom;

    @Schema(description = "First name", example = "Sara")
    private String prenom;

    @Schema(description = "Email address", example = "sara.alaoui@unievt.ma")
    private String email;

    @Schema(description = "Profile photo URL")
    private String photo;

    @Schema(description = "Phone number", example = "+212600000010")
    private String telephone;

    @Schema(description = "Permission role — null means regular user", example = "ADMIN",
            allowableValues = {"ADMIN", "DOYEN", "RESPONSABLE_EVENEMENTS"})
    private RoleEnum role;

    @Schema(description = "Whether the account is active")
    private Boolean actif;

    @Schema(description = "True if this user is the president of at least one club "
            + "(identity fact derived from Club.president, not a permission role)")
    private Boolean presidentDeClub;

    @Schema(description = "Account creation timestamp")
    private LocalDateTime dateCreation;
}
