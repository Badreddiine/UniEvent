package com.unievt.controller;

import com.unievt.dto.CreateSponsorRequest;
import com.unievt.dto.EventSponsorDto;
import com.unievt.service.ApiPartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events/{eventId}/sponsors")
@RequiredArgsConstructor
@Tag(name = "Sponsors", description = "Event ↔ partner sponsorship links")
public class ApiSponsorController {

    private final ApiPartnerService apiPartnerService;

    @Operation(summary = "List sponsors for an event (public)",
               description = "Returns sponsors sorted by tier (PLATINE → OR → ARGENT → BRONZE) then by displayOrder.")
    @ApiResponse(responseCode = "200", description = "Sponsor list",
        content = @Content(array = @ArraySchema(schema = @Schema(implementation = EventSponsorDto.class))))
    @GetMapping
    public List<EventSponsorDto> list(
            @Parameter(description = "Event ID") @PathVariable Long eventId) {
        return apiPartnerService.listSponsors(eventId);
    }

    @Operation(summary = "Add a sponsor to an event",
               description = "Links an existing partner to the event with a tier and optional sponsorship amount.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Sponsor link created",
            content = @Content(schema = @Schema(implementation = EventSponsorDto.class))),
        @ApiResponse(responseCode = "404", description = "Event or partner not found"),
        @ApiResponse(responseCode = "409", description = "Partner is already a sponsor of this event")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<EventSponsorDto> add(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @Valid @RequestBody CreateSponsorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(apiPartnerService.addSponsor(eventId, request));
    }

    @Operation(summary = "Remove a sponsor from an event")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Sponsor link removed"),
        @ApiResponse(responseCode = "404", description = "Sponsorship link not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{partnerId}")
    public ResponseEntity<Void> remove(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @Parameter(description = "Partner UUID") @PathVariable UUID partnerId) {
        apiPartnerService.removeSponsor(eventId, partnerId);
        return ResponseEntity.noContent().build();
    }
}
