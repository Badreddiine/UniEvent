package com.unievt.dto;

import java.time.LocalDateTime;

import com.unievt.enums.StatutInscriptionEnum;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InscriptionResponseDTO {
    private Long id;
    private LocalDateTime dateInscription;
    private StatutInscriptionEnum statut;
    private String qrCode;
    private Boolean present;
    private Long etudiantId;
    private String etudiantName;
    private Long evenementId;
    private String evenementTitle;
}
