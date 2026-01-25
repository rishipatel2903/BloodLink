package com.example.bloodbank.controller;

import com.example.bloodbank.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*") // Adjust based on your security config
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/user/{id}/full")
    public void getFullReport(@PathVariable String id, HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=BloodLink_User_Report_" + id + ".pdf";
        response.setHeader(headerKey, headerValue);

        reportService.generateUserActivityReport(id, null, null, response);
    }

    @GetMapping("/user/{id}/range")
    public void getRangeReport(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletResponse response) throws IOException {

        response.setContentType("application/pdf");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=BloodLink_User_Report_Range_" + id + ".pdf";
        response.setHeader(headerKey, headerValue);

        reportService.generateUserActivityReport(id, from, to, response);
    }
}
