package com.unievt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntervenantUpdateDTO {

    private String nom;
    private String institution;
    private String biographie;
}