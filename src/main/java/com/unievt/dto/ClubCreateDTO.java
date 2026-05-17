package com.unievt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubCreateDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String description;
    private String categorie;
    private String logo;

    @NotNull(message = "L'id du président est obligatoire")
    private Long presidentId;
}
