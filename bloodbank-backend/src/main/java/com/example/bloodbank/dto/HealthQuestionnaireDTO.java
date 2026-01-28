package com.example.bloodbank.dto;

public class HealthQuestionnaireDTO {
    private String userId;
    private boolean feelingWell;
    private boolean traveledRecently;
    private boolean takingMedication;
    private boolean recentSurgery;

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public boolean isFeelingWell() {
        return feelingWell;
    }

    public void setFeelingWell(boolean feelingWell) {
        this.feelingWell = feelingWell;
    }

    public boolean isTraveledRecently() {
        return traveledRecently;
    }

    public void setTraveledRecently(boolean traveledRecently) {
        this.traveledRecently = traveledRecently;
    }

    public boolean isTakingMedication() {
        return takingMedication;
    }

    public void setTakingMedication(boolean takingMedication) {
        this.takingMedication = takingMedication;
    }

    public boolean isRecentSurgery() {
        return recentSurgery;
    }

    public void setRecentSurgery(boolean recentSurgery) {
        this.recentSurgery = recentSurgery;
    }
}
