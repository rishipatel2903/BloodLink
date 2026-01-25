import { motion } from 'framer-motion';

const ImpactSummary = ({ totalDonations, livesSaved }) => {
    return (
        <div className="grid grid-cols-2 gap-4 w-full h-full">
            <StatCard
                label="Total Donations"
                value={totalDonations}
                icon="🩸"
                glowColor="rgba(255, 7, 58, 0.4)"
                delay={0.1}
            />
            <StatCard
                label="Lives Impacted"
                value={livesSaved}
                icon="❤️"
                glowColor="rgba(16, 185, 129, 0.4)"
                color="text-emerald-400"
                delay={0.2}
            />
        </div>
    );
};

const StatCard = ({ label, value, icon, color = "text-white", glowColor, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: "easeOut" }}
        className="relative group h-full flex flex-col items-center justify-center p-4 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 hover:bg-white/5"
    >
        {/* Ambient Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-white/10 to-transparent" />

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2 border border-white/10 group-hover:scale-110 group-hover:border-white/20 transition-all">
                <span className="text-2xl filter drop-shadow-lg">{icon}</span>
            </div>

            <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`text-4xl font-black ${color} mb-1 tracking-tighter drop-shadow-[0_0_10px_${glowColor}]`}
            >
                {value}
            </motion.span>

            <span className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em] text-center px-1">
                {label}
            </span>
        </div>

        {/* Subtle Bottom Accent */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full opacity-20 blur-sm`} style={{ backgroundColor: glowColor }} />
    </motion.div>
);

export default ImpactSummary;
