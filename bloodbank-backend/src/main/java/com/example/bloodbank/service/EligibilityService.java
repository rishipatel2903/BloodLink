package com.example.bloodbank.service;

import com.example.bloodbank.dto.EligibilityResponse;
import com.example.bloodbank.dto.HealthQuestionnaireDTO;
import com.example.bloodbank.model.User;
import com.example.bloodbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class EligibilityService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Checks complex medical eligibility and donation interval.
     */
    public EligibilityResponse checkEligibility(HealthQuestionnaireDTO questionnaire) {
        // 1. Basic Medical Questionnaire Rules
        if (!questionnaire.isFeelingWell()) {
            return new EligibilityResponse(false, -1, null,
                    "Medical Restriction: You must feel healthy/well on the day of donation.");
        }

        if (questionnaire.isTraveledRecently()) {
            return new EligibilityResponse(false, 28, LocalDate.now().plusDays(28),
                    "Safety Protocol: Travel to certain regions requires a 28-day waiting period to rule out latent infections.");
        }

        if (questionnaire.isTakingMedication()) {
            return new EligibilityResponse(false, -1, null,
                    "Medical Restriction: Certain medications can affect blood quality or donor health. Please consult a doctor.");
        }

        if (questionnaire.isRecentSurgery()) {
            return new EligibilityResponse(false, 180, LocalDate.now().plusMonths(6),
                    "Recovery Protocol: Major surgery requires at least 6 months of complete recovery before donating.");
        }

        // 2. Donation Interval Rule (56 Days)
        if (questionnaire.getUserId() != null) {
            return checkDonationInterval(questionnaire.getUserId());
        }

        return new EligibilityResponse(true, 0, LocalDate.now(), "You are medically eligible to donate!");
    }

    /**
     * Specifically checks the 56-day rule based on last donation date.
     */
    public EligibilityResponse checkDonationInterval(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getLastDonatedDate() == null) {
            return new EligibilityResponse(true, 0, LocalDate.now(),
                    "Welcome! As a first-time donor, you are eligible to donate today.");
        }

        LocalDateTime lastDonation = user.getLastDonatedDate();
        LocalDate nextEligibleDate = lastDonation.plusDays(56).toLocalDate();
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), nextEligibleDate);

        if (daysRemaining <= 0) {
            return new EligibilityResponse(true, 0, LocalDate.now(),
                    "Thank you for your previous gift! You are eligible to donate again today.");
        }

        return new EligibilityResponse(false, daysRemaining, nextEligibleDate,
                "Donation Interval: You must wait 56 days between whole blood donations. Your next eligible date is "
                        + nextEligibleDate);
    }
}
