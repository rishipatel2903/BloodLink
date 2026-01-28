package com.example.bloodbank.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class TwilioService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhoneNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    public void sendSms(String to, String messageBody) {
        try {
            // Ensure number starts with + for E.164 format
            String formattedTo = to.trim();
            if (!formattedTo.startsWith("+")) {
                // If 10 digits, assume India (+91) as a default for this project context,
                // or just prepend + if it's missing but has a country code.
                if (formattedTo.length() == 10) {
                    formattedTo = "+91" + formattedTo;
                } else {
                    formattedTo = "+" + formattedTo;
                }
            }

            Message message = Message.creator(
                    new PhoneNumber(formattedTo),
                    new PhoneNumber(fromPhoneNumber),
                    messageBody).create();
            System.out.println("✅ Message sent: " + message.getSid());
        } catch (Exception e) {
            System.out.println("❌ Twilio Error: " + e.getMessage());
        }
    }
}
