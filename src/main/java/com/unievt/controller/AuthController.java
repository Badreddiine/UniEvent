package com.unievt.controller;

import com.unievt.dto.LoginRequestDTO;
import com.unievt.dto.LoginResponseDTO;
import com.unievt.dto.RefreshTokenRequestDTO;
import com.unievt.dto.RegisterRequestDTO;
import com.unievt.dto.RegisterResponseDTO;
import com.unievt.security.CustomUserDetails;
import com.unievt.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Registration, login, token refresh and logout")
public class AuthController {

    private final AuthService authService;

    // ── POST /api/auth/register ───────────────────────────────────────────────

    @Operation(
        summary = "Register a new account",
        description = "Creates a disabled user and sends a verification email. "
            + "The account must be activated via the link before login is possible.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Account created — verification email sent",
            content = @Content(schema = @Schema(implementation = RegisterResponseDTO.class))),
        @ApiResponse(responseCode = "409", description = "Email already in use"),
        @ApiResponse(responseCode = "400", description = "Validation error")
    })
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(dto));
    }

    // ── GET /api/auth/verify-email ────────────────────────────────────────────

    @Operation(
        summary = "Verify email and activate account",
        description = "Validates the verification token, activates the account and returns JWT tokens.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Email verified — tokens returned",
            content = @Content(schema = @Schema(implementation = LoginResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Token invalid or expired")
    })
    @GetMapping("/verify-email")
    public ResponseEntity<LoginResponseDTO> verifyEmail(@RequestParam("token") String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }

    // ── POST /api/auth/resend-verification ────────────────────────────────────

    @Operation(
        summary = "Resend verification email",
        description = "Generates a fresh verification token and re-sends the activation email.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Verification email re-sent",
            content = @Content(schema = @Schema(implementation = RegisterResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Email already verified"),
        @ApiResponse(responseCode = "404", description = "No account for this email")
    })
    @PostMapping("/resend-verification")
    public ResponseEntity<RegisterResponseDTO> resendVerification(@RequestParam String email) {
        return ResponseEntity.ok(authService.resendVerification(email));
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────

    @Operation(
        summary = "Login",
        description = "Authenticates credentials and returns an access token (15 min) and a refresh token (7 days).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful",
            content = @Content(schema = @Schema(implementation = LoginResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Bad credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    // ── POST /api/auth/refresh ────────────────────────────────────────────────

    @Operation(
        summary = "Refresh access token",
        description = "Exchanges a valid refresh token for a new access token and a rotated refresh token.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tokens rotated",
            content = @Content(schema = @Schema(implementation = LoginResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Refresh token expired or revoked")
    })
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO dto) {
        return ResponseEntity.ok(authService.refresh(dto));
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────────────

    @Operation(
        summary = "Logout",
        description = "Revokes all refresh tokens for the authenticated user. "
            + "Supply `{\"userId\": <id>}` body OR rely on the Bearer token.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Logged out successfully"),
        @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestBody(required = false) Map<String, Long> body,
            Authentication auth) {

        Long userId = null;
        if (body != null) {
            userId = body.get("userId");
        }
        if (userId == null && auth != null) {
            userId = ((CustomUserDetails) auth.getPrincipal()).getId();
        }
        if (userId != null) {
            authService.logout(userId);
        }
        return ResponseEntity.noContent().build();
    }
}
