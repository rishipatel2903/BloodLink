import { motion } from 'framer-motion';

const ExpiryProgressBar = ({ collectionDate, expiryDate }) => {
    const start = new Date(collectionDate).getTime();
    const end = new Date(expiryDate).getTime();
    const now = new Date().getTime();

    const totalDuration = end - start;
    const elapsed = now - start;

    let percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

    // Color Logic: <50% Green, <80% Yellow, >80% Red
    let color = 'bg-emerald-500';
    if (percentage > 80) color = 'bg-neon-red';
    else if (percentage > 50) color = 'bg-yellow-500';

    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    const isExpired = percentage >= 100;

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Shelf Life</span>
                <span className={`${isExpired ? 'text-neon-red font-bold' : 'text-gray-300'}`}>
                    {isExpired ? 'Expired' : `${daysLeft} days left`}
                </span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color} shadow-[0_0_10px_currentColor]`}
                />
            </div>
        </div>
    );
};

export default ExpiryProgressBar;
