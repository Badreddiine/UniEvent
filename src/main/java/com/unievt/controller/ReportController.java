package com.unievt.controller;

import com.unievt.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Reports", description = "PDF and Excel report generation")
public class ReportController {

    private static final MediaType PDF  = MediaType.APPLICATION_PDF;
    private static final MediaType XLSX =
            MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final ReportService reportService;

    // ── PDF: attendance ───────────────────────────────────────────────────────

    @Operation(summary = "Event attendance report (PDF)",
               description = "Generates a PDF listing all registrations for the event, "
                   + "including a QR-code column where badges exist. "
                   + "Response is streamed — no full buffering in memory.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "PDF file"),
        @ApiResponse(responseCode = "404", description = "Event not found")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_EVENEMENTS')")
    @GetMapping("/events/{id}/attendance.pdf")
    public ResponseEntity<StreamingResponseBody> attendancePdf(
            @Parameter(description = "Event ID") @PathVariable Long id) {

        StreamingResponseBody body = out -> reportService.writeAttendancePdf(id, out);

        return ResponseEntity.ok()
                .contentType(PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"attendance-event-" + id + ".pdf\"")
                .body(body);
    }

    // ── Excel: single-event summary ───────────────────────────────────────────

    @Operation(summary = "Event summary report (Excel)",
               description = "Generates an Excel workbook with four sheets: "
                   + "Résumé (stats), Inscriptions (attendee list), Salles (room bookings), Sponsors.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Excel file (.xlsx)"),
        @ApiResponse(responseCode = "404", description = "Event not found")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_EVENEMENTS')")
    @GetMapping("/events/{id}/summary.xlsx")
    public ResponseEntity<StreamingResponseBody> summaryExcel(
            @Parameter(description = "Event ID") @PathVariable Long id) {

        StreamingResponseBody body = out -> reportService.writeEventSummaryExcel(id, out);

        return ResponseEntity.ok()
                .contentType(XLSX)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"summary-event-" + id + ".xlsx\"")
                .body(body);
    }

    // ── Excel: all-events export ──────────────────────────────────────────────

    @Operation(summary = "All-events export (Excel, admin only)",
               description = "Generates an Excel workbook listing every event with registration counts. "
                   + "Admin role required.")
    @ApiResponse(responseCode = "200", description = "Excel file (.xlsx)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/events/export.xlsx")
    public ResponseEntity<StreamingResponseBody> exportAllEvents() {

        StreamingResponseBody body = out -> reportService.writeAllEventsExcel(out);

        return ResponseEntity.ok()
                .contentType(XLSX)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"events-export.xlsx\"")
                .body(body);
    }
}
