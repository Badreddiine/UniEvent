package com.unievt.service;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.unievt.entity.Badge;
import com.unievt.entity.Evenement;
import com.unievt.entity.Inscription;
import com.unievt.entity.Reservation;
import com.unievt.entity.Sponsor;
import com.unievt.enums.StatutInscriptionEnum;
import com.unievt.repository.BadgeRepository;
import com.unievt.repository.EvenementRepository;
import com.unievt.repository.InscriptionRepository;
import com.unievt.repository.ReservationRepository;
import com.unievt.repository.SponsorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportService {

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(79, 70, 229);   // indigo-600

    private final EvenementRepository evenementRepository;
    private final InscriptionRepository inscriptionRepository;
    private final ReservationRepository reservationRepository;
    private final SponsorRepository sponsorRepository;
    private final BadgeRepository badgeRepository;

    // ── PDF: attendance report ────────────────────────────────────────────────

    public void writeAttendancePdf(Long eventId, OutputStream out) {
        Evenement event = getEventOrThrow(eventId);
        List<Inscription> inscriptions = inscriptionRepository.findByEvenementId(eventId);

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document doc = new Document(pdfDoc, PageSize.A4.rotate());

            PdfFont bold = PdfFontFactory.createFont("Helvetica-Bold");
            PdfFont regular = PdfFontFactory.createFont("Helvetica");

            // ── Title ──────────────────────────────────────────────────────────
            doc.add(new Paragraph("Rapport de Présence")
                    .setFont(bold).setFontSize(20)
                    .setFontColor(HEADER_COLOR)
                    .setTextAlignment(TextAlignment.CENTER));

            doc.add(new Paragraph(event.getTitre())
                    .setFont(bold).setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER));

            // ── Event details ──────────────────────────────────────────────────
            doc.add(new Paragraph("\n"));
            if (event.getDateDebut() != null) {
                doc.add(new Paragraph("Date : " + event.getDateDebut().format(DT_FMT)
                        + (event.getDateFin() != null ? " → " + event.getDateFin().format(DT_FMT) : ""))
                        .setFont(regular).setFontSize(10));
            }
            if (event.getCapacite() != null) {
                doc.add(new Paragraph("Capacité : " + event.getCapacite())
                        .setFont(regular).setFontSize(10));
            }
            long confirmed = inscriptions.stream()
                    .filter(i -> i.getStatut() == StatutInscriptionEnum.CONFIRMEE).count();
            doc.add(new Paragraph("Inscrits confirmés : " + confirmed
                    + " / " + inscriptions.size() + " total")
                    .setFont(regular).setFontSize(10));
            doc.add(new Paragraph("\n"));

            // ── Attendee table ─────────────────────────────────────────────────
            // Columns: #, Nom, Prénom, Email, Statut, QR
            Table table = new Table(UnitValue.createPercentArray(new float[]{4, 15, 15, 25, 12, 15}))
                    .setWidth(UnitValue.createPercentValue(100));

            addHeaderCell(table, "#", bold);
            addHeaderCell(table, "Nom", bold);
            addHeaderCell(table, "Prénom", bold);
            addHeaderCell(table, "Email", bold);
            addHeaderCell(table, "Statut", bold);
            addHeaderCell(table, "QR Code", bold);

            int idx = 1;
            for (Inscription ins : inscriptions) {
                boolean even = idx % 2 == 0;
                addCell(table, String.valueOf(idx++), regular, even);
                addCell(table, ins.getEtudiant() != null ? ins.getEtudiant().getNom() : "-", regular, even);
                addCell(table, ins.getEtudiant() != null ? ins.getEtudiant().getPrenom() : "-", regular, even);
                addCell(table, ins.getEtudiant() != null ? ins.getEtudiant().getEmail() : "-", regular, even);
                addCell(table, ins.getStatut() != null ? ins.getStatut().name() : "-", regular, even);

                // QR column
                Cell qrCell = new Cell().setPadding(2);
                if (even) qrCell.setBackgroundColor(new DeviceRgb(245, 245, 250));
                Badge badge = ins.getId() != null
                        ? badgeRepository.findByInscriptionId(ins.getId()).orElse(null)
                        : null;
                if (badge != null && badge.getQrData() != null) {
                    try {
                        byte[] imgBytes = Base64.getDecoder().decode(badge.getQrData());
                        Image qrImg = new Image(ImageDataFactory.create(imgBytes))
                                .setWidth(50).setHeight(50);
                        qrCell.add(qrImg);
                    } catch (Exception e) {
                        qrCell.add(new Paragraph("—").setFont(regular).setFontSize(8));
                    }
                } else {
                    qrCell.add(new Paragraph("—").setFont(regular).setFontSize(8));
                }
                table.addCell(qrCell);
            }

            doc.add(table);
            doc.add(new Paragraph("\nGénéré le " + java.time.LocalDateTime.now().format(DT_FMT))
                    .setFont(regular).setFontSize(8).setFontColor(ColorConstants.GRAY));

            doc.close();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors de la génération du PDF: " + e.getMessage());
        }
    }

    // ── Excel: single-event summary ───────────────────────────────────────────

    public void writeEventSummaryExcel(Long eventId, OutputStream out) {
        Evenement event = getEventOrThrow(eventId);
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFCellStyle headerStyle = buildHeaderStyle(wb);
            XSSFCellStyle dataStyle   = buildDataStyle(wb);

            writeStatsSheet(wb, event, headerStyle, dataStyle);
            writeInscriptionsSheet(wb, event, headerStyle, dataStyle);
            writeSallesSheet(wb, event, headerStyle, dataStyle);
            writeSponsorsSheet(wb, event, headerStyle, dataStyle);

            wb.write(out);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors de la génération du Excel: " + e.getMessage());
        }
    }

    // ── Excel: all-events export (admin) ─────────────────────────────────────

    public void writeAllEventsExcel(OutputStream out) {
        List<Evenement> events = evenementRepository.findAll();
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            XSSFCellStyle headerStyle = buildHeaderStyle(wb);
            XSSFCellStyle dataStyle   = buildDataStyle(wb);

            // One summary row per event on a single sheet
            XSSFSheet sheet = wb.createSheet("Tous les événements");
            XSSFRow header = sheet.createRow(0);
            String[] cols = {"ID", "Titre", "Catégorie", "Statut", "Date Début", "Date Fin",
                             "Capacité", "Confirmés", "En attente", "Annulés"};
            for (int i = 0; i < cols.length; i++) {
                var cell = header.createCell(i);
                cell.setCellValue(cols[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Evenement e : events) {
                XSSFRow row = sheet.createRow(rowIdx++);
                long confirmed  = inscriptionRepository.countByEvenementIdAndStatut(
                        e.getId(), StatutInscriptionEnum.CONFIRMEE);
                long waitlisted = inscriptionRepository.countByEvenementIdAndStatut(
                        e.getId(), StatutInscriptionEnum.LISTE_ATTENTE);
                long cancelled  = inscriptionRepository.countByEvenementIdAndStatut(
                        e.getId(), StatutInscriptionEnum.ANNULEE);

                Object[] values = {
                    e.getId(),
                    e.getTitre(),
                    e.getCategorie() != null ? e.getCategorie().name() : "",
                    e.getStatut() != null ? e.getStatut().name() : "",
                    e.getDateDebut() != null ? e.getDateDebut().format(DT_FMT) : "",
                    e.getDateFin() != null ? e.getDateFin().format(DT_FMT) : "",
                    e.getCapacite(),
                    confirmed,
                    waitlisted,
                    cancelled
                };
                for (int i = 0; i < values.length; i++) {
                    var cell = row.createCell(i);
                    if (values[i] instanceof Number n) {
                        cell.setCellValue(n.doubleValue());
                    } else if (values[i] != null) {
                        cell.setCellValue(values[i].toString());
                    }
                    cell.setCellStyle(dataStyle);
                }
            }

            for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);
            wb.write(out);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors de la génération du Excel: " + e.getMessage());
        }
    }

    // ── Private sheet builders ────────────────────────────────────────────────

    private void writeStatsSheet(XSSFWorkbook wb, Evenement event,
                                  XSSFCellStyle hs, XSSFCellStyle ds) {
        XSSFSheet sheet = wb.createSheet("Résumé");
        long confirmed  = inscriptionRepository.countByEvenementIdAndStatut(
                event.getId(), StatutInscriptionEnum.CONFIRMEE);
        long waitlisted = inscriptionRepository.countByEvenementIdAndStatut(
                event.getId(), StatutInscriptionEnum.LISTE_ATTENTE);
        long cancelled  = inscriptionRepository.countByEvenementIdAndStatut(
                event.getId(), StatutInscriptionEnum.ANNULEE);

        Object[][] data = {
            {"Titre",        event.getTitre()},
            {"Catégorie",    event.getCategorie() != null ? event.getCategorie().name() : ""},
            {"Statut",       event.getStatut() != null ? event.getStatut().name() : ""},
            {"Date début",   event.getDateDebut() != null ? event.getDateDebut().format(DT_FMT) : ""},
            {"Date fin",     event.getDateFin() != null ? event.getDateFin().format(DT_FMT) : ""},
            {"Capacité",     event.getCapacite()},
            {"Confirmés",    confirmed},
            {"En attente",   waitlisted},
            {"Annulés",      cancelled},
            {"Taux remplissage", event.getCapacite() != null && event.getCapacite() > 0
                    ? String.format("%.1f%%", confirmed * 100.0 / event.getCapacite()) : "N/A"},
        };

        int r = 0;
        for (Object[] row : data) {
            XSSFRow xRow = sheet.createRow(r++);
            var labelCell = xRow.createCell(0);
            labelCell.setCellValue(row[0].toString());
            labelCell.setCellStyle(hs);
            var valCell = xRow.createCell(1);
            if (row[1] instanceof Number n) valCell.setCellValue(n.doubleValue());
            else if (row[1] != null) valCell.setCellValue(row[1].toString());
            valCell.setCellStyle(ds);
        }
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void writeInscriptionsSheet(XSSFWorkbook wb, Evenement event,
                                         XSSFCellStyle hs, XSSFCellStyle ds) {
        XSSFSheet sheet = wb.createSheet("Inscriptions");
        String[] cols = {"#", "Nom", "Prénom", "Email", "Téléphone", "Statut", "Date Inscription"};
        writeHeaderRow(sheet, cols, hs);

        List<Inscription> list = inscriptionRepository.findByEvenementId(event.getId());
        int r = 1;
        for (Inscription ins : list) {
            XSSFRow row = sheet.createRow(r++);
            String[] vals = {
                String.valueOf(r - 1),
                ins.getEtudiant() != null ? ins.getEtudiant().getNom() : "",
                ins.getEtudiant() != null ? ins.getEtudiant().getPrenom() : "",
                ins.getEtudiant() != null ? ins.getEtudiant().getEmail() : "",
                ins.getEtudiant() != null ? ins.getEtudiant().getTelephone() : "",
                ins.getStatut() != null ? ins.getStatut().name() : "",
                ins.getDateInscription() != null ? ins.getDateInscription().format(DT_FMT) : ""
            };
            for (int i = 0; i < vals.length; i++) {
                var cell = row.createCell(i);
                cell.setCellValue(vals[i]);
                cell.setCellStyle(ds);
            }
        }
        for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);
    }

    private void writeSallesSheet(XSSFWorkbook wb, Evenement event,
                                   XSSFCellStyle hs, XSSFCellStyle ds) {
        XSSFSheet sheet = wb.createSheet("Salles");
        String[] cols = {"Salle", "Statut", "Date début", "Date fin", "Durée (h)"};
        writeHeaderRow(sheet, cols, hs);

        List<Reservation> reservations = reservationRepository.findByEvenementId(event.getId());
        int r = 1;
        for (Reservation res : reservations) {
            XSSFRow row = sheet.createRow(r++);
            double hours = 0;
            if (res.getDateDebut() != null && res.getDateFin() != null) {
                hours = java.time.Duration.between(res.getDateDebut(), res.getDateFin())
                        .toMinutes() / 60.0;
            }
            Object[] vals = {
                res.getSalle() != null ? res.getSalle().getNom() : "",
                res.getStatut() != null ? res.getStatut().name() : "",
                res.getDateDebut() != null ? res.getDateDebut().format(DT_FMT) : "",
                res.getDateFin() != null ? res.getDateFin().format(DT_FMT) : "",
                hours
            };
            for (int i = 0; i < vals.length; i++) {
                var cell = row.createCell(i);
                if (vals[i] instanceof Number n) cell.setCellValue(n.doubleValue());
                else if (vals[i] != null) cell.setCellValue(vals[i].toString());
                cell.setCellStyle(ds);
            }
        }
        for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);
    }

    private void writeSponsorsSheet(XSSFWorkbook wb, Evenement event,
                                     XSSFCellStyle hs, XSSFCellStyle ds) {
        XSSFSheet sheet = wb.createSheet("Sponsors");
        String[] cols = {"Partenaire", "Niveau", "Montant (MAD)", "Confirmé"};
        writeHeaderRow(sheet, cols, hs);

        List<Sponsor> sponsors = sponsorRepository.findByEvenementId(event.getId());
        int r = 1;
        for (Sponsor sp : sponsors) {
            XSSFRow row = sheet.createRow(r++);
            Object[] vals = {
                sp.getPartenaire() != null ? sp.getPartenaire().getNom() : "",
                sp.getNiveau() != null ? sp.getNiveau().name() : "",
                sp.getMontant(),
                sp.isConfirme() ? "Oui" : "Non"
            };
            for (int i = 0; i < vals.length; i++) {
                var cell = row.createCell(i);
                if (vals[i] instanceof Number n) cell.setCellValue(n.doubleValue());
                else if (vals[i] != null) cell.setCellValue(vals[i].toString());
                cell.setCellStyle(ds);
            }
        }
        for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);
    }

    // ── Style helpers ─────────────────────────────────────────────────────────

    private XSSFCellStyle buildHeaderStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        // Indigo-600 (#4F46E5) — XSSFColor since IndexedColors has no INDIGO constant
        style.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 0x4F, (byte) 0x46, (byte) 0xE5}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        XSSFFont font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        return style;
    }

    private XSSFCellStyle buildDataStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.HAIR);
        style.setBorderRight(BorderStyle.HAIR);
        return style;
    }

    private void writeHeaderRow(XSSFSheet sheet, String[] cols, XSSFCellStyle style) {
        XSSFRow row = sheet.createRow(0);
        for (int i = 0; i < cols.length; i++) {
            var cell = row.createCell(i);
            cell.setCellValue(cols[i]);
            cell.setCellStyle(style);
        }
    }

    private void addHeaderCell(Table table, String text, PdfFont font) {
        table.addHeaderCell(new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(9).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(HEADER_COLOR)
                .setPadding(4));
    }

    private void addCell(Table table, String text, PdfFont font, boolean shaded) {
        Cell cell = new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(8))
                .setPadding(3);
        if (shaded) cell.setBackgroundColor(new DeviceRgb(245, 245, 250));
        table.addCell(cell);
    }

    private Evenement getEventOrThrow(Long id) {
        return evenementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Événement introuvable: " + id));
    }
}
