package com.unievt.controller;

import com.unievt.dto.RoomDTO;
import com.unievt.service.ApiReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Rooms", description = "Room availability and details")
public class ApiRoomController {

    private final ApiReservationService apiReservationService;

    @Operation(summary = "List available rooms",
               description = "Returns rooms that are free in the given time window. "
                   + "If `dateDebut`/`dateFin` are omitted, returns all rooms. "
                   + "Use `minCapacity` to filter by minimum seating.")
    @ApiResponse(responseCode = "200", description = "List of rooms",
        content = @Content(array = @ArraySchema(schema = @Schema(implementation = RoomDTO.class))))
    @GetMapping
    public List<RoomDTO> listAvailable(
            @Parameter(description = "Window start (ISO datetime)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @Parameter(description = "Window end (ISO datetime)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin,
            @Parameter(description = "Minimum required capacity")
            @RequestParam(required = false) Integer minCapacity) {
        return apiReservationService.listRooms(dateDebut, dateFin, minCapacity);
    }

    @Operation(summary = "Get room by ID")
    @ApiResponse(responseCode = "200", description = "Room details",
        content = @Content(schema = @Schema(implementation = RoomDTO.class)))
    @GetMapping("/{id}")
    public RoomDTO get(@PathVariable Long id) {
        return apiReservationService.getRoom(id);
    }
}
