package com.example.bloodbank.service;

import com.example.bloodbank.model.BloodInventory;
import com.example.bloodbank.repository.BloodInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private BloodInventoryRepository repository;

    // Add new batch
    public BloodInventory addBatch(BloodInventory inventory) {
        // Auto-calculate expiry if not provided (Example: 42 days for RBC)
        if (inventory.getExpiryDate() == null) {
            inventory.setExpiryDate(LocalDate.now().plusDays(42));
        }
        
        // Generate Readable Custom ID (e.g., B-17060123)
        // Ideally use a database sequence, but for now using Timestamp + Random suffix for uniqueness without complex setup
        String customId = "B-" + System.currentTimeMillis() % 100000;
        inventory.setId(customId);
        
        return repository.save(inventory);
    }

    // Get all inventory (Admin view)
    public List<BloodInventory> getAllInventory() {
        return repository.findAll();
    }

    // Get inventory by Organization
    public List<BloodInventory> getInventoryByOrg(String orgId) {
        return repository.findByOrganizationId(orgId);
    }

    // Delete batch
    public void deleteBatch(String id) {
        repository.deleteById(id);
    }

    // Scheduled Task: Run every day at midnight to mark expired blood
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 0 * * ?")
    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void checkExpiry() {
        LocalDate today = LocalDate.now();
        List<BloodInventory> expiredList = repository.findByExpiryDateBeforeAndStatus(today, "AVAILABLE");
        
        for (BloodInventory batch : expiredList) {
            batch.setStatus("DISCARDED");
            repository.save(batch);
        }
        
        if (!expiredList.isEmpty()) {
            System.out.println("✅ Scheduled Task: Marked " + expiredList.size() + " batches as DISCARDED.");
        }
    }
}
