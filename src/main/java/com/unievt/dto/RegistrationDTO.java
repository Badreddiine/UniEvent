package com.unievt.dto;

import com.unievt.enums.StatutInscriptionEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Event registration / inscription details")
public class RegistrationDTO {

    @Schema(description = "Registration ID")
    private Long id;

    @Schema(description = "Event ID")
    private Long evenementId;

    @Schema(description = "Event title")
    private String evenementTitre;

    @Schema(description = "Attendee user ID")
    private Long etudiantId;

    @Schema(description = "Attendee full name")
    private String etudiantNom;

    @Schema(description = "Registration status — CONFIRMEE (registered), LISTE_ATTENTE (waitlisted), ANNULEE (cancelled)")
    private StatutInscriptionEnum statut;

    @Schema(description = "Registration timestamp")
    private LocalDateTime dateInscription;

    @Schema(description = "QR code value (non-null after confirmation)")
    private String qrCode;

    @Schema(description = "Whether attendee was marked present")
    private Boolean present;
}
