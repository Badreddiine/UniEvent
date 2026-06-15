package com.unievt.controller;

import com.unievt.dto.RegistrationDTO;
import com.unievt.security.CustomUserDetails;
import com.unievt.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Registrations", description = "Event registration and waitlist management")
public class RegistrationController {

    private final RegistrationService registrationService;

    // ── POST /api/events/{id}/register ───────────────────────────────────────

    @Operation(summary = "Register for an event",
               description = "Registers the authenticated user for the event. "
                   + "Status is CONFIRMEE if capacity allows, LISTE_ATTENTE otherwise. "
                   + "A confirmation notification is sent automatically.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Registered (CONFIRMEE or LISTE_ATTENTE)",
            content = @Content(schema = @Schema(implementation = RegistrationDTO.class))),
        @ApiResponse(responseCode = "404", description = "Event not found"),
        @ApiResponse(responseCode = "409", description = "Already registered")
    })
    @PostMapping("/api/events/{id}/register")
    public ResponseEntity<RegistrationDTO> register(
            @Parameter(description = "Event ID") @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registrationService.register(id, currentUser));
    }

    // ── DELETE /api/events/{id}/register ─────────────────────────────────────

    @Operation(summary = "Cancel registration for an event",
               description = "Cancels the authenticated user's registration. "
                   + "If the registration was CONFIRMEE, the first LISTE_ATTENTE user is promoted automatically.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Registration cancelled"),
        @ApiResponse(responseCode = "400", description = "Already cancelled"),
        @ApiResponse(responseCode = "404", description = "No registration found for this event")
    })
    @DeleteMapping("/api/events/{id}/register")
    public ResponseEntity<Void> cancelRegistration(
            @Parameter(description = "Event ID") @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        registrationService.cancel(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    // ── GET /api/events/{id}/attendees ────────────────────────────────────────

    @Operation(summary = "List attendees for an event (organizer / admin only)",
               description = "Returns all registrations for the event including waitlist. "
                   + "Only accessible by the event's organizer or an admin.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Attendee list",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = RegistrationDTO.class)))),
        @ApiResponse(responseCode = "403", description = "Not the organizer or admin"),
        @ApiResponse(responseCode = "404", description = "Event not found")
    })
    @GetMapping("/api/events/{id}/attendees")
    public List<RegistrationDTO> getAttendees(
            @Parameter(description = "Event ID") @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return registrationService.getAttendees(id, currentUser);
    }

    // ── GET /api/users/me/registrations ──────────────────────────────────────

    @Operation(summary = "Get my event registrations",
               description = "Returns all event registrations for the authenticated user (all statuses).")
    @ApiResponse(responseCode = "200", description = "Registration list",
        content = @Content(array = @ArraySchema(schema = @Schema(implementation = RegistrationDTO.class))))
    @GetMapping("/api/users/me/registrations")
    public List<RegistrationDTO> getMyRegistrations(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return registrationService.getMyRegistrations(currentUser);
    }
}
