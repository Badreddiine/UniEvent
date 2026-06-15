package com.unievt.controller;

import com.unievt.dto.NotificationResponseDTO;
import com.unievt.security.CustomUserDetails;
import com.unievt.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Notifications", description = "User notification inbox")
public class ApiNotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "List my notifications (paginated)",
               description = "Returns the authenticated user's notifications, most recent first.")
    @ApiResponse(responseCode = "200", description = "Notification page")
    @GetMapping
    public Page<NotificationResponseDTO> list(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PageableDefault(size = 20, sort = "dateEnvoi", direction = Sort.Direction.DESC)
            @Parameter(hidden = true) Pageable pageable) {
        return notificationService.listerParDestinatairePage(currentUser.getId(), pageable);
    }

    @Operation(summary = "Mark a notification as read")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Notification marked read",
            content = @Content(schema = @Schema(implementation = NotificationResponseDTO.class))),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @PatchMapping("/{id}/read")
    public NotificationResponseDTO markRead(@PathVariable Long id) {
        return notificationService.marquerLue(id);
    }

    @Operation(summary = "Mark all notifications as read",
               description = "Marks every unread notification of the authenticated user as read.")
    @ApiResponse(responseCode = "204", description = "All notifications marked read")
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        notificationService.marquerToutesLues(currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
