package com.example.bloodbank.controller;

import com.example.bloodbank.model.Hospital;
import com.example.bloodbank.service.HospitalService;
import com.example.bloodbank.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hospital")
@CrossOrigin(origins = "*")
public class HospitalAuthController {

    @Autowired
    private HospitalService hospitalService;

    @Autowired
    private com.example.bloodbank.repository.HospitalRepository hospitalRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Hospital hospital) {
        try {
            hospitalService.register(hospital);
            return ResponseEntity.ok("Hospital registered. Please verify OTP sent to email.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean verified = hospitalService.verifyOtp(email, otp);
        if (verified) {
            return ResponseEntity.ok("Email verified successfully");
        }
        return ResponseEntity.badRequest().body("Invalid OTP");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        try {
            String token = hospitalService.login(creds.get("email"), creds.get("password"));
            Hospital h = hospitalRepository.findByEmail(creds.get("email")).get();
            return ResponseEntity.ok(new AuthResponse(token, h.getName(), "ROLE_HOSPITAL", h.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}
