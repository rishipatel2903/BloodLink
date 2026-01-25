import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { differenceInDays, addDays, format, isValid, parseISO } from 'date-fns';

const EligibilityTimer = ({ lastDonatedDate }) => {
    const { daysRemaining, progress, status, eligibleDate } = useMemo(() => {
        if (!lastDonatedDate) {
            return { daysRemaining: 0, progress: 100, status: 'ELIGIBLE', eligibleDate: new Date() };
        }

        let lastDate;
        if (Array.isArray(lastDonatedDate)) {
            lastDate = new Date(lastDonatedDate[0], lastDonatedDate[1] - 1, lastDonatedDate[2], lastDonatedDate[3] || 0, lastDonatedDate[4] || 0);
        } else if (typeof lastDonatedDate === 'string') {
            lastDate = parseISO(lastDonatedDate);
        } else {
            lastDate = lastDonatedDate;
        }

        if (!isValid(lastDate)) {
            return { daysRemaining: 0, progress: 100, status: 'ELIGIBLE', eligibleDate: new Date() };
        }

        const today = new Date();
        const nextDate = addDays(lastDate, 56);
        const diff = differenceInDays(nextDate, today);

        const totalCycle = 56;
        const daysPassed = totalCycle - diff;
        let percent = (daysPassed / totalCycle) * 100;

        if (diff <= 0) {
            return { daysRemaining: 0, progress: 100, status: 'ELIGIBLE', eligibleDate: today };
        }

        let currentStatus = 'NOT_ELIGIBLE';
        if (diff <= 7) currentStatus = 'SOON';

        return {
            daysRemaining: diff,
            progress: Math.min(Math.max(percent, 0), 100),
            status: currentStatus,
            eligibleDate: nextDate
        };
    }, [lastDonatedDate]);

    const colors = {
        ELIGIBLE: { text: 'text-emerald-500', stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bg: 'from-emerald-900/20' },
        SOON: { text: 'text-yellow-500', stroke: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', bg: 'from-yellow-900/20' },
        NOT_ELIGIBLE: { text: 'text-neon-red', stroke: '#ff073a', glow: 'rgba(255, 7, 58, 0.4)', bg: 'from-red-900/20' }
    };

    const current = colors[status];
    const ringRadius = 60;
    const ringCircumference = 2 * Math.PI * ringRadius;

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className={`relative overflow-hidden h-full rounded-[2rem] border border-white/5 bg-black/40 p-6 flex flex-col items-center justify-center transition-all duration-300 group shadow-2xl`}
        >
            {/* Dynamic Background Glow */}
            <div className={`absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial ${current.bg} to-transparent opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity`} />

            <h3 className="text-white font-bold text-lg mb-6 relative z-10 tracking-tight flex items-center gap-2">
                <span className="opacity-50">⚡</span> Eligibility Status
            </h3>

            <div className="relative w-48 h-48 flex items-center justify-center z-10 bg-white/[0.02] rounded-full p-3 border border-white/5 backdrop-blur-sm shadow-inner">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                    <defs>
                        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={current.stroke} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={current.stroke} />
                        </linearGradient>
                    </defs>

                    {/* Background Track with glass effect */}
                    <circle
                        cx="50%" cy="50%" r={ringRadius}
                        stroke="rgba(255,255,255,0.02)" strokeWidth="12"
                        fill="transparent"
                    />

                    {/* Progress Glow Loop */}
                    <motion.circle
                        cx="50%" cy="50%" r={ringRadius}
                        stroke={current.stroke}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringCircumference - (progress / 100) * ringCircumference}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: ringCircumference }}
                        animate={{ strokeDashoffset: ringCircumference - (progress / 100) * ringCircumference }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="opacity-20 blur-[2px]"
                    />

                    {/* Main Progress Stroke */}
                    <motion.circle
                        cx="50%" cy="50%" r={ringRadius}
                        stroke="url(#ringGradient)"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringCircumference - (progress / 100) * ringCircumference}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: ringCircumference }}
                        animate={{ strokeDashoffset: ringCircumference - (progress / 100) * ringCircumference }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        filter={`drop-shadow(0 0 10px ${current.glow})`}
                    />

                    {/* Floating Indicator Point */}
                    {status !== 'ELIGIBLE' && (
                        <motion.circle
                            cx="50%" cy="50%" r="4"
                            fill="#FFFFFF"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                                transformOrigin: 'center',
                                transform: `rotate(${(progress / 100) * 360}deg) translateY(-${ringRadius}px)`
                            }}
                            className="shadow-[0_0_10px_#FFFFFF]"
                        />
                    )}
                </svg>

                {/* Central Status Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {status === 'ELIGIBLE' ? (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] mb-2 border-2 border-white/20">
                                <span className="text-3xl text-white">✓</span>
                            </div>
                            <span className="text-emerald-400 font-black text-[10px] tracking-[0.4em] drop-shadow-lg leading-none">READY</span>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500 font-black text-[10px] tracking-[0.3em] mb-1 uppercase opacity-80">WAIT</span>
                            <motion.span
                                key={daysRemaining}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className={`text-6xl font-black ${current.text} drop-shadow-[0_0_15px_rgba(255,7,58,0.4)] flex items-baseline`}
                            >
                                {daysRemaining}
                            </motion.span>
                            <span className="text-gray-500 font-bold text-[8px] tracking-[0.3em] mt-1 uppercase opacity-60">DAYS LEFT</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Status Panel */}
            <div className="mt-8 text-center z-10 w-full group-hover:scale-[1.02] transition-transform">
                {status === 'ELIGIBLE' ? (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        <p className="text-emerald-400 font-black text-xs tracking-wide">Ready for donation</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="inline-block px-4 py-1.5 bg-neon-red/10 border border-neon-red/20 rounded-xl backdrop-blur-md">
                            <p className="text-[9px] font-black tracking-[0.2em] text-neon-red/90 uppercase italic">Recovery: 56 Days</p>
                        </div>
                        <div className="flex justify-center items-center gap-2 text-white">
                            <span className="opacity-30 text-xs">📅</span>
                            <p className="font-bold text-base tracking-tight text-gray-300">
                                Next: <span className="text-white font-medium">{format(eligibleDate, 'MMM d, yyyy')}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Corner Accents */}
            <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white/10 rounded-tr-[2rem] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-white/10 rounded-bl-[2rem] pointer-events-none" />
        </motion.div>
    );
};

export default EligibilityTimer;
