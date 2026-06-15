package com.unievt.controller;

import com.unievt.dto.CreateEventRequest;
import com.unievt.dto.EventDTO;
import com.unievt.dto.InscriptionResponseDTO;
import com.unievt.enums.CategorieEnum;
import com.unievt.enums.StatutEvenementEnum;
import com.unievt.security.CustomUserDetails;
import com.unievt.service.ApiEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Events", description = "Event lifecycle management")
public class ApiEventController {

    private final ApiEventService apiEventService;

    @Operation(summary = "Create an event",
               description = "Creates a new event in BROUILLON status. The authenticated user becomes the organizer.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Event created",
            content = @Content(schema = @Schema(implementation = EventDTO.class))),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @PostMapping
    public ResponseEntity<EventDTO> create(
            @Valid @RequestBody CreateEventRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(apiEventService.create(request, currentUser));
    }

    @Operation(summary = "List events",
               description = "Returns a paginated, filterable list of events. "
                   + "Query params: `categorie`, `statut`, `dateFrom`, `dateTo`, `page`, `size`, `sort`.")
    @ApiResponse(responseCode = "200", description = "Page of events")
    @GetMapping
    public Page<EventDTO> list(
            @Parameter(description = "Filter by category") @RequestParam(required = false) CategorieEnum categorie,
            @Parameter(description = "Filter by status") @RequestParam(required = false) StatutEvenementEnum statut,
            @Parameter(description = "Events starting at or after (ISO datetime)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @Parameter(description = "Events ending at or before (ISO datetime)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @PageableDefault(size = 20, sort = "dateDebut", direction = Sort.Direction.ASC)
            @Parameter(hidden = true) Pageable pageable) {
        return apiEventService.list(categorie, statut, dateFrom, dateTo, pageable);
    }

    @Operation(summary = "Get event by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Event found",
            content = @Content(schema = @Schema(implementation = EventDTO.class))),
        @ApiResponse(responseCode = "404", description = "Event not found")
    })
    @GetMapping("/{id}")
    public EventDTO get(@PathVariable Long id) {
        return apiEventService.get(id);
    }

    @Operation(summary = "Update an event",
               description = "Updates event fields. Only the organizer or an admin may call this.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Event updated",
            content = @Content(schema = @Schema(implementation = EventDTO.class))),
        @ApiResponse(responseCode = "403", description = "Not the organizer or admin"),
        @ApiResponse(responseCode = "404", description = "Event not found")
    })
    @PutMapping("/{id}")
    public EventDTO update(
            @PathVariable Long id,
            @Valid @RequestBody CreateEventRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return apiEventService.update(id, request, currentUser);
    }

    @Operation(summary = "Delete an event",
               description = "Permanently deletes the event. Only the organizer or an admin may call this.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Event deleted"),
        @ApiResponse(responseCode = "403", description = "Not the organizer or admin"),
        @ApiResponse(responseCode = "404", description = "Event not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        apiEventService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Publish / submit an event",
               description = "Organizer: moves BROUILLON → SOUMIS (submits for review). "
                   + "Admin: moves VERIFIE → APPROUVE (publishes).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Status updated",
            content = @Content(schema = @Schema(implementation = EventDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid status transition"),
        @ApiResponse(responseCode = "403", description = "Not the organizer or admin")
    })
    @PatchMapping("/{id}/publish")
    public EventDTO publish(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return apiEventService.publish(id, currentUser);
    }

    @Operation(summary = "Cancel an event",
               description = "Sets the event status to ANNULE. Only the organizer or an admin may call this.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Event cancelled",
            content = @Content(schema = @Schema(implementation = EventDTO.class))),
        @ApiResponse(responseCode = "403", description = "Not the organizer or admin"),
        @ApiResponse(responseCode = "404", description = "Event not found")
    })
    @PatchMapping("/{id}/cancel")
    public EventDTO cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return apiEventService.cancel(id, currentUser);
    }

    @Operation(summary = "List registrations for an event (organizer / admin only)",
               description = "Returns all inscriptions for the event. Only the organizer or an admin may view this.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Registration list"),
        @ApiResponse(responseCode = "403", description = "Not the organizer or admin"),
        @ApiResponse(responseCode = "404", description = "Event not found")
    })
    @GetMapping("/{id}/registrations")
    public List<InscriptionResponseDTO> getRegistrations(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return apiEventService.getRegistrations(id, currentUser);
    }
}
