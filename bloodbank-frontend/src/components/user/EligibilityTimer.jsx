import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { differenceInDays, addDays, format, isValid, parseISO } from 'date-fns';

const EligibilityTimer = ({ lastDonatedDate }) => {
    const { daysRemaining, progress, status, eligibleDate } = useMemo(() => {
        if (!lastDonatedDate) {
            return { daysRemaining: 0, progress: 100, status: 'ELIGIBLE', eligibleDate: new Date() };
        }

        // Handle string or Date object
        const lastDate = typeof lastDonatedDate === 'string' ? parseISO(lastDonatedDate) : lastDonatedDate;

        if (!isValid(lastDate)) {
            return { daysRemaining: 0, progress: 100, status: 'ELIGIBLE', eligibleDate: new Date() };
        }

        const today = new Date();
        const nextDate = addDays(lastDate, 90);
        const diff = differenceInDays(nextDate, today);

        const totalCycle = 90;
        const daysPassed = totalCycle - diff;
        let percent = (daysPassed / totalCycle) * 100;

        if (diff <= 0) {
            return { daysRemaining: 0, progress: 100, status: 'ELIGIBLE', eligibleDate: today };
        }

        let currentStatus = 'NOT_ELIGIBLE';
        if (diff <= 15) currentStatus = 'SOON';

        return {
            daysRemaining: diff,
            progress: Math.min(Math.max(percent, 0), 100),
            status: currentStatus,
            eligibleDate: nextDate
        };
    }, [lastDonatedDate]);

    // Color Config
    const colorMap = {
        ELIGIBLE: 'text-emerald-500',
        SOON: 'text-yellow-500',
        NOT_ELIGIBLE: 'text-neon-red'
    };

    const strokeColorMap = {
        ELIGIBLE: '#10b981', // emerald-500
        SOON: '#eab308',     // yellow-500
        NOT_ELIGIBLE: '#ff073a' // neon-red
    };

    const ringRadius = 50;
    const ringCircumference = 2 * Math.PI * ringRadius;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center relative overflow-hidden h-full"
        >
            <h3 className="text-white font-bold text-lg mb-6 z-10">Eligibility Status</h3>

            <div className="relative w-40 h-40 flex items-center justify-center z-10">
                {/* SVG Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="50%" cy="50%" r={ringRadius}
                        stroke="currentColor" strokeWidth="8"
                        fill="transparent"
                        className="text-white/10"
                    />
                    <motion.circle
                        cx="50%" cy="50%" r={ringRadius}
                        stroke={strokeColorMap[status]}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringCircumference - (progress / 100) * ringCircumference}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: ringCircumference }}
                        animate={{ strokeDashoffset: ringCircumference - (progress / 100) * ringCircumference }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="drop-shadow-[0_0_10px_currentColor]"
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {status === 'ELIGIBLE' ? (
                        <>
                            <span className="text-4xl">✅</span>
                            <span className="text-emerald-500 font-bold text-sm mt-1">READY</span>
                        </>
                    ) : (
                        <>
                            <span className={`text-3xl font-bold ${colorMap[status]}`}>
                                {daysRemaining}
                            </span>
                            <span className="text-gray-400 text-xs uppercase tracking-wide">Days Left</span>
                        </>
                    )}
                </div>
            </div>

            <div className={`mt-6 text-center z-10 ${status === 'ELIGIBLE' ? 'text-emerald-400' : 'text-gray-400'}`}>
                {status === 'ELIGIBLE' ? (
                    <p className="font-medium animate-pulse">You can donate today!</p>
                ) : (
                    <p className="text-sm">
                        Next eligible date: <br />
                        <span className="text-white font-bold">{format(eligibleDate, 'MMM d, yyyy')}</span>
                    </p>
                )}
            </div>

            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-10 blur-3xl rounded-full pointer-events-none ${status === 'ELIGIBLE' ? 'bg-emerald-500' : status === 'SOON' ? 'bg-yellow-500' : 'bg-neon-red'}`} />
        </motion.div>
    );
};

export default EligibilityTimer;
