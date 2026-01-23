import { motion } from 'framer-motion';

const StockAlertCard = ({ type, message, count }) => {
    const isCritical = type === 'CRITICAL';

    return (
        <motion.div
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden p-6 rounded-2xl border ${isCritical ? 'border-neon-red/50 bg-neon-red/10' : 'border-yellow-500/30 bg-yellow-500/5'
                }`}
        >
            {/* Background Pulse for Critical */}
            {isCritical && (
                <motion.div
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-neon-red blur-3xl opacity-20"
                />
            )}

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className={`text-xs font-bold tracking-wider mb-2 ${isCritical ? 'text-neon-red' : 'text-yellow-500'}`}>
                        {type} ALERT
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{message}</h3>
                    <p className="text-gray-400 text-sm">Action required immediately</p>
                </div>

                <div className={`text-4xl font-bold ${isCritical ? 'text-neon-red' : 'text-white'}`}>
                    {count}
                </div>
            </div>
        </motion.div>
    );
};

export default StockAlertCard;
