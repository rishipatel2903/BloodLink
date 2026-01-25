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

    @Autowired
    private com.example.bloodbank.repository.HospitalRepository hospitalRepository;

    @Autowired
    private RealtimeEventService eventService;

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

        // Notify targeted Org or all Orgs if broadcast
        if (saved.getOrganizationId() != null) {
            eventService.sendOrgEvent(saved.getOrganizationId(), "NEW_BLOOD_REQUEST", saved);
        } else {
            // General broadcast for pending requests
            eventService.broadcast("/topic/org/broadcast", "NEW_BLOOD_REQUEST", saved);
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

    public List<BloodRequest> getHospitalRequests(String hospitalId) {
        return repository.findByHospitalId(hospitalId);
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

        // Safety check for broadcasts: don't let someone else approve if it's already
        // claimed
        if (request.getOrganizationId() != null && orgId != null && !request.getOrganizationId().equals(orgId)) {
            if ("APPROVED".equalsIgnoreCase(request.getStatus())) {
                throw new RuntimeException("This request has already been approved by another organization.");
            }
        }

        request.setStatus(status);

        // If it was a broadcast and is being approved, claim it
        if (orgId != null && (request.getOrganizationId() == null || request.getOrganizationId().isEmpty())) {
            if ("APPROVED".equalsIgnoreCase(status)) {
                request.setOrganizationId(orgId);
            }
        } else if (orgId != null) {
            // Even if already set, ensure we use the current orgId if it's a direct status
            // update
            request.setOrganizationId(orgId);
        }

        BloodRequest saved = repository.save(request);
        System.out.println("[BloodRequestService] Updated request: " + saved);

        // --- Notification for Hospital on APPROVAL ---
        if ("APPROVED".equalsIgnoreCase(status)) {
            hospitalRepository.findById(saved.getHospitalId()).ifPresent(hospital -> {
                if (hospital.getPhoneNumber() != null && !hospital.getPhoneNumber().isEmpty()) {
                    String orgName = "an organization";
                    if (saved.getOrganizationId() != null) {
                        orgName = orgRepository.findById(saved.getOrganizationId())
                                .map(com.example.bloodbank.model.Organization::getName)
                                .orElse("an organization");
                    }
                    String message = String.format(
                            "GREAT NEWS: Your request for %s blood has been APPROVED by %s. Please coordinate for pick-up.",
                            saved.getBloodGroup(), orgName);
                    twilioService.sendSms(hospital.getPhoneNumber(), message);
                }
            });
        }

        // Notify Hospital about status update
        eventService.sendHospitalEvent(saved.getHospitalId(), "REQUEST_STATUS_UPDATED", saved);

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

        // Notify Hospital: Request Fulfilled
        eventService.sendHospitalEvent(saved.getHospitalId(), "REQUEST_FULFILLED", saved);

        // Notify Org: Inventory Updated
        eventService.sendOrgEvent(finalOrgId, "INVENTORY_UPDATED", saved);

        System.out.println("[BloodRequestService] Request after fulfillment: " + saved);
        return saved;
    }
}
