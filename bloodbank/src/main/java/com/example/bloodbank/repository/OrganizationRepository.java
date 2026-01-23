package com.example.bloodbank.repository;

import com.example.bloodbank.model.Organization;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface OrganizationRepository extends MongoRepository<Organization, String> {
    Optional<Organization> findByEmail(String email);
    Optional<Organization> findByLicenseNumber(String licenseNumber);
}
