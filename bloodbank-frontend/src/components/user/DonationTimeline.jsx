import { motion } from 'framer-motion';

const DonationTimeline = ({ donations = [] }) => {
    if (!donations || donations.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 italic border border-white/5 rounded-2xl bg-white/5">
                No donation history yet. Start your journey today!
            </div>
        );
    }

    return (
        <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-3.5 before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-neon-red before:via-white/10 before:to-transparent">
            {donations.map((d, index) => (
                <motion.div
                    key={d.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                >
                    {/* Dot on Timeline */}
                    <div className="absolute left-0 -ml-[19px] mt-1.5 w-4 h-4 rounded-full border-2 border-neon-red bg-black shadow-[0_0_10px_rgba(255,7,58,0.5)] z-10" />

                    <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-neon-red/30 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="text-white font-bold text-lg group-hover:text-neon-red transition-colors">
                                    {d.orgName || 'Blood Bank'}
                                </h4>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">
                                    {d.date}
                                </span>
                            </div>
                            <span className="px-3 py-1 rounded-lg bg-neon-red/10 text-neon-red font-bold text-sm border border-neon-red/20">
                                {d.units || 1} Unit
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                🩸 {d.bloodGroup}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">Verified Donation</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default DonationTimeline;
