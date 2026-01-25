import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { requestApi } from '../../api/requestApi';
import { motion } from 'framer-motion';
import ActivitySummary from '../../components/activity/ActivitySummary';
import DonationHistory from '../../components/activity/DonationHistory';
import RetrievalHistory from '../../components/activity/RetrievalHistory';
import ActivityTimeline from '../../components/activity/ActivityTimeline';
import ReportDownloadModal from '../../components/dashboard/ReportDownloadModal';

const MyActivity = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true); // Optional: Only show loading on first load or explicit refresh? 
        // Better: Loading state only for initial. For background sync, allow silent update.
        try {
            const [donRes, reqRes] = await Promise.all([
                donationApi.getUserDonations(user.id),
                requestApi.getUserRequests(user.id)
            ]);
            setDonations(Array.isArray(donRes) ? donRes : []);
            setRequests(Array.isArray(reqRes) ? reqRes : []);
        } catch (error) {
            console.error("Failed to fetch activity data", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load & Polling
    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            // Silent refresh
            if (user?.id) {
                Promise.all([
                    donationApi.getUserDonations(user.id),
                    requestApi.getUserRequests(user.id)
                ]).then(([donRes, reqRes]) => {
                    setDonations(Array.isArray(donRes) ? donRes : []);
                    setRequests(Array.isArray(reqRes) ? reqRes : []);
                }).catch(err => console.error("Background Sync Error", err));
            }
        }, 8000); // 8 seconds poll
        return () => clearInterval(interval);
    }, [user]);

    // Merge and Sort Events for Timeline
    const timelineEvents = useMemo(() => {
        const donationEvents = donations.map(d => ({
            type: 'DONATION',
            date: d.appointmentDate, // YYYY-MM-DD
            timestamp: new Date(d.appointmentDate).getTime(),
            title: `Donation at ${d.orgName || 'Blood Bank'}`,
            details: `Blood Group: ${d.bloodGroup}`,
            status: d.status
        }));

        const requestEvents = requests.map(r => ({
            type: 'REQUEST',
            date: r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : 'N/A',
            timestamp: r.requestedAt ? new Date(r.requestedAt).getTime() : 0,
            title: `Request for ${r.patientName}`,
            details: `Units: ${r.units} • Hospital: ${r.hospitalName}`,
            status: r.status
        }));

        return [...donationEvents, ...requestEvents].sort((a, b) => b.timestamp - a.timestamp);
    }, [donations, requests]);

    const livesImpacted = donations.filter(d => d.status === 'COMPLETED').length * 3;

    const completedDonationsCount = donations.filter(d => d.status === 'COMPLETED').length;

    if (loading && donations.length === 0 && requests.length === 0) {
        return <div className="p-12 text-center text-gray-500 animate-pulse">Loading your activity...</div>;
    }

    return (
        <div className="space-y-12 pb-20">
            <header className="flex justify-between items-end">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        My Activity
                    </motion.h1>
                    <p className="text-gray-400">Track your donations, requests, and complete history.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-neon-red to-red-600 hover:shadow-[0_0_15px_rgba(255,18,18,0.3)] rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                    >
                        📄 Download Report
                    </button>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-neon-red transition-all active:scale-95"
                    >
                        <span className="text-lg">↻</span> Refresh Status
                    </button>
                </div>
            </header>

            {/* Section 1: Summary Cards */}
            <ActivitySummary
                totalDonations={completedDonationsCount}
                totalRequests={requests.length}
                livesImpacted={livesImpacted}
            />

            {/* Section 4: Timeline (Floating Right on Desktop, or Stacked) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Histories */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Section 2: Donation History */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-neon-red">🩸</span> Donation History
                        </h2>
                        <DonationHistory donations={donations} />
                    </section>

                    {/* Section 3: Retrieval Requests */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-blue-400">🚑</span> Blood Retrieval Requests
                        </h2>
                        <RetrievalHistory requests={requests} />
                    </section>
                </div>

                {/* Right Column: Unified Timeline */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <h2 className="text-xl font-bold text-white mb-6">Activity Timeline</h2>
                        <div className="max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                            <ActivityTimeline events={timelineEvents} />
                        </div>
                    </div>
                </div>

            </div>

            <ReportDownloadModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                userId={user?.id}
            />
        </div>
    );
};

export default MyActivity;
