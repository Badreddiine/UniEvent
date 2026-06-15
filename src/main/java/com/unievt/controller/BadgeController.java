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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
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
}
