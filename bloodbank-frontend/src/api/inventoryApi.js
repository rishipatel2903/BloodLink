import api from './axios';

export const inventoryApi = {
    // Search
    searchStock: (bloodGroup) => api.get(`/inventory/search?bloodGroup=${encodeURIComponent(bloodGroup)}`),

    // Org Inventory
    getOrgInventory: (orgId) => api.get(`/inventory/org/${orgId}`),

    // Manage
    addBatch: (data) => api.post('/inventory/add', data),

    // Reserve/Pickup
    reserveStock: (id, userId) => api.post(`/inventory/${id}/reserve`, { userId }), // Assuming userId payload
    confirmPickup: (id) => api.post(`/inventory/${id}/confirm-pickup`),

    // Maintenance
    deleteBatch: (id) => api.delete(`/inventory/${id}`),
};
