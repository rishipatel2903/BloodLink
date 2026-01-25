import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { motion } from 'framer-motion';
import ActivitySummary from '../../components/activity/ActivitySummary';
import DonationHistory from '../../components/activity/DonationHistory';
import ActivityTimeline from '../../components/activity/ActivityTimeline';
import ReportDownloadModal from '../../components/dashboard/ReportDownloadModal';
import { useRealtime } from '../../hooks/useRealtime';

const MyActivity = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const donRes = await donationApi.getUserDonations(user.id);
            setDonations(Array.isArray(donRes) ? donRes : []);
        } catch (error) {
            console.error("Failed to fetch activity data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // REAL-TIME: Refresh history on any status update or completion
    useRealtime(() => {
        fetchData();
    });

    const timelineEvents = useMemo(() => {
        return donations.map(d => ({
            type: 'DONATION',
            date: d.appointmentDate,
            timestamp: new Date(d.appointmentDate).getTime(),
            title: `Donation at ${d.orgName || 'Blood Bank'}`,
            details: `Blood Group: ${d.bloodGroup}`,
            status: d.status
        })).sort((a, b) => b.timestamp - a.timestamp);
    }, [donations]);

    const livesImpacted = donations.filter(d => d.status === 'COMPLETED').length * 3;
    const completedDonationsCount = donations.filter(d => d.status === 'COMPLETED').length;

    if (loading && donations.length === 0) {
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
                    <p className="text-gray-400">Track your donations and lifesaving impact history.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-neon-red to-red-600 rounded-xl text-sm font-bold text-white transition-all shadow-lg"
                    >
                        📄 Download Impact Report
                    </button>
                </div>
            </header>

            <ActivitySummary
                totalDonations={completedDonationsCount}
                totalRequests={0}
                livesImpacted={livesImpacted}
                hideRequests={true}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-neon-red">🩸</span> Donation History
                        </h2>
                        <DonationHistory donations={donations} />
                    </section>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <h2 className="text-xl font-bold text-white mb-6">Impact Timeline</h2>
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
