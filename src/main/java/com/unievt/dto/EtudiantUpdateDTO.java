package com.unievt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EtudiantUpdateDTO {

    private String nom;
    private String prenom;
    private String photo;
    private String telephone;
    private String filiere;
    private Integer anneeEtude;
}