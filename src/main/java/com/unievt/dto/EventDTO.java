package com.unievt.dto;

import com.unievt.enums.CategorieEnum;
import com.unievt.enums.StatutEvenementEnum;
import com.unievt.enums.TypeEvenementEnum;
import com.unievt.enums.VisibiliteEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Event details")
public class EventDTO {

    @Schema(description = "Event ID", example = "42")
    private Long id;

    @Schema(description = "Event title", example = "Tech Day 2025")
    private String titre;

    @Schema(description = "Detailed description")
    private String description;

    @Schema(description = "Category", example = "CONFERENCE")
    private CategorieEnum categorie;

    @Schema(description = "Start datetime", example = "2025-10-01T09:00:00")
    private LocalDateTime dateDebut;

    @Schema(description = "End datetime", example = "2025-10-01T17:00:00")
    private LocalDateTime dateFin;

    @Schema(description = "Maximum attendee capacity", example = "150")
    private Integer capacite;

    @Schema(description = "Current registration count", example = "78")
    private long registrationCount;

    @Schema(description = "Poster image URL")
    private String affiche;

    @Schema(description = "Current lifecycle status", example = "APPROUVE")
    private StatutEvenementEnum statut;

    @Schema(description = "Visibility", example = "PUBLIC")
    private VisibiliteEnum visibilite;

    @Schema(description = "Event type", example = "PRESENTIEL")
    private TypeEvenementEnum type;

    @Schema(description = "Video-conference link (online events)")
    private String lienVisio;

    @Schema(description = "Organizer user ID")
    private Long organisateurId;

    @Schema(description = "Organizer full name")
    private String organisateurNom;

    @Schema(description = "Club ID (optional)")
    private Long clubId;

    @Schema(description = "Club name (optional)")
    private String clubNom;
}
