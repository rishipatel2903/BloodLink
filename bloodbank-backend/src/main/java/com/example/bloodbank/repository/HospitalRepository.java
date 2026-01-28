package com.example.bloodbank.repository;

import com.example.bloodbank.model.Hospital;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospitalRepository extends MongoRepository<Hospital, String> {
    Optional<Hospital> findByEmail(String email);

    Optional<Hospital> findByLicenseNumber(String licenseNumber);
}
