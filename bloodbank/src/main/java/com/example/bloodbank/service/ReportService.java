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

    public void generateUserActivityReport(String userId, LocalDate fromDate, LocalDate toDate,
            HttpServletResponse response) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DonationRequest> donations = donationRepository.findByUserId(userId);
        List<BloodRequest> requests = requestRepository.findByUserId(userId);

        // Filter by date if provided
        if (fromDate != null && toDate != null) {
            donations = donations.stream()
                    .filter(d -> !d.getAppointmentDate().isBefore(fromDate) && !d.getAppointmentDate().isAfter(toDate))
                    .collect(Collectors.toList());
            requests = requests.stream()
                    .filter(r -> r.getRequestedAt() != null &&
                            !r.getRequestedAt().toLocalDate().isBefore(fromDate) &&
                            !r.getRequestedAt().toLocalDate().isAfter(toDate))
                    .collect(Collectors.toList());
        }

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.RED);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.DARK_GRAY);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY);

        // Header
        Paragraph header = new Paragraph("BloodLink", titleFont);
        header.setAlignment(Element.ALIGN_CENTER);
        document.add(header);

        Paragraph subHeader = new Paragraph("User Activity Report", subTitleFont);
        subHeader.setAlignment(Element.ALIGN_CENTER);
        subHeader.setSpacingAfter(20);
        document.add(subHeader);

        // Metadata
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        document.add(new Paragraph("Generated On: " + LocalDateTime.now().format(dtf), normalFont));
        document.add(new Paragraph("Report ID: BL-REP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                normalFont));
        document.add(new Paragraph("User ID: " + user.getId(), normalFont));
        document.add(new Paragraph(" "));

        // User Details
        document.add(new Paragraph("User Details", subTitleFont));
        document.add(new Paragraph("Name: " + user.getName(), normalFont));
        document.add(new Paragraph("Email: " + user.getEmail(), normalFont));
        document.add(
                new Paragraph("Phone: " + (user.getPhoneNumber() != null ? user.getPhoneNumber() : "N/A"), normalFont));
        document.add(new Paragraph("Blood Group: " + (user.getBloodGroup() != null ? user.getBloodGroup() : "N/A"),
                normalFont));
        document.add(new Paragraph(" "));

        // Activity Summary
        long completedDonations = donations.stream().filter(d -> "COMPLETED".equals(d.getStatus())).count();
        long totalRequests = requests.size();
        int totalUnitsDonated = (int) completedDonations; // Assuming 1 unit per donation as per completeDonation logic

        document.add(new Paragraph("Activity Summary", subTitleFont));
        document.add(new Paragraph("Total Activities: " + (donations.size() + requests.size()), normalFont));
        document.add(new Paragraph("Total Donations: " + donations.size() + " (" + completedDonations + " Completed)",
                normalFont));
        document.add(new Paragraph("Total Requests: " + totalRequests, normalFont));
        document.add(new Paragraph("Units Donated: " + totalUnitsDonated, normalFont));
        document.add(new Paragraph(
                "Last Donation Date: "
                        + (user.getLastDonatedDate() != null ? user.getLastDonatedDate().format(dtf) : "Never"),
                normalFont));
        document.add(new Paragraph(" "));

        // Detailed Activity Table
        document.add(new Paragraph("Detailed Activity Log", subTitleFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 2.5f, 2.5f, 4.0f, 2.0f, 1.5f, 2.5f });

        // Table Header
        String[] headers = { "Date", "Activity", "Organization", "Group", "Units", "Status" };
        for (String columnHeader : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(columnHeader, boldFont));
            cell.setBackgroundColor(Color.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        // Combine and Sort Activities
        // For simplicity, we'll just add them sequentially. A proper sort by date would
        // be better.
        // Donation rows
        for (DonationRequest d : donations) {
            table.addCell(d.getAppointmentDate().toString());
            table.addCell("Donation");
            table.addCell(getOrgName(d.getOrganizationId()));
            table.addCell(d.getBloodGroup());
            table.addCell("1");
            table.addCell(d.getStatus());
        }

        // Request rows
        for (BloodRequest r : requests) {
            table.addCell(r.getRequestedAt() != null ? r.getRequestedAt().toLocalDate().toString() : "N/A");
            table.addCell("Request");
            table.addCell(r.getHospitalName()); // For requests, we show hospital or target org
            table.addCell(r.getBloodGroup());
            table.addCell(String.valueOf(r.getUnits()));
            table.addCell(r.getStatus());
        }

        document.add(table);

        // Footer
        Paragraph footer = new Paragraph("\n\nGenerated by BloodLink System\nThis is a digitally generated report.",
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
