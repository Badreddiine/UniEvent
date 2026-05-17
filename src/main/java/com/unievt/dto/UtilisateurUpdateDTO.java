package com.unievt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurUpdateDTO {

    private String nom;
    private String prenom;
    private String photo;
    private String telephone;
    // email and motDePasse intentionally excluded
    // those need dedicated endpoints with extra security checks
}