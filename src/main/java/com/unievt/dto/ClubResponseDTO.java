package com.unievt.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubResponseDTO {

    private Long id;
    private String nom;
    private String description;
    private String categorie;
    private String logo;
    private LocalDate dateCreation;
    private Boolean actif;

    // only expose what's needed from president
    private Long presidentId;
    private String presidentNom;
    private String presidentPrenom;
}
