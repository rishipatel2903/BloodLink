package com.example.bloodbank.repository;

import com.example.bloodbank.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    java.util.List<User> findByBloodGroup(String bloodGroup);
}
