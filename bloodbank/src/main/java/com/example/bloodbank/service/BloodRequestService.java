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

    public BloodRequest createRequest(BloodRequest request) {
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now());
        return repository.save(request);
    }

    public List<User> findMatchingDonors(String id) {
        BloodRequest request = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        return userRepository.findByBloodGroup(request.getBloodGroup());
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
        
        // Global broadcasts (only showing PENDING for broadcasts until someone claims it)
        List<BloodRequest> broadcast = repository.findByStatusAndOrganizationIdIsNull("PENDING");
        
        List<BloodRequest> combined = new ArrayList<>(targeted);
        combined.addAll(broadcast);
        return combined;
    }

    public List<BloodRequest> getPendingRequests() {
        return repository.findByStatus("PENDING");
    }

    public BloodRequest updateStatus(String id, String status) {
        System.out.println("[BloodRequestService] Updating status for request " + id + " to " + status);
        BloodRequest request = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        BloodRequest saved = repository.save(request);
        System.out.println("[BloodRequestService] Updated request: " + saved);
        return saved;
    }

    // --- Fulfillment with FEFO Logic ---
    public BloodRequest fulfillRequest(String id, String actingOrgId) {
        BloodRequest request = repository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        
        String finalOrgId = request.getOrganizationId() != null ? request.getOrganizationId() : actingOrgId;

        System.out.println("[BloodRequestService] Fulfill request " + id + " for org " + finalOrgId + ", bloodGroup=" + request.getBloodGroup() + ", units=" + request.getUnits());
        // Deduct from Inventory using FEFO logic
        inventoryService.deductBloodFEFO(finalOrgId, request.getBloodGroup(), request.getUnits());

        request.setStatus("UTILIZED");
        request.setOrganizationId(finalOrgId); // Mark who fulfilled it if it was a broadcast
        BloodRequest saved = repository.save(request);
        System.out.println("[BloodRequestService] Request after fulfillment: " + saved);
        return saved;
    }
}
