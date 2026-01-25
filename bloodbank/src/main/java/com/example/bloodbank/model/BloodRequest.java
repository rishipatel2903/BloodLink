package com.example.bloodbank.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "blood_requests")
public class BloodRequest {

    @Id
    private String id;

    private String hospitalId;
    private String hospitalName;
    private String bloodGroup;
    private int units;
    private String hospitalAddress; // Additional context
    private String contactNumber;
    private String organizationId; // Targeted Bank
    private String urgency; // NORMAL, CRITICAL
    private String status; // PENDING, APPROVED, FULFILLED, CANCELLED, REJECTED
    private LocalDateTime requestedAt;

    public BloodRequest() {
    }

    public BloodRequest(String hospitalId, String hospitalName, String bloodGroup, int units, String hospitalAddress,
            String contactNumber, String urgency, String status, LocalDateTime requestedAt) {
        this.hospitalId = hospitalId;
        this.hospitalName = hospitalName;
        this.bloodGroup = bloodGroup;
        this.units = units;
        this.hospitalAddress = hospitalAddress;
        this.contactNumber = contactNumber;
        this.urgency = urgency;
        this.status = status;
        this.requestedAt = requestedAt;
    }

    // Getters/Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(String hospitalId) {
        this.hospitalId = hospitalId;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public int getUnits() {
        return units;
    }

    public void setUnits(int units) {
        this.units = units;
    }

    public String getHospitalAddress() {
        return hospitalAddress;
    }

    public void setHospitalAddress(String hospitalAddress) {
        this.hospitalAddress = hospitalAddress;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }
}
