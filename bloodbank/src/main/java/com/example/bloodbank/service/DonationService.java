package com.example.bloodbank.service;

import com.example.bloodbank.model.BloodInventory;
import com.example.bloodbank.model.DonationRequest;
import com.example.bloodbank.model.User;
import com.example.bloodbank.repository.DonationRequestRepository;
import com.example.bloodbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DonationService {

    @Autowired
    private DonationRequestRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private RealtimeEventService eventService;

    @Autowired
    private EligibilityService eligibilityService;

    // 1. Get Eligibility Data
    public com.example.bloodbank.dto.EligibilityResponse getEligibility(String userId) {
        return eligibilityService.checkDonationInterval(userId);
    }

    // 2. Book Appointment
    public DonationRequest bookAppointment(DonationRequest request) {
        // Enforce medical rules and 56-day rule using EligibilityService
        com.example.bloodbank.dto.HealthQuestionnaireDTO questionnaire = new com.example.bloodbank.dto.HealthQuestionnaireDTO();
        questionnaire.setUserId(request.getUserId());
        if (request.getHealthCheckParams() != null) {
            questionnaire.setFeelingWell("yes".equalsIgnoreCase(request.getHealthCheckParams().get("feelingWell")));
            questionnaire
                    .setTraveledRecently("yes".equalsIgnoreCase(request.getHealthCheckParams().get("recentTravel")));
            questionnaire.setTakingMedication("yes".equalsIgnoreCase(request.getHealthCheckParams().get("medication")));
            questionnaire.setRecentSurgery("yes".equalsIgnoreCase(request.getHealthCheckParams().get("surgery")));
        }

        com.example.bloodbank.dto.EligibilityResponse eligibility = eligibilityService.checkEligibility(questionnaire);

        if (!eligibility.isEligible()) {
            throw new RuntimeException(eligibility.getMessage());
        }

        request.setStatus("PENDING");
        DonationRequest saved = donationRepository.save(request);

        // Notify Organization about new appointment
        eventService.sendOrgEvent(saved.getOrganizationId(), "NEW_APPOINTMENT", saved);

        return saved;
    }

    // 2. Get Requests for Org
    public List<DonationRequest> getOrgRequests(String orgId) {
        return donationRepository.findByOrganizationId(orgId);
    }

    // 3. Get Requests for User
    public List<DonationRequest> getUserRequests(String userId) {
        return donationRepository.findByUserId(userId);
    }

    public DonationRequest updateStatus(String id, String status) {
        DonationRequest request = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        DonationRequest saved = donationRepository.save(request);

        // Notify User about status update
        eventService.sendUserEvent(saved.getUserId(), "DONATION_STATUS_UPDATED", saved);

        return saved;
    }

    // 5. Complete Donation (The "Life Line" Logic)
    @org.springframework.transaction.annotation.Transactional
    public DonationRequest completeDonation(String id) {
        DonationRequest request = donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"APPROVED".equals(request.getStatus())) {
            throw new RuntimeException("Donation must be APPROVED before completion");
        }

        // A. Add to Inventory (1 Unit) - Instantly
        BloodInventory batch = new BloodInventory();
        batch.setOrganizationId(request.getOrganizationId());
        batch.setBloodGroup(request.getBloodGroup());
        batch.setQuantity(1);
        batch.setCollectionDate(LocalDate.now());
        batch.setStatus("AVAILABLE");
        batch.setSourceDonorId(request.getUserId());
        batch.setDonorName(request.getUserName());

        inventoryService.addBatch(batch); // Saves instantly

        // B. Update User Last Donated Date - Instantly
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastDonatedDate(LocalDateTime.now());
            userRepository.save(user);
        }

        // C. Update Request Status - Instantly
        request.setStatus("COMPLETED");
        DonationRequest saved = donationRepository.save(request);

        // Notify User: Donation Completed
        eventService.sendUserEvent(saved.getUserId(), "DONATION_COMPLETED", saved);
        eventService.sendUserEvent(saved.getUserId(), "CERTIFICATE_GENERATED", saved);

        // Notify Org: Inventory Updated
        eventService.sendOrgEvent(saved.getOrganizationId(), "INVENTORY_UPDATED", saved);

        return saved;
    }
}
