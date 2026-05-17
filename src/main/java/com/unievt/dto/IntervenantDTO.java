package com.unievt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntervenantDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String institution;

    private String biographie;
}