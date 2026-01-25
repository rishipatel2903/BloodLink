package com.example.bloodbank.dto;

import java.time.LocalDate;

public class EligibilityResponse {
    private boolean eligible;
    private long daysRemaining;
    private LocalDate nextEligibleDate;
    private String message;
    private String reason;

    public EligibilityResponse(boolean eligible, long daysRemaining, LocalDate nextEligibleDate, String message) {
        this.eligible = eligible;
        this.daysRemaining = daysRemaining;
        this.nextEligibleDate = nextEligibleDate;
        this.message = message;
        this.reason = message; // Default reason to message
    }

    // Getters and Setters
    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public long getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(long daysRemaining) {
        this.daysRemaining = daysRemaining;
    }

    public LocalDate getNextEligibleDate() {
        return nextEligibleDate;
    }

    public void setNextEligibleDate(LocalDate nextEligibleDate) {
        this.nextEligibleDate = nextEligibleDate;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
