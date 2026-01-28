package com.example.bloodbank.repository;

import com.example.bloodbank.model.DonationRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRequestRepository extends MongoRepository<DonationRequest, String> {
    List<DonationRequest> findByUserId(String userId);
    List<DonationRequest> findByOrganizationId(String organizationId);
    List<DonationRequest> findByStatus(String status);
}
