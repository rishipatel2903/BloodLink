package com.example.bloodbank.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "blood_inventory")
public class BloodInventory {

    @Id
    private String id;
    
    private String organizationId;
    private String bloodGroup; // A+, B-, etc.
    private int quantity; // Number of units in this batch
    private LocalDate collectionDate;
    private LocalDate expiryDate;
    private String status; // "AVAILABLE", "RESERVED", "EXPIRED", "DISCARDED"
    private String sourceDonorId; // Optional: ID
    private String donorName; // Explicit donor name for display

    // Constructors
    public BloodInventory() {}

    public BloodInventory(String organizationId, String bloodGroup, int quantity, LocalDate collectionDate, LocalDate expiryDate, String status) {
        this.organizationId = organizationId;
        this.bloodGroup = bloodGroup;
        this.quantity = quantity;
        this.collectionDate = collectionDate;
        this.expiryDate = expiryDate;
        this.status = status;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public LocalDate getCollectionDate() {
        return collectionDate;
    }

    public void setCollectionDate(LocalDate collectionDate) {
        this.collectionDate = collectionDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSourceDonorId() {
        return sourceDonorId;
    }

    public void setSourceDonorId(String sourceDonorId) {
        this.sourceDonorId = sourceDonorId;
    }

    public String getDonorName() {
        return donorName;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }
}
