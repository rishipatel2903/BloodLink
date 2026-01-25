import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestApi } from '../../api/requestApi';
import { motion } from 'framer-motion';
import RetrievalHistory from '../../components/activity/RetrievalHistory';
import api from '../../api/axios';
import { useRealtime } from '../../hooks/useRealtime';

const HospitalActivity = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await requestApi.getHospitalRequests(user.id);
            setRequests(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error("Failed to fetch hospital requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    // REAL-TIME: Refresh history on any status change
    useRealtime(() => {
        fetchData();
    });

    const stats = useMemo(() => {
        return {
            total: requests.length,
            fulfilled: requests.filter(r => r.status === 'UTILIZED' || r.status === 'FULFILLED').length,
            pending: requests.filter(r => r.status === 'PENDING').length,
        };
    }, [requests]);

    const handleDownloadReport = async () => {
        try {
            const response = await api.get(`/reports/hospital/${user.id}/full`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Hospital_Report_${user.name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Report download failed", error);
            alert("Could not generate report at this time.");
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading activity history...</div>;

    return (
        <div className="space-y-12 pb-20">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Hospital Activities</h1>
                    <p className="text-gray-400">Track all blood requests and generate history reports.</p>
                </div>
                <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-neon-red to-red-600 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-neon-red/20"
                >
                    📄 Generate PDF Report
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox label="Total Requests" value={stats.total} color="text-white" />
                <StatBox label="Fulfilled" value={stats.fulfilled} color="text-emerald-400" />
                <StatBox label="Pending Approval" value={stats.pending} color="text-orange-400" />
            </div>

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-blue-400">🚑</span> Request History
                    </h2>
                </div>
                <RetrievalHistory requests={requests} />
            </section>
        </div>
    );
};

const StatBox = ({ label, value, color }) => (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
        <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">{label}</div>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
);

export default HospitalActivity;
