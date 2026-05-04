package com.unievt.inscription.dto;

import java.time.LocalDateTime;

import com.unievt.enums.StatutInscriptionEnum;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InscriptionCreateDTO {
    private LocalDateTime dateInscription;
    private StatutInscriptionEnum statut;
    private String qrCode;
    private Boolean present;
    private Long etudiantId;
    private Long evenementId;
}
