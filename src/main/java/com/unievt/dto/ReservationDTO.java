package com.unievt.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDTO {

    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String commentaire;
    private Long evenementId;
    private Long salleId;
    private Long demandeurId;
}
