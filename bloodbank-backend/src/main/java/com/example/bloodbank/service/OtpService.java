package com.example.bloodbank.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private RealtimeEventService eventService;

    public String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000)); // 6-digit OTP
    }

    public void sendOtp(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("princepatel31103110@gmail.com"); // ✅ ADD THIS
            message.setTo(email);
            message.setSubject("BloodBank OTP Verification");
            message.setText("Your OTP is: " + otp + "\nValid for 5 minutes.");

            mailSender.send(message);

            // Notify via WebSocket (optional broadcast or targeted if email is mapped)
            eventService.broadcast("/topic/otp", "OTP_SENT", email);

            System.out.println("✅ OTP sent successfully to: " + email);
        } catch (Exception e) {
            System.out.println("❌ OTP sending failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

}
