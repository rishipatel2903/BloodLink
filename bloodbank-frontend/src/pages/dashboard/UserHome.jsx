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
import { useRealtime } from '../../hooks/useRealtime';

const UserHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch User Data & Donations
    const fetchData = async () => {
        if (!user?.id) return;
        try {
            // Parallel fetch using Service Layer
            const [userRes, donationsRes] = await Promise.all([
                authApi.getCurrentUser(user.id).catch(err => {
                    console.warn("Profile fetch failed, using stale context data", err);
                    return user;
                }),
                donationApi.getUserDonations(user.id)
            ]);

            // Update user data (essential for lastDonatedDate sync)
            setUserData(userRes || user);

            // Filter only completed donations for stats
            const rawDonations = Array.isArray(donationsRes) ? donationsRes : [];
            const completedDonationList = rawDonations.map(d => ({
                id: d.id,
                date: d.appointmentDate,
                units: 1,
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

    useEffect(() => {
        fetchData();
    }, [user]);

    // REAL-TIME: Listen for user-specific events (eligibility update, donation milestone etc.)
    useRealtime((event) => {
        console.log("Real-time update triggered:", event.type);
        fetchData();
    });

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">

                {/* 2a. Eligibility Status */}
                <div className="h-full">
                    <EligibilityTimer lastDonatedDate={userData?.lastDonatedDate || user?.lastDonatedDate} />
                </div>

                {/* 2b. Impact Summary */}
                <div className="h-full">
                    <div className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-white/5 h-full flex flex-col justify-between shadow-2xl">
                        <div>
                            <div className="text-emerald-400 text-3xl mb-4">⭐</div>
                            <h3 className="text-white font-bold text-lg mb-4 tracking-tight">Your Impact</h3>
                            <ImpactSummary totalDonations={donations.length} livesSaved={donations.length * 3} />
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <p className="text-gray-500 text-xs italic">"Every drop counts. You've been a hero to families in need."</p>
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
