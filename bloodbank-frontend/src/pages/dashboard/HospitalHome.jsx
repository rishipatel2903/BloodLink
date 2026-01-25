import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useRealtime } from '../../hooks/useRealtime';

const HospitalHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalRequests: 0,
        fulfilledRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const data = await api.get(`/hospital/dashboard/stats/${user.id}`);
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch hospital stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchStats();
    }, [user?.id]);

    // REAL-TIME: Refresh stats when a request status changes
    useRealtime(() => {
        fetchStats();
    });

    const statCards = [
        { name: 'Total Requests', value: stats.totalRequests, icon: '📊', color: 'from-blue-500/10' },
        { name: 'Fulfilled', value: stats.fulfilledRequests, icon: '✅', color: 'from-emerald-500/10' },
        { name: 'Pending', value: stats.pendingRequests, icon: '⏳', color: 'from-orange-500/10' },
        { name: 'Approved', value: stats.approvedRequests, icon: '⭐', color: 'from-purple-500/10' },
    ];

    const handleDownloadReport = async () => {
        try {
            const response = await api.get(`/reports/hospital/${user.id}/full`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `BloodLink_Hospital_Report_${user.name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Report download failed", error);
            alert("Report currently unavailable.");
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Hospital Dashboard</h1>
                <p className="text-gray-400 italic">Managing lifesaving blood requests for patients.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br ${stat.color} to-transparent`}
                    >
                        <div className="text-3xl mb-4">{stat.icon}</div>
                        <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.name}</div>
                        <div className="text-4xl font-black text-white drop-shadow-sm">
                            {loading ? <span className="text-gray-600">...</span> : stat.value}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Report Generator (Replaces Recent Operations) */}
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent flex flex-col justify-between group">
                    <div>
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                            📄
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Activity Report</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                            Generate a comprehensive PDF report of all your blood requests, fulfillments, and performance metrics.
                        </p>
                    </div>

                    <button
                        onClick={handleDownloadReport}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 group-hover:border-blue-500/30"
                    >
                        <span className="text-xl">📥</span> Download PDF Summary
                    </button>
                </div>

                {/* 2. Urgent Request */}
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-neon-red/5 to-transparent flex flex-col justify-center items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-neon-red/10 rounded-full flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(255,7,58,0.2)]">
                        🚑
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Need Blood Urgently?</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">Broadcast a critical request to all nearby blood organizations immediately.</p>
                    </div>
                    <Link to="/dashboard/hospital/request" className="w-full py-4 bg-neon-red text-white font-black rounded-2xl shadow-[0_0_20px_rgba(255,7,58,0.3)] hover:shadow-[0_0_30px_rgba(255,7,58,0.4)] transition-all">
                        CREATE CRITICAL REQUEST
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HospitalHome;
