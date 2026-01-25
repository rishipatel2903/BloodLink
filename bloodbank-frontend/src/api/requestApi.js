import api from './axios';

export const requestApi = {
    // Create Broadcast/Request
    createRequest: (data) => api.post('/requests/create', data),

    // History
    getPendingRequests: () => api.get('/requests/org/pending'),
    getOrgRequests: (orgId) => api.get(`/requests/org/${orgId}`),
    getHospitalRequests: (hospitalId) => api.get(`/hospital/${hospitalId}/requests`), // From HospitalController

    // Fulfillment
    fulfillRequest: (id, orgId) => api.post(`/requests/${id}/fulfill?orgId=${orgId}`),

    // Status Update
    updateStatus: (id, status, orgId) => api.put(`/requests/${id}/status?status=${status}&orgId=${orgId}`),

    // Utilities
    getMatchingDonors: (id) => api.get(`/requests/${id}/matching-donors`),
};
