import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { authApi } from '../../api/authApi';
import { motion } from 'framer-motion';
import HeroBanner from '../../components/user/HeroBanner';
import EligibilityTimer from '../../components/user/EligibilityTimer';
import ImpactSummary from '../../components/user/ImpactSummary';
import DonationTimeline from '../../components/user/DonationTimeline';
import DonationChart from '../../components/user/DonationChart';

const UserHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch User Data & Donations
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                // Parallel fetch using Service Layer
                const [userRes, donationsRes] = await Promise.all([
                    authApi.getCurrentUser(user.id).catch(() => user), // Fallback if API missing
                    donationApi.getUserDonations(user.id)
                ]);

                // Update user data (for lastDonatedDate)
                setUserData(userRes || user);

                // Filter only completed donations for stats
                const rawDonations = Array.isArray(donationsRes) ? donationsRes : [];
                const completedDonationList = rawDonations.map(d => ({
                    id: d.id,
                    date: d.appointmentDate,
                    units: 1, // Default to 1 unit per donation request
                    orgName: d.orgName || "Blood Bank Center",
                    bloodGroup: d.bloodGroup,
                    status: d.status
                })).filter(d => d.status === 'COMPLETED');

                setDonations(completedDonationList);
            } catch (error) {
                console.error("Dashboard Data Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Derived Analytics Data for Chart
    const chartData = useMemo(() => {
        const months = {};
        donations.forEach(d => {
            const date = new Date(d.date);
            const monthKey = date.toLocaleString('default', { month: 'short' });
            months[monthKey] = (months[monthKey] || 0) + d.units;
        });

        return Object.entries(months).map(([month, units]) => ({ month, units }));
    }, [donations]);

    return (
        <div className="space-y-8 pb-12">
            {/* 1. Hero Banner */}
            <HeroBanner userName={user?.name || 'Hero'} />

            {/* 2. Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 2a. Eligibility Timer */}
                <div className="h-full">
                    <EligibilityTimer lastDonatedDate={userData?.lastDonatedDate || user?.lastDonatedDate} />
                </div>

                {/* 2b. Search Stock (Interactive Navigation) */}
                <motion.div
                    whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(59, 130, 246, 0.15)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/dashboard/user/find')}
                    onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/user/find')}
                    role="button"
                    tabIndex={0}
                    className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 flex flex-col justify-between h-full cursor-pointer group hover:bg-white/10 transition-colors"
                >
                    <div className="pointer-events-none">
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-blue-400 text-3xl group-hover:scale-110 transition-transform duration-300">🔍</div>
                            <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">FIND</span>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">Need Blood?</h3>
                        <p className="text-sm text-gray-400 mb-4">Search real-time inventory at hospitals near you.</p>
                    </div>
                    <button className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold rounded-xl border border-blue-500/20 transition-all pointer-events-none group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        Search Stock →
                    </button>
                </motion.div>

                {/* 2c. Impact Summary */}
                <div className="h-full">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 h-full flex flex-col justify-between">
                        <div>
                            <div className="text-emerald-400 text-3xl mb-4">⭐</div>
                            <h3 className="text-white font-bold text-lg mb-4">Your Impact</h3>
                            <ImpactSummary totalDonations={donations.length} livesSaved={donations.length * 3} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Analytics Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 3a. Donation Activity Chart */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Monthly Contribution</h3>
                        <select className="bg-black/30 border border-white/10 rounded-lg text-xs text-gray-400 px-2 py-1">
                            <option>2026</option>
                            <option>2025</option>
                        </select>
                    </div>
                    <DonationChart data={chartData.length > 0 ? chartData : [{ month: 'Jan', units: 0 }, { month: 'Feb', units: 0 }, { month: 'Mar', units: 0 }]} />
                </div>

                {/* 3b. Operations Timeline */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
                    <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <DonationTimeline donations={donations} />
                    </div>
                </div>

            </section>
        </div>
    );
};

export default UserHome;
