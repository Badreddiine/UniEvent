package com.unievt.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Payload to create a new account")
public class RegisterRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    @Schema(description = "Last name", example = "Alaoui")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Schema(description = "First name", example = "Sara")
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    @Schema(description = "Email address — must be unique", example = "sara.alaoui@unievt.ma")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @Schema(description = "Password (min 8 chars)", example = "SecretP@ss1")
    private String motDePasse;

    @Schema(description = "Phone number (optional)", example = "+212600000010")
    private String telephone;
}
