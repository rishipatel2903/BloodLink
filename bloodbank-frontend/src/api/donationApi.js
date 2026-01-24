import api from './axios';

export const donationApi = {
    // Book Appointment
    bookAppointment: (data) => api.post('/donations/book', data),

    // Get History
    getUserDonations: (userId) => api.get(`/donations/user/${userId}`),
    getOrgDonations: (orgId) => api.get(`/donations/org/${orgId}`),

    // Org Ops
    updateStatus: (id, status) => api.put(`/donations/${id}/status?status=${status}`),
    completeDonation: (id) => api.post(`/donations/${id}/complete`),
};
