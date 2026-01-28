package com.example.bloodbank.controller;

import com.example.bloodbank.dto.EligibilityResponse;
import com.example.bloodbank.dto.HealthQuestionnaireDTO;
import com.example.bloodbank.service.EligibilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donor")
@CrossOrigin(origins = "http://localhost:5174")
public class EligibilityController {

    @Autowired
    private EligibilityService eligibilityService;

    @PostMapping("/eligibility-check")
    public ResponseEntity<EligibilityResponse> checkEligibility(@RequestBody HealthQuestionnaireDTO questionnaire) {
        return ResponseEntity.ok(eligibilityService.checkEligibility(questionnaire));
    }
}
