import api from './axios';

export const requestApi = {
    // Create Broadcast/Request
    createRequest: (data) => api.post('/requests/create', data),

    // History
    getUserRequests: (userId) => api.get(`/requests/user/${userId}`),
    getOrgRequests: (orgId) => api.get(`/requests/org/${orgId}`),

    // Fulfillment
    fulfillRequest: (id) => api.post(`/requests/${id}/fulfill`),

    // Status Update (if needed)
    updateStatus: (id, status) => api.put(`/requests/${id}/status?status=${status}`),
};
