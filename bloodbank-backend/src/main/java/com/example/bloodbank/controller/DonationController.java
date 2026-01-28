package com.example.bloodbank.controller;

import com.example.bloodbank.model.DonationRequest;
import com.example.bloodbank.service.DonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "http://localhost:5174")
public class DonationController {

    @Autowired
    private DonationService service;

    @PostMapping("/book")
    public ResponseEntity<DonationRequest> bookAppointment(@RequestBody DonationRequest request) {
        return ResponseEntity.ok(service.bookAppointment(request));
    }

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<DonationRequest>> getOrgRequests(@PathVariable String orgId) {
        return ResponseEntity.ok(service.getOrgRequests(orgId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DonationRequest>> getUserRequests(@PathVariable String userId) {
        return ResponseEntity.ok(service.getUserRequests(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DonationRequest> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<DonationRequest> completeDonation(@PathVariable String id) {
        return ResponseEntity.ok(service.completeDonation(id));
    }

    @GetMapping("/eligibility/{userId}")
    public ResponseEntity<com.example.bloodbank.dto.EligibilityResponse> getEligibility(@PathVariable String userId) {
        return ResponseEntity.ok(service.getEligibility(userId));
    }
}
