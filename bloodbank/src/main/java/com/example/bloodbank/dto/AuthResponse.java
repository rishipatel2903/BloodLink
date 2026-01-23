package com.example.bloodbank.dto;

public class AuthResponse {
    private String token;
    private String name;
    private String role;
    private String id; // Added ID

    public AuthResponse(String token, String name, String role, String id) {
        this.token = token;
        this.name = name;
        this.role = role;
        this.id = id;
    }

    public String getToken() { return token; }
    public String getName() { return name; }
    public String getRole() { return role; }
    public String getId() { return id; }
}
