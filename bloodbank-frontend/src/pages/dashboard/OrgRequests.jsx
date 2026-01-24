import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { motion } from 'framer-motion';

const OrgRequests = () => {
    const { user } = useAuth();
    const { refreshInventory } = useInventory(); // To sync stock count
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/requests/org/${user.id}`);
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchRequests();
            const interval = setInterval(fetchRequests, 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [user.id]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:8080/api/requests/${id}/status?status=${status}`, {
                method: 'PUT'
            });
            if (response.ok) {
                alert(`Request status updated to ${status}`);
                fetchRequests();
            }
        } catch (error) {
            console.error("Status update failed", error);
        }
    };

    const handleApprove = async (id) => {
        handleStatusUpdate(id, 'APPROVED');
    };

    const handleFulfill = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/requests/${id}/fulfill?orgId=${user.id}`, {
                method: 'POST'
            });
            if (response.ok) {
                alert("Pickup Confirmed! Inventory deducted automatically (FEFO).");
                fetchRequests();
                refreshInventory(); // Sync Dashboard
            } else {
                const err = await response.text();
                alert(`Fulfillment Error: ${err}`);
            }
        } catch (error) {
            console.error("Fulfillment failed", error);
        }
    };

    if (loading) return <div className="text-gray-500 italic">Loading requests...</div>;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Patient Blood Requests</h1>
                <p className="text-gray-400">View and respond to urgent blood needs in the community.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {requests.length === 0 ? (
                    <div className="glass-panel p-12 text-center text-gray-500 rounded-3xl border border-white/5">
                        No pending blood requests at the moment.
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className={`glass-panel p-6 rounded-3xl border transition-all ${req.urgency === 'CRITICAL' ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-white/5'
                            }`}>
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-2 rounded-xl font-bold text-xl ${req.urgency === 'CRITICAL' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-neon-red/20 text-neon-red border border-neon-red/20'
                                            }`}>
                                            {req.bloodGroup}
                                        </span>
                                        <h3 className="text-white font-bold text-lg">{req.patientName}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${req.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {req.urgency}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${(req.status === 'FULFILLED' || req.status === 'UTILIZED') ? 'bg-emerald-500/10 text-emerald-500' :
                                                req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    req.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-400' :
                                                        'bg-red-500/10 text-red-500'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-300"><span className="text-gray-500 font-medium">Hospital:</span> {req.hospitalName}</p>
                                    <p className="text-gray-300"><span className="text-gray-500 font-medium">Units:</span> {req.units} Units Required</p>
                                    <p className="text-gray-300"><span className="text-gray-500 font-medium">Contact:</span> <span className="text-emerald-400">{req.contactNumber}</span></p>
                                </div>

                                <div className="text-right space-y-4">
                                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Requested {new Date(req.requestedAt).toLocaleTimeString()}</div>
                                    <div className="flex gap-2 justify-end">
                                        {req.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(req.id)}
                                                    className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all"
                                                >
                                                    Approve Request
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                    className="px-6 py-2 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {req.status === 'APPROVED' && (
                                            <div className="flex flex-col items-end gap-3">
                                                <span className="text-emerald-400 text-xs font-bold animate-pulse">● Waiting for User Pickup</span>
                                                <button
                                                    onClick={() => handleFulfill(req.id)}
                                                    className="px-8 py-3 bg-neon-red text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(255,7,58,0.4)] hover:shadow-neon-red/70 hover:scale-105 transition-all border border-neon-red/20 flex items-center gap-2"
                                                >
                                                    <span>Confirm Pickup</span>
                                                    <span className="text-xs px-2 py-0.5 bg-black/30 rounded">FEFO</span>
                                                </button>
                                            </div>
                                        )}
                                        {(req.status === 'FULFILLED' || req.status === 'UTILIZED') && (
                                            <div className="text-emerald-400 font-bold flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">✔</span>
                                                    <span>Handed Over</span>
                                                </div>
                                                <span className="text-[10px] text-gray-500 font-mono">STOCK DEDUCTED (FEFO)</span>
                                            </div>
                                        )}
                                        {req.status === 'REJECTED' && (
                                            <span className="text-red-500 font-bold">REJECTED</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrgRequests;
