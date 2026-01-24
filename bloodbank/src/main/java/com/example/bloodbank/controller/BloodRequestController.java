package com.example.bloodbank.controller;

import com.example.bloodbank.model.BloodRequest;
import com.example.bloodbank.service.BloodRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:5174")
public class BloodRequestController {

    @Autowired
    private BloodRequestService service;

    @PostMapping("/create")
    public ResponseEntity<BloodRequest> createRequest(@RequestBody BloodRequest request) {
        return ResponseEntity.ok(service.createRequest(request));
    }

    @GetMapping("/org/pending")
    public ResponseEntity<List<BloodRequest>> getPendingRequests() {
        return ResponseEntity.ok(service.getPendingRequests());
    }

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<BloodRequest>> getOrgRequests(@PathVariable String orgId) {
        return ResponseEntity.ok(service.getOrgRequests(orgId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BloodRequest>> getUserRequests(@PathVariable String userId) {
        return ResponseEntity.ok(service.getUserRequests(userId));
    }

    @PostMapping("/{id}/fulfill")
    public ResponseEntity<BloodRequest> fulfillRequest(@PathVariable String id, @RequestParam String orgId) {
        return ResponseEntity.ok(service.fulfillRequest(id, orgId));
    }

    @GetMapping("/{id}/matching-donors")
    public ResponseEntity<List<com.example.bloodbank.model.User>> getMatchingDonors(@PathVariable String id) {
        return ResponseEntity.ok(service.findMatchingDonors(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BloodRequest> updateStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}
