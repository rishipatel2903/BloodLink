package com.example.bloodbank.service;

import com.example.bloodbank.model.BloodRequest;
import com.example.bloodbank.model.User;
import com.example.bloodbank.repository.BloodRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BloodRequestService {

    @Autowired
    private BloodRequestRepository repository;

    @Autowired
    private com.example.bloodbank.repository.UserRepository userRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private TwilioService twilioService;

    @Autowired
    private com.example.bloodbank.repository.OrganizationRepository orgRepository;

    @Autowired
    private com.example.bloodbank.repository.BloodInventoryRepository inventoryRepository;

    public BloodRequest createRequest(BloodRequest request) {
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now());
        BloodRequest saved = repository.save(request);

        // --- Broadcast Notification for CRITICAL requests ---
        if ("CRITICAL".equalsIgnoreCase(saved.getUrgency())) {
            String message = String.format(
                    "URGENT BROADCAST: A critical request for %d units of %s blood has been made at %s. Contact: %s",
                    saved.getUnits(), saved.getBloodGroup(), saved.getHospitalName(), saved.getContactNumber());

            // Find all organizations with this blood group available
            java.util.List<com.example.bloodbank.model.BloodInventory> matchingInventory = inventoryRepository
                    .findByBloodGroupIgnoreCaseAndStatus(saved.getBloodGroup(), "AVAILABLE");

            java.util.Set<String> orgIds = matchingInventory.stream()
                    .map(com.example.bloodbank.model.BloodInventory::getOrganizationId)
                    .collect(java.util.stream.Collectors.toSet());

            for (String orgId : orgIds) {
                orgRepository.findById(orgId).ifPresent(org -> {
                    if (org.getPhoneNumber() != null && !org.getPhoneNumber().isEmpty()) {
                        twilioService.sendSms(org.getPhoneNumber(), message);
                    }
                });
            }
        }
        return saved;
    }

    public List<User> findMatchingDonors(String id) {
        BloodRequest request = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        return userRepository.findByBloodGroupIgnoreCase(request.getBloodGroup());
    }

    public List<BloodRequest> getAllRequests() {
        return repository.findAll();
    }

    public List<BloodRequest> getUserRequests(String userId) {
        return repository.findByUserId(userId);
    }

    public List<BloodRequest> getOrgRequests(String orgId) {
        List<String> activeStatuses = List.of("PENDING", "APPROVED", "REJECTED", "UTILIZED");

        // Targeted at them with any active status
        List<BloodRequest> targeted = repository.findByOrganizationIdAndStatusIn(orgId, activeStatuses);

        // Global broadcasts (only showing PENDING for broadcasts until someone claims
        // it)
        List<BloodRequest> broadcast = repository.findByStatusAndOrganizationIdIsNull("PENDING");

        List<BloodRequest> combined = new ArrayList<>(targeted);
        combined.addAll(broadcast);
        return combined;
    }

    public List<BloodRequest> getPendingRequests() {
        return repository.findByStatus("PENDING");
    }

    public BloodRequest updateStatus(String id, String status, String orgId) {
        System.out.println(
                "[BloodRequestService] Updating status for request " + id + " to " + status + " (orgId=" + orgId + ")");
        BloodRequest request = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        if (orgId != null) {
            request.setOrganizationId(orgId);
        }
        BloodRequest saved = repository.save(request);
        System.out.println("[BloodRequestService] Updated request: " + saved);

        // --- Notification for User on APPROVAL ---
        if ("APPROVED".equalsIgnoreCase(status)) {
            userRepository.findById(saved.getUserId()).ifPresent(user -> {
                if (user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) {
                    String orgName = "an organization";
                    if (saved.getOrganizationId() != null) {
                        orgName = orgRepository.findById(saved.getOrganizationId())
                                .map(com.example.bloodbank.model.Organization::getName)
                                .orElse("an organization");
                    }
                    String message = String.format(
                            "GREAT NEWS: Your request for %s blood has been APPROVED by %s. Please coordinate for pick-up.",
                            saved.getBloodGroup(), orgName);
                    twilioService.sendSms(user.getPhoneNumber(), message);
                }
            });
        }
        return saved;
    }

    // --- Fulfillment with FEFO Logic ---
    public BloodRequest fulfillRequest(String id, String actingOrgId) {
        BloodRequest request = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));

        String finalOrgId = request.getOrganizationId() != null ? request.getOrganizationId() : actingOrgId;

        System.out.println("[BloodRequestService] Fulfill request " + id + " for org " + finalOrgId + ", bloodGroup="
                + request.getBloodGroup() + ", units=" + request.getUnits());
        // Deduct from Inventory using FEFO logic
        inventoryService.deductBloodFEFO(finalOrgId, request.getBloodGroup(), request.getUnits());

        request.setStatus("UTILIZED");
        request.setOrganizationId(finalOrgId); // Mark who fulfilled it if it was a broadcast
        BloodRequest saved = repository.save(request);
        System.out.println("[BloodRequestService] Request after fulfillment: " + saved);
        return saved;
    }
}
