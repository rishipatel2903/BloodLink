package com.example.bloodbank.service;

import com.example.bloodbank.model.Hospital;
import com.example.bloodbank.repository.HospitalRepository;
import com.example.bloodbank.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class HospitalService {

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    public Hospital register(Hospital hospital) {
        if (hospitalRepository.findByEmail(hospital.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        hospital.setPassword(passwordEncoder.encode(hospital.getPassword()));
        hospital.setVerified(false);
        String otp = otpService.generateOtp();
        hospital.setOtp(otp);

        // Send OTP via email
        otpService.sendOtp(hospital.getEmail(), otp);
        System.out.println("OTP for Hospital " + hospital.getEmail() + " is: " + otp);

        return hospitalRepository.save(hospital);
    }

    public String login(String email, String password) {
        Hospital hospital = hospitalRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, hospital.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!hospital.isVerified()) {
            throw new RuntimeException("Account not verified. Please verify your OTP.");
        }

        return jwtUtil.generateToken(hospital.getEmail(), "ROLE_HOSPITAL", hospital.getId());
    }

    public boolean verifyOtp(String email, String otp) {
        Hospital hospital = hospitalRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        if (otp.equals(hospital.getOtp())) {
            hospital.setVerified(true);
            hospital.setOtp(null);
            hospitalRepository.save(hospital);
            return true;
        }
        return false;
    }

    public Optional<Hospital> getHospitalById(String id) {
        return hospitalRepository.findById(id);
    }
}
