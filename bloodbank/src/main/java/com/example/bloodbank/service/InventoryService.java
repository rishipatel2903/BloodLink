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

    @Autowired
    private com.example.bloodbank.repository.OrganizationRepository orgRepository;

    // Add new batch
    public BloodInventory addBatch(BloodInventory inventory) {
        // Fetch and set Organization Name if not provided
        if (inventory.getOrganizationName() == null) {
            orgRepository.findById(inventory.getOrganizationId()).ifPresent(org -> {
                inventory.setOrganizationName(org.getName());
            });
        }

        // Auto-calculate expiry if not provided (Example: 42 days for RBC)
        if (inventory.getExpiryDate() == null) {
            inventory.setExpiryDate(LocalDate.now().plusDays(42));
        }
        
        // Default status to AVAILABLE if not provided
        if (inventory.getStatus() == null || inventory.getStatus().isEmpty()) {
            inventory.setStatus("AVAILABLE");
        }

        // Generate Readable Custom ID (e.g., B-17060123)
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

    // --- Module 3.3 Methods ---

    public List<BloodInventory> searchByBloodGroup(String bloodGroup) {
        if (bloodGroup == null) return java.util.Collections.emptyList();
        
        // Fix for common URL decoding issue where '+' becomes ' '
        String sanitizedGroup = bloodGroup.trim().replace(" ", "+");
        System.out.println("🔍 [InventorySearch] Query: [" + sanitizedGroup + "]");
        
        List<BloodInventory> results = repository.findByBloodGroupIgnoreCaseAndStatus(sanitizedGroup, "AVAILABLE");
        
        if (results.isEmpty()) {
            System.out.println("⚠ [InventorySearch] No AVAILABLE batches found for: " + sanitizedGroup);
            // Optionally check if any exist with NULL status (legacy/buggy data)
            long totalCount = repository.count();
            System.out.println("ℹ [InventorySearch] Total inventory records in DB: " + totalCount);
        } else {
            System.out.println("✅ [InventorySearch] Found " + results.size() + " matches.");
            // Ensure organization names are populated (handles legacy data)
            for (BloodInventory batch : results) {
                if (batch.getOrganizationName() == null || batch.getOrganizationName().isEmpty()) {
                    orgRepository.findById(batch.getOrganizationId()).ifPresent(org -> {
                        batch.setOrganizationName(org.getName());
                    });
                }
            }
        }
        
        return results;
    }

    public BloodInventory reserveBatch(String batchId, String userId) {
        BloodInventory batch = repository.findById(batchId).orElseThrow(() -> new RuntimeException("Batch not found"));
        if (!"AVAILABLE".equals(batch.getStatus())) {
            throw new RuntimeException("Batch is not available");
        }
        batch.setStatus("RESERVED");
        // We could store "reservedBy" logic here if we added a field to Entity
        return repository.save(batch);
    }
    
    public BloodInventory confirmPickup(String batchId) {
        BloodInventory batch = repository.findById(batchId).orElseThrow(() -> new RuntimeException("Batch not found"));
        if (!"RESERVED".equals(batch.getStatus())) {
            throw new RuntimeException("Batch must be RESERVED before pickup");
        }
        batch.setStatus("FULFILLED");
        return repository.save(batch);
    }

    // --- FEFO Logic (First Expired, First Out) ---
    public void deductBloodFEFO(String orgId, String bloodGroup, int unitsToDeduct) {
        List<BloodInventory> availableBatches = repository.findByOrganizationIdAndBloodGroupAndStatus(orgId, bloodGroup, "AVAILABLE");
        
        // Sort by expiry date (ascending) -> Least shelf life first
        availableBatches.sort(java.util.Comparator.comparing(BloodInventory::getExpiryDate));

        int totalAvailable = availableBatches.stream().mapToInt(BloodInventory::getQuantity).sum();
        if (totalAvailable < unitsToDeduct) {
            throw new RuntimeException("Insufficient stock for " + bloodGroup + ". Available: " + totalAvailable);
        }

        int remainingToDeduct = unitsToDeduct;
        for (BloodInventory batch : availableBatches) {
            if (remainingToDeduct <= 0) break;

            int batchQuantity = batch.getQuantity();
            if (batchQuantity <= remainingToDeduct) {
                // Batch fully utilized
                remainingToDeduct -= batchQuantity;
                batch.setQuantity(0);
                batch.setStatus("UTILIZED"); // Mark as fully consumed
                repository.save(batch);
            } else {
                // Batch partially utilized
                batch.setQuantity(batchQuantity - remainingToDeduct);
                remainingToDeduct = 0;
                repository.save(batch);
            }
        }
    }
}
