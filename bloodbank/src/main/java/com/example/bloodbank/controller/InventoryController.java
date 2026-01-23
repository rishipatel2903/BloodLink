package com.example.bloodbank.controller;

import com.example.bloodbank.model.BloodInventory;
import com.example.bloodbank.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:5174") // Allow Frontend
public class InventoryController {

    @Autowired
    private InventoryService service;

    @PostMapping("/add")
    public ResponseEntity<BloodInventory> addBatch(@RequestBody BloodInventory inventory) {
        return ResponseEntity.ok(service.addBatch(inventory));
    }

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<BloodInventory>> getOrgInventory(@PathVariable String orgId) {
        return ResponseEntity.ok(service.getInventoryByOrg(orgId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable String id) {
        service.deleteBatch(id);
        return ResponseEntity.ok().build();
    }
}
