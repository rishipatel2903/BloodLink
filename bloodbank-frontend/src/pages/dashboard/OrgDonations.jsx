import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { donationApi } from '../../api/donationApi';
import { motion } from 'framer-motion';
import { useRealtime } from '../../hooks/useRealtime';

const OrgDonations = () => {
    const { user } = useAuth();
    const { refreshInventory } = useInventory();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDonations = async () => {
        try {
            const data = await donationApi.getOrgDonations(user.id);
            setDonations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch donations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchDonations();
    }, [user.id]);

    // REAL-TIME: Refresh on new appointment or completion
    useRealtime((event) => {
        if (event.type === 'NEW_APPOINTMENT' || event.type === 'DONATION_COMPLETED') {
            fetchDonations();
        }
    });

    const handleStatusUpdate = async (id, status) => {
        try {
            await donationApi.updateStatus(id, status);
            fetchDonations();
        } catch (error) {
            console.error("Status update failed", error);
        }
    };

    const handleComplete = async (id) => {
        try {
            await donationApi.completeDonation(id);
            alert("Donation Completed! Stock added to inventory.");
            fetchDonations();
            refreshInventory(); // ✅ Update inventory list without reload
        } catch (error) {
            console.error("Completion failed", error);
        }
    };

    if (loading) return <div className="text-gray-500 italic">Loading donations...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Donation Appointments</h1>
                    <p className="text-gray-400">Manage incoming donor appointments and confirmations.</p>
                </div>
                <div className="bg-neon-red/10 border border-neon-red/20 px-6 py-3 rounded-2xl text-neon-red font-bold">
                    {donations.filter(d => d.status === 'PENDING').length} Pending
                </div>
            </header>

            <div className="glass-panel overflow-hidden rounded-3xl border border-white/5 bg-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                            <th className="p-6 font-medium">Donor Name</th>
                            <th className="p-6 font-medium">Blood Group</th>
                            <th className="p-6 font-medium">Appointment</th>
                            <th className="p-6 font-medium">Status</th>
                            <th className="p-6 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {donations.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-gray-500 italic">No donation appointments found.</td>
                            </tr>
                        ) : (
                            donations.map((donation) => (
                                <tr key={donation.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6 text-white font-bold">{donation.userName || donation.donorName}</td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-white/10 rounded-lg text-neon-red font-mono font-bold">{donation.bloodGroup}</span>
                                    </td>
                                    <td className="p-6 text-gray-300">
                                        {donation.appointmentDate}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${donation.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                            donation.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                donation.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-red-500/10 text-red-500'
                                            }`}>
                                            {donation.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right space-x-2">
                                        {donation.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleStatusUpdate(donation.id, 'APPROVED')} className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all">Approve</button>
                                                <button onClick={() => handleStatusUpdate(donation.id, 'REJECTED')} className="px-4 py-2 bg-white/5 text-gray-400 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all">Reject</button>
                                            </>
                                        )}
                                        {donation.status === 'APPROVED' && (
                                            <button onClick={() => handleComplete(donation.id)} className="px-6 py-2 bg-neon-red text-white text-xs font-bold rounded-lg hover:bg-red-600 shadow-[0_0_15px_rgba(255,7,58,0.3)] transition-all">Complete Donation</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrgDonations;
