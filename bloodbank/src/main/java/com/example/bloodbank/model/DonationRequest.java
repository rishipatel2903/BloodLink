package com.example.bloodbank.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.Map;

@Document(collection = "donation_requests")
public class DonationRequest {

    @Id
    private String id;

    private String userId;
    private String userName; // Denormalized for easier display
    private String organizationId;
    private String bloodGroup;
    private LocalDate appointmentDate;
    private String status; // PENDING, APPROVED, COMPLETED, REJECTED
    
    // Health Check params (e.g., {"recentTravel": "no", "medication": "no"})
    private Map<String, String> healthCheckParams;

    public DonationRequest() {}

    public DonationRequest(String userId, String userName, String organizationId, String bloodGroup, LocalDate appointmentDate, String status, Map<String, String> healthCheckParams) {
        this.userId = userId;
        this.userName = userName;
        this.organizationId = organizationId;
        this.bloodGroup = bloodGroup;
        this.appointmentDate = appointmentDate;
        this.status = status;
        this.healthCheckParams = healthCheckParams;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Map<String, String> getHealthCheckParams() {
        return healthCheckParams;
    }

    public void setHealthCheckParams(Map<String, String> healthCheckParams) {
        this.healthCheckParams = healthCheckParams;
    }
}
