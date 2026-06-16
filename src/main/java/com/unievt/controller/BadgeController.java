package com.unievt.controller;

import com.unievt.dto.BadgeDto;
import com.unievt.service.BadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Badges", description = "QR-code badge generation and verification")
public class BadgeController {

    private final BadgeService badgeService;

    @Operation(summary = "Generate / get badge for a registration",
               description = "Generates a QR-code badge for the given registration (idempotent — returns existing badge if already generated). "
                   + "The `qrImage` field contains a Base64-encoded PNG.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Badge generated",
            content = @Content(schema = @Schema(implementation = BadgeDto.class))),
        @ApiResponse(responseCode = "200", description = "Existing badge returned",
            content = @Content(schema = @Schema(implementation = BadgeDto.class))),
        @ApiResponse(responseCode = "404", description = "Registration not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/api/registrations/{id}/badge")
    public ResponseEntity<BadgeDto> generateBadge(
            @Parameter(description = "Registration (inscription) ID") @PathVariable Long id) {
        BadgeDto dto = badgeService.generateForRegistration(id);
        // 201 on first creation, 200 if it already existed — we detect by checking if genereLe is recent
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @Operation(summary = "Get (or lazily create) the badge for a registration",
               description = "Idempotent GET: returns the existing badge, creating it on first access. "
                   + "Safe for clients that may fire duplicate requests. "
                   + "The `qrImage` field contains a Base64-encoded PNG.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Badge returned",
            content = @Content(schema = @Schema(implementation = BadgeDto.class))),
        @ApiResponse(responseCode = "404", description = "Registration not found")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/registrations/{id}/badge")
    public ResponseEntity<BadgeDto> getBadge(
            @Parameter(description = "Registration (inscription) ID") @PathVariable Long id,
            Authentication authentication) {
        log.info("GET badge called for id={} by user={}",
            id, authentication != null ? authentication.getName() : "null");
        return ResponseEntity.ok(badgeService.generateForRegistration(id));
    }

    @Operation(summary = "Verify a badge token (public endpoint)",
               description = "Validates a badge token and returns badge details. "
                   + "No authentication required — suitable for scanning at event entry.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Valid badge",
            content = @Content(schema = @Schema(implementation = BadgeDto.class))),
        @ApiResponse(responseCode = "404", description = "Token not found / invalid")
    })
    @GetMapping("/api/badges/verify/{token}")
    public BadgeDto verifyBadge(
            @Parameter(description = "Badge UUID token") @PathVariable UUID token) {
        return badgeService.verifyToken(token);
    }

    @Operation(summary = "Check in an attendee via badge token (public endpoint)",
               description = "Validates the badge token and marks the linked registration as present. "
                   + "No authentication required — suitable for scanning from any device at event entry. "
                   + "Idempotent: checking in twice is a no-op.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Attendee checked in",
            content = @Content(schema = @Schema(implementation = BadgeDto.class))),
        @ApiResponse(responseCode = "404", description = "Token not found / invalid")
    })
    @PatchMapping("/api/badges/verify/{token}/check-in")
    public BadgeDto checkIn(
            @Parameter(description = "Badge UUID token") @PathVariable UUID token) {
        return badgeService.checkIn(token);
    }
}
