package com.example.bloodbank.config;

import com.example.bloodbank.model.Role;
import com.example.bloodbank.model.User;
import com.example.bloodbank.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
            com.example.bloodbank.repository.HospitalRepository hospitalRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if data already exists to avoid duplicates
            if (userRepository.count() == 0) {
                System.out.println("Initializing MongoDB with default data...");

                // Create a test user
                User testUser = new User();
                testUser.setName("Test User");
                testUser.setEmail("user@test.com");
                testUser.setPassword(passwordEncoder.encode("password123"));
                testUser.setRole(Role.ROLE_USER);
                testUser.setBloodGroup("O+");
                testUser.setGender("Male");
                testUser.setLastDonatedDate(LocalDateTime.now().minusMonths(4));// Eligible to donate
                testUser.setVerified(true); // <--- Enable login for test user

                userRepository.save(testUser);

                User testUser2 = new User();
                testUser2.setName("Rishi Patel");
                testUser2.setEmail("rishi@test.com");
                testUser2.setPassword(passwordEncoder.encode("pass"));
                testUser2.setRole(Role.ROLE_USER);
                testUser2.setBloodGroup("A+");
                testUser2.setGender("Male");
                testUser2.setLastDonatedDate(LocalDateTime.now().minusDays(40));// 16 days remaining
                testUser2.setVerified(true);
                userRepository.save(testUser2);

                System.out.println("Test user created: user@test.com / password123");
            }

            // Hospital Initialization
            if (hospitalRepository.count() == 0) {
                System.out.println("Initializing Hospital data...");
                com.example.bloodbank.model.Hospital hospital = new com.example.bloodbank.model.Hospital();
                hospital.setName("City General Hospital");
                hospital.setEmail("hospital@test.com");
                hospital.setPassword(passwordEncoder.encode("password123"));
                hospital.setLicenseNumber("LIC-HSP-7788");
                hospital.setAddress("123 Healthcare Blvd, Medical District");
                hospital.setPhoneNumber("+15550199");
                hospital.setVerified(true);
                hospitalRepository.save(hospital);
                System.out.println("Test Hospital created: hospital@test.com / password123");
            }

            // Ensure test users are verified
            userRepository.findByEmail("user@test.com").ifPresent(user -> {
                if (!user.isVerified()) {
                    user.setVerified(true);
                    userRepository.save(user);
                    System.out.println("Updated existing test user to VERIFIED.");
                }
            });
        };
    }
}
