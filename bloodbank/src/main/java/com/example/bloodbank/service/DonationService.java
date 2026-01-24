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

    // 1. Book Appointment
    public DonationRequest bookAppointment(DonationRequest request) {
        request.setStatus("PENDING");
        return donationRepository.save(request);
    }

    // 2. Get Requests for Org
    public List<DonationRequest> getOrgRequests(String orgId) {
        return donationRepository.findByOrganizationId(orgId);
    }

    // 3. Get Requests for User
    public List<DonationRequest> getUserRequests(String userId) {
        return donationRepository.findByUserId(userId);
    }

    // 4. Update Status (Approve/Reject)
    public DonationRequest updateStatus(String id, String status) {
        DonationRequest request = donationRepository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        return donationRepository.save(request);
    }

    // 5. Complete Donation (The "Life Line" Logic)
    @org.springframework.transaction.annotation.Transactional
    public DonationRequest completeDonation(String id) {
        DonationRequest request = donationRepository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
        
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
        return donationRepository.save(request);
    }
}
