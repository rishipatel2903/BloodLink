package com.example.bloodbank.service;

import com.example.bloodbank.model.*;
import com.example.bloodbank.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;
import java.awt.*;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportService {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private DonationRequestRepository donationRepository;

        @Autowired
        private BloodRequestRepository requestRepository;

        @Autowired
        private OrganizationRepository organizationRepository;

        @Autowired
        private HospitalRepository hospitalRepository;

        public void generateUserActivityReport(String userId, LocalDate fromDate, LocalDate toDate,
                        HttpServletResponse response) throws IOException {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<DonationRequest> donations = donationRepository.findByUserId(userId);

                if (fromDate != null && toDate != null) {
                        donations = donations.stream()
                                        .filter(d -> !d.getAppointmentDate().isBefore(fromDate)
                                                        && !d.getAppointmentDate().isAfter(toDate))
                                        .collect(Collectors.toList());
                }

                Document document = new Document(PageSize.A4);
                PdfWriter.getInstance(document, response.getOutputStream());

                document.open();

                Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.RED);
                Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
                Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
                Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
                Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY);

                Paragraph header = new Paragraph("BloodLink", titleFont);
                header.setAlignment(Element.ALIGN_CENTER);
                document.add(header);

                Paragraph subHeader = new Paragraph("User Activity Report", subTitleFont);
                subHeader.setAlignment(Element.ALIGN_CENTER);
                subHeader.setSpacingAfter(20);
                document.add(subHeader);

                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
                document.add(new Paragraph("Generated On: " + LocalDateTime.now().format(dtf), normalFont));
                document.add(new Paragraph(
                                "Report ID: BL-REP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                                normalFont));
                document.add(new Paragraph("User ID: " + user.getId(), normalFont));
                document.add(new Paragraph(" "));

                document.add(new Paragraph("User Details", subTitleFont));
                document.add(new Paragraph("Name: " + user.getName(), normalFont));
                document.add(new Paragraph("Email: " + user.getEmail(), normalFont));
                document.add(new Paragraph("Phone: " + (user.getPhoneNumber() != null ? user.getPhoneNumber() : "N/A"),
                                normalFont));
                document.add(new Paragraph(
                                "Blood Group: " + (user.getBloodGroup() != null ? user.getBloodGroup() : "N/A"),
                                normalFont));
                document.add(new Paragraph(" "));

                long completedDonations = donations.stream().filter(d -> "COMPLETED".equals(d.getStatus())).count();
                int totalUnitsDonated = (int) completedDonations;

                document.add(new Paragraph("Activity Summary", subTitleFont));
                document.add(new Paragraph(
                                "Total Donations: " + donations.size() + " (" + completedDonations + " Completed)",
                                normalFont));
                document.add(new Paragraph("Units Donated: " + totalUnitsDonated, normalFont));
                document.add(new Paragraph("Last Donation Date: "
                                + (user.getLastDonatedDate() != null ? user.getLastDonatedDate().format(dtf) : "Never"),
                                normalFont));
                document.add(new Paragraph(" "));

                document.add(new Paragraph("Detailed Activity Log", subTitleFont));
                document.add(new Paragraph(" "));

                PdfPTable table = new PdfPTable(6);
                table.setWidthPercentage(100);
                table.setWidths(new float[] { 2.5f, 2.5f, 4.0f, 2.0f, 1.5f, 2.5f });

                String[] headers = { "Date", "Activity", "Organization", "Group", "Units", "Status" };
                for (String columnHeader : headers) {
                        PdfPCell cell = new PdfPCell(new Phrase(columnHeader, boldFont));
                        cell.setBackgroundColor(Color.LIGHT_GRAY);
                        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        table.addCell(cell);
                }

                for (DonationRequest d : donations) {
                        table.addCell(d.getAppointmentDate().toString());
                        table.addCell("Donation");
                        table.addCell(getOrgName(d.getOrganizationId()));
                        table.addCell(d.getBloodGroup());
                        table.addCell("1");
                        table.addCell(d.getStatus());
                }

                document.add(table);

                Paragraph footer = new Paragraph(
                                "\n\nGenerated by BloodLink System\nThis is a digitally generated report.",
                                footerFont);
                footer.setAlignment(Element.ALIGN_CENTER);
                document.add(footer);

                document.close();
        }

        public void generateHospitalActivityReport(String hospitalId, LocalDate fromDate, LocalDate toDate,
                        HttpServletResponse response) throws IOException {
                Hospital hospital = hospitalRepository.findById(hospitalId)
                                .orElseThrow(() -> new RuntimeException("Hospital not found"));

                List<BloodRequest> requests = requestRepository.findByHospitalId(hospitalId);

                if (fromDate != null && toDate != null) {
                        requests = requests.stream()
                                        .filter(r -> r.getRequestedAt() != null &&
                                                        !r.getRequestedAt().toLocalDate().isBefore(fromDate) &&
                                                        !r.getRequestedAt().toLocalDate().isAfter(toDate))
                                        .collect(Collectors.toList());
                }

                Document document = new Document(PageSize.A4);
                PdfWriter.getInstance(document, response.getOutputStream());

                document.open();

                Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.RED);
                Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
                Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
                Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
                Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY);

                Paragraph header = new Paragraph("BloodLink", titleFont);
                header.setAlignment(Element.ALIGN_CENTER);
                document.add(header);

                Paragraph subHeader = new Paragraph("Hospital Activity Report", subTitleFont);
                subHeader.setAlignment(Element.ALIGN_CENTER);
                subHeader.setSpacingAfter(20);
                document.add(subHeader);

                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
                document.add(new Paragraph("Generated On: " + LocalDateTime.now().format(dtf), normalFont));
                document.add(new Paragraph(
                                "Report ID: BL-HSP-REP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                                normalFont));
                document.add(new Paragraph("Hospital ID: " + hospital.getId(), normalFont));
                document.add(new Paragraph(" "));

                document.add(new Paragraph("Hospital Details", subTitleFont));
                document.add(new Paragraph("Name: " + hospital.getName(), normalFont));
                document.add(new Paragraph("Email: " + hospital.getEmail(), normalFont));
                document.add(new Paragraph("License: " + hospital.getLicenseNumber(), normalFont));
                document.add(new Paragraph("Address: " + hospital.getAddress(), normalFont));
                document.add(new Paragraph(" "));

                long total = requests.size();
                long fulfilled = requests.stream().filter(r -> "UTILIZED".equalsIgnoreCase(r.getStatus())).count();
                long pending = requests.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus())).count();
                long approved = requests.stream().filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus())).count();
                int units = requests.stream().mapToInt(BloodRequest::getUnits).sum();

                document.add(new Paragraph("Activity Summary", subTitleFont));
                document.add(new Paragraph("Total Requests: " + total, normalFont));
                document.add(new Paragraph("Fulfilled: " + fulfilled, normalFont));
                document.add(new Paragraph("Pending: " + pending, normalFont));
                document.add(new Paragraph("Approved: " + approved, normalFont));
                document.add(new Paragraph("Total Units Requested: " + units, normalFont));
                document.add(new Paragraph(" "));

                document.add(new Paragraph("Detailed Request Log", subTitleFont));
                document.add(new Paragraph(" "));

                PdfPTable table = new PdfPTable(6);
                table.setWidthPercentage(100);
                table.setWidths(new float[] { 2.5f, 2.0f, 1.5f, 3.5f, 2.0f, 2.5f });

                String[] headers = { "Date", "Group", "Units", "Organization", "Urgency", "Status" };
                for (String columnHeader : headers) {
                        PdfPCell cell = new PdfPCell(new Phrase(columnHeader, boldFont));
                        cell.setBackgroundColor(Color.LIGHT_GRAY);
                        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        table.addCell(cell);
                }

                for (BloodRequest r : requests) {
                        table.addCell(r.getRequestedAt() != null ? r.getRequestedAt().toLocalDate().toString() : "N/A");
                        table.addCell(r.getBloodGroup());
                        table.addCell(String.valueOf(r.getUnits()));
                        table.addCell(getOrgName(r.getOrganizationId()));
                        table.addCell(r.getUrgency());
                        table.addCell(r.getStatus());
                }

                document.add(table);

                Paragraph footer = new Paragraph(
                                "\n\nGenerated by BloodLink System\nThis is a digitally generated report.",
                                footerFont);
                footer.setAlignment(Element.ALIGN_CENTER);
                document.add(footer);

                document.close();
        }

        private String getOrgName(String orgId) {
                if (orgId == null)
                        return "N/A";
                return organizationRepository.findById(orgId)
                                .map(Organization::getName)
                                .orElse("Unknown Org");
        }
}
