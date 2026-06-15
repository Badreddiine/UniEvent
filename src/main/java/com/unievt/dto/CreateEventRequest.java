package com.unievt.dto;

import com.unievt.enums.CategorieEnum;
import com.unievt.enums.TypeEvenementEnum;
import com.unievt.enums.VisibiliteEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body for creating or updating an event")
public class CreateEventRequest {

    @NotBlank
    @Schema(description = "Event title", example = "Tech Day 2025", requiredMode = Schema.RequiredMode.REQUIRED)
    private String titre;

    @Schema(description = "Detailed description")
    private String description;

    @NotNull
    @Schema(description = "Category", example = "CONFERENCE", requiredMode = Schema.RequiredMode.REQUIRED)
    private CategorieEnum categorie;

    @NotNull
    @Schema(description = "Start datetime", example = "2025-10-01T09:00:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime dateDebut;

    @NotNull
    @Future
    @Schema(description = "End datetime", example = "2025-10-01T17:00:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime dateFin;

    @Min(1)
    @Schema(description = "Maximum attendee capacity", example = "150")
    private Integer capacite;

    @Schema(description = "Poster image URL")
    private String affiche;

    @Schema(description = "Visibility (default PUBLIC)", example = "PUBLIC")
    private VisibiliteEnum visibilite;

    @Schema(description = "Event type", example = "PRESENTIEL")
    private TypeEvenementEnum type;

    @Schema(description = "Video-conference link (for online events)")
    private String lienVisio;

    @Schema(description = "Club ID to associate the event with")
    private Long clubId;
}
