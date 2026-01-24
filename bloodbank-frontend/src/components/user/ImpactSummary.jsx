import { motion } from 'framer-motion';

const ImpactSummary = ({ totalDonations, livesSaved }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <StatCard
                label="Total Donations"
                value={totalDonations}
                icon="🩸"
                delay={0.1}
            />
            <StatCard
                label="Lives Impacted"
                value={livesSaved}
                icon="❤️"
                color="text-neon-red"
                delay={0.2}
            />
        </div>
    );
};

const StatCard = ({ label, value, icon, color = "text-white", delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.4 }}
        className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-colors"
    >
        <span className="text-2xl mb-2 filter drop-shadow-lg group-hover:scale-110 transition-transform">{icon}</span>
        <span className={`text-3xl font-bold ${color} mb-1`}>
            {value}
        </span>
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</span>
    </motion.div>
);

export default ImpactSummary;
