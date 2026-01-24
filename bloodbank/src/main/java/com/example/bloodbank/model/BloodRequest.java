package com.example.bloodbank.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "blood_requests")
public class BloodRequest {

    @Id
    private String id;
    
    private String userId;
    private String patientName;
    private String bloodGroup;
    private int units;
    private String hospitalName;
    private String contactNumber;
    private String organizationId; // Targeted Bank
    private String urgency; // NORMAL, CRITICAL
    private String status; // PENDING, APPROVED, FULFILLED, CANCELLED, REJECTED
    private LocalDateTime requestedAt;

    public BloodRequest() {}

    public BloodRequest(String userId, String patientName, String bloodGroup, int units, String hospitalName, String contactNumber, String urgency, String status, LocalDateTime requestedAt) {
        this.userId = userId;
        this.patientName = patientName;
        this.bloodGroup = bloodGroup;
        this.units = units;
        this.hospitalName = hospitalName;
        this.contactNumber = contactNumber;
        this.urgency = urgency;
        this.status = status;
        this.requestedAt = requestedAt;
    }
    
    // Getters/Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    
    public int getUnits() { return units; }
    public void setUnits(int units) { this.units = units; }
    
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    
    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
    
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
}
