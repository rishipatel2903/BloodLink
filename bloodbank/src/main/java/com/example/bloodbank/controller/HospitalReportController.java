package com.example.bloodbank.controller;

import com.example.bloodbank.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/hospital")
@CrossOrigin(origins = "*")
public class HospitalReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/{id}/full")
    public void getFullReport(@PathVariable String id, HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=BloodLink_Hospital_Report_" + id + ".pdf";
        response.setHeader(headerKey, headerValue);

        reportService.generateHospitalActivityReport(id, null, null, response);
    }

    @GetMapping("/{id}/range")
    public void getRangeReport(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletResponse response) throws IOException {

        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=BloodLink_Hospital_Report_Range_" + id + ".pdf";
        response.setHeader(headerKey, headerValue);

        reportService.generateHospitalActivityReport(id, from, to, response);
    }
}
