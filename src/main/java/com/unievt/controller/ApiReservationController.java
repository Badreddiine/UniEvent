package com.unievt.controller;

import com.unievt.dto.CreateReservationRequest;
import com.unievt.dto.ReservationResponseDTO;
import com.unievt.security.CustomUserDetails;
import com.unievt.service.ApiReservationService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Reservations", description = "Room reservation management")
public class ApiReservationController {

    private final ApiReservationService apiReservationService;

    @Operation(summary = "Create a room reservation",
               description = "Books a room for an event. Validates no-overlap and capacity constraints.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Reservation created",
            content = @Content(schema = @Schema(implementation = ReservationResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Validation error or capacity mismatch"),
        @ApiResponse(responseCode = "404", description = "Room or event not found"),
        @ApiResponse(responseCode = "409", description = "Room already booked for this time slot")
    })
    @PostMapping
    public ResponseEntity<ReservationResponseDTO> create(
            @Valid @RequestBody CreateReservationRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(apiReservationService.create(request, currentUser));
    }

    @Operation(summary = "List my reservations",
               description = "Returns all reservations made by the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Reservation list")
    @GetMapping
    public List<ReservationResponseDTO> listMine(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return apiReservationService.listForCurrentUser(currentUser);
    }

    @Operation(summary = "List reservations for an event",
               description = "Returns all reservations associated with a specific event.")
    @ApiResponse(responseCode = "200", description = "Reservation list")
    @GetMapping("/event/{evenementId}")
    public List<ReservationResponseDTO> listForEvent(
            @Parameter(description = "Event ID") @PathVariable Long evenementId) {
        return apiReservationService.listForEvent(evenementId);
    }

    @Operation(summary = "Get reservation by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reservation details",
            content = @Content(schema = @Schema(implementation = ReservationResponseDTO.class))),
        @ApiResponse(responseCode = "403", description = "Not the requester or admin"),
        @ApiResponse(responseCode = "404", description = "Reservation not found")
    })
    @GetMapping("/{id}")
    public ReservationResponseDTO get(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return apiReservationService.get(id, currentUser);
    }

    @Operation(summary = "List all reservations (admin/doyen only)",
               description = "Returns every reservation in the system regardless of requester.")
    @ApiResponse(responseCode = "200", description = "All reservations")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOYEN')")
    @GetMapping("/all")
    public List<ReservationResponseDTO> listAll() {
        return apiReservationService.listAll();
    }

    @Operation(summary = "Approve a reservation (admin/doyen only)",
               description = "Sets status to APPROUVEE and records the approver.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reservation approved",
            content = @Content(schema = @Schema(implementation = ReservationResponseDTO.class))),
        @ApiResponse(responseCode = "404", description = "Reservation not found")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'DOYEN')")
    @PatchMapping("/{id}/approuver")
    public ReservationResponseDTO approve(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return apiReservationService.approve(id, currentUser);
    }

    @Operation(summary = "Reject a reservation (admin/doyen only)",
               description = "Sets status to REJETEE and records the approver.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reservation rejected",
            content = @Content(schema = @Schema(implementation = ReservationResponseDTO.class))),
        @ApiResponse(responseCode = "404", description = "Reservation not found")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'DOYEN')")
    @PatchMapping("/{id}/rejeter")
    public ReservationResponseDTO reject(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        return apiReservationService.reject(id, currentUser);
    }

    @Operation(summary = "Cancel a reservation",
               description = "Sets reservation status to ANNULEE. Only the requester or an admin may cancel.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Reservation cancelled"),
        @ApiResponse(responseCode = "403", description = "Not the requester or admin"),
        @ApiResponse(responseCode = "404", description = "Reservation not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        apiReservationService.cancel(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
