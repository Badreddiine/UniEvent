package com.unievt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubUpdateDTO {

    private String nom;
    private String description;
    private String categorie;
    private String logo;
    private Boolean actif;

}