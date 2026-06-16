package com.unievt.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Réponse renvoyée après une inscription : aucun token, l'email doit d'abord être vérifié")
public class RegisterResponseDTO {

    @Schema(description = "Message d'instruction pour l'utilisateur",
            example = "Vérifiez votre email pour activer votre compte.")
    private String message;
}
