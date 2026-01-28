package com.example.bloodbank.controller;

import com.example.bloodbank.model.BloodRequest;
import com.example.bloodbank.model.Hospital;
import com.example.bloodbank.service.BloodRequestService;
import com.example.bloodbank.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital")
@CrossOrigin(origins = "*")
public class HospitalController {

    @Autowired
    private HospitalService hospitalService;

    @Autowired
    private BloodRequestService requestService;

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospital(@PathVariable String id) {
        return hospitalService.getHospitalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/requests/create")
    public ResponseEntity<BloodRequest> createRequest(@RequestBody BloodRequest request) {
        return ResponseEntity.ok(requestService.createRequest(request));
    }

    @GetMapping("/{id}/requests")
    public ResponseEntity<List<BloodRequest>> getHospitalRequests(@PathVariable String id) {
        return ResponseEntity.ok(requestService.getHospitalRequests(id));
    }

    @GetMapping("/dashboard/stats/{id}")
    public ResponseEntity<java.util.Map<String, Object>> getStats(@PathVariable String id) {
        List<BloodRequest> requests = requestService.getHospitalRequests(id);

        long total = requests.size();
        long fulfilled = requests.stream().filter(r -> "UTILIZED".equalsIgnoreCase(r.getStatus())).count();
        long pending = requests.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus())).count();
        long approved = requests.stream().filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus())).count();
        long critical = requests.stream().filter(r -> "CRITICAL".equalsIgnoreCase(r.getUrgency())).count();

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalRequests", total);
        stats.put("fulfilledRequests", fulfilled);
        stats.put("pendingRequests", pending);
        stats.put("approvedRequests", approved);
        stats.put("criticalShortages", critical);

        return ResponseEntity.ok(stats);
    }
}
