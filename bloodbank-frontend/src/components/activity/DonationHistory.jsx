import { motion } from 'framer-motion';

const DonationHistory = ({ donations = [] }) => {
    if (donations.length === 0) {
        return (
            <div className="glass-panel p-8 text-center text-gray-500 rounded-3xl border border-white/5 italic">
                No donation history yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {donations.map((donation, index) => (
                <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 flex justify-between items-center group hover:border-white/10 transition-all hover:bg-white/10"
                >
                    <div className="space-y-1">
                        <div className="text-white font-bold flex items-center gap-3">
                            <span>{donation.orgName || 'Processing...'}</span>
                            <span className="text-[10px] font-mono text-gray-500 bg-black/30 px-2 py-0.5 rounded">
                                #{donation.id.slice(-6)}
                            </span>
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-4">
                            <span>📅 {donation.date}</span>
                            <span>🩸 {donation.bloodGroup}</span>
                        </div>
                    </div>

                    <div className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest ${donation.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            donation.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                donation.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                        {donation.status}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default DonationHistory;
