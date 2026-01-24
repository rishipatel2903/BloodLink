import { motion } from 'framer-motion';

const HeroBanner = ({ userName }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 md:p-12 shadow-2xl"
        >
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-neon-red/20 blur-[100px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3"
                    >
                        <span className="px-3 py-1 rounded-full bg-neon-red/10 border border-neon-red/20 text-neon-red text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(255,7,58,0.2)]">
                            User Dashboard
                        </span>
                        <span className="text-gray-400 text-sm">Welcome back, {userName}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-4xl md:text-5xl font-bold text-white leading-tight"
                    >
                        Every Drop You Donate <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-red to-red-400 filter drop-shadow-[0_0_10px_rgba(255,7,58,0.5)]">
                            Saves Lives
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-gray-400 text-lg max-w-lg"
                    >
                        Track your impact, manage appointments, and stay campaign-ready. Your contribution matters.
                    </motion.p>
                </div>

                {/* Heartbeat Animation */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center"
                >
                    <div className="absolute inset-0 bg-neon-red/20 rounded-full blur-2xl animate-ping" />
                    <div className="text-8xl md:text-9xl filter drop-shadow-[0_0_30px_rgba(255,7,58,0.6)]">
                        🩸
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default HeroBanner;
