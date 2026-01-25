package com.example.bloodbank.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RealtimeEventService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Sends an event to a specific user.
     * Topic format: /topic/user/{userId}
     */
    public void sendUserEvent(String userId, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/user/" + userId, message);
    }

    /**
     * Sends an event to a specific organization.
     * Topic format: /topic/org/{orgId}
     */
    public void sendOrgEvent(String orgId, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/org/" + orgId, message);
    }

    /**
     * Sends an event to a specific hospital.
     * Topic format: /topic/hospital/{hospitalId}
     */
    public void sendHospitalEvent(String hospitalId, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/hospital/" + hospitalId, message);
    }

    /**
     * General broadcast (if needed)
     */
    public void broadcast(String topic, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend(topic, message);
    }
}
