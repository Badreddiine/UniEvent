package com.unievt.dto;

import com.unievt.enums.RoleEnum;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurResponseDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String photo;
    private String telephone;
    private RoleEnum role;
    private Boolean actif;
    private LocalDateTime dateCreation;
    // motDePasse intentionally excluded
}
