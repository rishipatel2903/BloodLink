package com.example.bloodbank.repository;

import com.example.bloodbank.model.BloodRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloodRequestRepository extends MongoRepository<BloodRequest, String> {
    List<BloodRequest> findByUserId(String userId);
    List<BloodRequest> findByStatus(String status);
    List<BloodRequest> findByUrgency(String urgency);
    List<BloodRequest> findByOrganizationIdAndStatusIn(String organizationId, List<String> statuses);
    
    // Urgent broadcasts (not targeted at specific org)
    List<BloodRequest> findByStatusAndOrganizationIdIsNull(String status);
    List<BloodRequest> findByStatusInAndOrganizationIdIsNull(List<String> statuses);
}
