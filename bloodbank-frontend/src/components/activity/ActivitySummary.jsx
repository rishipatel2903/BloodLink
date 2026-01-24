import { motion } from 'framer-motion';

const ActivitySummary = ({ totalDonations = 0, totalRequests = 0, livesImpacted = 0 }) => {
    const cards = [
        { label: 'Total Donations', value: totalDonations, icon: '🩸', color: 'text-white' },
        { label: 'Blood Requests', value: totalRequests, icon: '🚑', color: 'text-blue-400' },
        { label: 'Lives Impacted', value: livesImpacted, icon: '❤️', color: 'text-neon-red' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, index) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-neon-red/10 transition-shadow"
                >
                    <div className="text-3xl mb-3 filter drop-shadow-md">{card.icon}</div>
                    <div className={`text-3xl font-bold ${card.color} mb-1`}>
                        {card.value}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                        {card.label}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ActivitySummary;
