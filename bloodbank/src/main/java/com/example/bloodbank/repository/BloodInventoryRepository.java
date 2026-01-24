package com.example.bloodbank.repository;

import com.example.bloodbank.model.BloodInventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BloodInventoryRepository extends MongoRepository<BloodInventory, String> {
    List<BloodInventory> findByOrganizationId(String organizationId);
    List<BloodInventory> findByStatus(String status);
    List<BloodInventory> findByExpiryDateBeforeAndStatus(LocalDate date, String status);
    List<BloodInventory> findByBloodGroupIgnoreCaseAndStatus(String bloodGroup, String status);
    
    List<BloodInventory> findByOrganizationIdAndBloodGroupAndStatus(String organizationId, String bloodGroup, String status);
}
