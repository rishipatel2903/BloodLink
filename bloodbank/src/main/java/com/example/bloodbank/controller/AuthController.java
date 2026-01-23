package com.example.bloodbank.controller;

import com.example.bloodbank.dto.AuthRequest;
import com.example.bloodbank.dto.AuthResponse;
import com.example.bloodbank.model.Organization;
import com.example.bloodbank.model.Role;
import com.example.bloodbank.model.User;
import com.example.bloodbank.repository.OrganizationRepository;
import com.example.bloodbank.repository.UserRepository;
import com.example.bloodbank.security.JwtUtil;
import com.example.bloodbank.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private OrganizationRepository orgRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private OtpService otpService;

    // ================= USER REGISTRATION WITH OTP =================

    @PostMapping("/register/user")
    public ResponseEntity<?> registerUser(@RequestBody User user) {

        System.out.println("📩 Register API called with email: " + user.getEmail());

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        String otp = otpService.generateOtp();
        System.out.println("🔐 Generated OTP: " + otp);

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.ROLE_USER);
        user.setOtp(otp);
        user.setVerified(false);

        userRepository.save(user);
        System.out.println("💾 User saved in DB");

        otpService.sendOtp(user.getEmail(), otp);
        System.out.println("📧 OTP send method called");

        return ResponseEntity.ok("OTP sent to your email. Please verify.");
    }

    // ================= ORGANIZATION REGISTRATION =================

    @PostMapping("/register/org")
    public ResponseEntity<?> registerOrg(@RequestBody Organization org) {

        if (orgRepository.findByEmail(org.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // ✅ Generate OTP
        String otp = otpService.generateOtp();

        // ✅ Send OTP email
        otpService.sendOtp(org.getEmail(), otp);

        // ✅ Save org with encoded password & OTP
        org.setPassword(passwordEncoder.encode(org.getPassword()));
        org.setRole(Role.ROLE_ORG);
        org.setStatus("PENDING");
        org.setOtp(otp);
        org.setVerified(false);

        orgRepository.save(org);

        return ResponseEntity.ok("OTP sent to organization email. Please verify.");
    }

    // ================= OTP VERIFICATION =================

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {

        // ----------- USER OTP VERIFY -----------
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (!user.getOtp().equals(otp)) {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }

            user.setVerified(true);
            user.setOtp(null);
            userRepository.save(user);

            return ResponseEntity.ok("User email verified successfully");
        }

        // ----------- ORG OTP VERIFY -----------
        Optional<Organization> orgOpt = orgRepository.findByEmail(email);
        if (orgOpt.isPresent()) {
            Organization org = orgOpt.get();

            if (!org.getOtp().equals(otp)) {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }

            org.setVerified(true);
            org.setOtp(null);
            orgRepository.save(org);

            return ResponseEntity.ok("Organization email verified successfully");
        }

        return ResponseEntity.badRequest().body("Email not found");
    }

    // ================= LOGIN (USER + ORG) =================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        // ----------- USER LOGIN -----------
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (!user.isVerified()) {
                return ResponseEntity.status(401).body("Email not verified");
            }

            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
                return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getRole().name()));
            }
        }

        // ----------- ORG LOGIN -----------
        Optional<Organization> orgOpt = orgRepository.findByEmail(request.getEmail());
        if (orgOpt.isPresent()) {
            Organization org = orgOpt.get();

            if (!org.isVerified()) {
                return ResponseEntity.status(401).body("Organization email not verified");
            }

            if (passwordEncoder.matches(request.getPassword(), org.getPassword())) {
                String token = jwtUtil.generateToken(org.getEmail(), org.getRole());
                return ResponseEntity.ok(new AuthResponse(token, org.getName(), org.getRole().name()));
            }
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // ================= GOOGLE LOGIN =================

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody java.util.Map<String, String> payload) {
        String accessToken = payload.get("token");

        try {
            // 1. Verify Token with Google
            String googleUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>("", headers);

            ResponseEntity<java.util.Map> googleResponse = restTemplate.exchange(googleUrl,
                    org.springframework.http.HttpMethod.GET, entity, java.util.Map.class);
            java.util.Map<String, Object> userInfo = googleResponse.getBody();

            if (userInfo == null || !userInfo.containsKey("email")) {
                return ResponseEntity.status(401).body("Invalid Google Token");
            }

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");

            // 2. Check or Create User
            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setPassword(passwordEncoder.encode("GOOGLE_AUTH")); // Dummy password
                user.setRole(Role.ROLE_USER);
                user.setVerified(true);
                user.setBloodGroup("Unknown"); // Can be updated later
                user.setGender("Unknown");
                userRepository.save(user);
            }

            // 3. Generate Token
            String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole());
            return ResponseEntity.ok(new AuthResponse(jwt, user.getName(), user.getRole().name()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body("Google Authentication Failed");
        }
    }

    @GetMapping("/test-mail")
    public String testMail() {
        otpService.sendOtp("princepatel31103110@gmail.com", "999999");
        return "Mail test triggered";
    }

}
