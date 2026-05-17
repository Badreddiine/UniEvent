package com.unievt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntervenantResponseDTO {

    private Long id;
    private String nom;
    private String institution;
    private String biographie;
}