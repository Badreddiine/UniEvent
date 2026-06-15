package com.unievt.controller;

import com.unievt.dto.CreatePartnerRequest;
import com.unievt.dto.PartnerDto;
import com.unievt.service.ApiPartnerService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/partners")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Partners", description = "Partner organisation management (admin only for write operations)")
public class ApiPartnerController {

    private final ApiPartnerService apiPartnerService;

    @Operation(summary = "List all partners (paginated)")
    @ApiResponse(responseCode = "200", description = "Page of partners")
    @GetMapping
    public Page<PartnerDto> list(
            @PageableDefault(size = 20, sort = "nom", direction = Sort.Direction.ASC)
            @Parameter(hidden = true) Pageable pageable) {
        return apiPartnerService.listPartners(pageable);
    }

    @Operation(summary = "Get partner by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Partner found",
            content = @Content(schema = @Schema(implementation = PartnerDto.class))),
        @ApiResponse(responseCode = "404", description = "Partner not found")
    })
    @GetMapping("/{id}")
    public PartnerDto get(@PathVariable UUID id) {
        return apiPartnerService.getPartner(id);
    }

    @Operation(summary = "Create a partner (admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Partner created",
            content = @Content(schema = @Schema(implementation = PartnerDto.class))),
        @ApiResponse(responseCode = "409", description = "Name already in use")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<PartnerDto> create(@Valid @RequestBody CreatePartnerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(apiPartnerService.createPartner(request));
    }

    @Operation(summary = "Update a partner (admin only)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Partner updated",
            content = @Content(schema = @Schema(implementation = PartnerDto.class))),
        @ApiResponse(responseCode = "404", description = "Partner not found")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public PartnerDto update(
            @PathVariable UUID id,
            @Valid @RequestBody CreatePartnerRequest request) {
        return apiPartnerService.updatePartner(id, request);
    }

    @Operation(summary = "Delete a partner (admin only)")
    @ApiResponse(responseCode = "204", description = "Partner deleted")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        apiPartnerService.deletePartner(id);
        return ResponseEntity.noContent().build();
    }
}
