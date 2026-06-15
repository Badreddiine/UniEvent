package com.unievt.dto;

import com.unievt.enums.StatutSalleEnum;
import com.unievt.enums.TypeSalleEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Room details")
public class RoomDTO {

    @Schema(description = "Room ID", example = "5")
    private Long id;

    @Schema(description = "Room name", example = "Amphi A")
    private String nom;

    @Schema(description = "Building", example = "Bâtiment Principal")
    private String batiment;

    @Schema(description = "Floor", example = "0")
    private Integer etage;

    @Schema(description = "Seating capacity", example = "200")
    private Integer capacite;

    @Schema(description = "Room type", example = "AMPHITHEATRE")
    private TypeSalleEnum type;

    @Schema(description = "Available equipment")
    private List<String> equipements;

    @Schema(description = "Wheelchair accessible", example = "true")
    private Boolean accessiblePMR;

    @Schema(description = "Current availability status", example = "DISPONIBLE")
    private StatutSalleEnum statut;

    @Schema(description = "Photo URLs")
    private List<String> photos;
}
