package com.unievt.controller;

import com.unievt.dto.RoleUpdateDTO;
import com.unievt.dto.UpdateMeDTO;
import com.unievt.dto.UserDTO;
import com.unievt.security.CustomUserDetails;
import com.unievt.service.UtilisateurService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Users", description = "User profile management and admin operations")
public class UserController {

    private final UtilisateurService utilisateurService;

    // ── GET /api/users/me ─────────────────────────────────────────────────────

    @Operation(summary = "Get own profile",
               description = "Returns the profile of the currently authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile returned",
            content = @Content(schema = @Schema(implementation = UserDTO.class))),
        @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @GetMapping("/me")
    public UserDTO getMe(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return utilisateurService.lireAsUserDTO(currentUser.getId());
    }

    // ── PUT /api/users/me ─────────────────────────────────────────────────────

    @Operation(summary = "Update own profile",
               description = "Updates nom, prenom, photo, telephone. "
                   + "Email and password changes require dedicated endpoints.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated",
            content = @Content(schema = @Schema(implementation = UserDTO.class))),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @PutMapping("/me")
    public UserDTO updateMe(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody UpdateMeDTO dto) {
        return utilisateurService.modifierMe(currentUser.getId(), dto);
    }

    // ── GET /api/users ────────────────────────────────────────────────────────

    @Operation(summary = "List all users (admin only)",
               description = "Returns a paginated list of all users. "
                   + "Supports Spring Data Pageable: `?page=0&size=20&sort=nom,asc`.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Page of users"),
        @ApiResponse(responseCode = "401", description = "Not authenticated"),
        @ApiResponse(responseCode = "403", description = "Requires ADMIN role")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public Page<UserDTO> listUsers(
            @PageableDefault(size = 20, sort = "nom", direction = Sort.Direction.ASC)
            @Parameter(hidden = true) Pageable pageable) {
        return utilisateurService.listerPage(pageable);
    }

    // ── PUT /api/users/{id}/roles ─────────────────────────────────────────────

    @Operation(summary = "Assign a role to a user (admin only)",
               description = "Replaces the user's current permission role. "
                   + "Set `role` to ADMIN, DOYEN, or RESPONSABLE_EVENEMENTS.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Role updated",
            content = @Content(schema = @Schema(implementation = UserDTO.class))),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "403", description = "Requires ADMIN role"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/roles")
    public UserDTO updateRole(
            @Parameter(description = "User ID", required = true) @PathVariable Long id,
            @Valid @RequestBody RoleUpdateDTO dto) {
        utilisateurService.changerRole(id, dto.getRole());
        return utilisateurService.lireAsUserDTO(id);
    }

    // ── DELETE /api/users/{id} ────────────────────────────────────────────────

    @Operation(summary = "Delete a user (admin only)",
               description = "Permanently removes the user and all associated data.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "User deleted"),
        @ApiResponse(responseCode = "403", description = "Requires ADMIN role"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID", required = true) @PathVariable Long id) {
        utilisateurService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
