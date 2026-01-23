import { motion } from 'framer-motion';

const Logo = ({ className = "" }) => {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                className="w-12 h-12 bg-gradient-to-br from-neon-red to-red-900 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(255,7,58,0.4)] border border-white/10"
            >
                <span className="text-2xl drop-shadow-md">🩸</span>
            </motion.div>
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-widest text-white leading-none">
                    BLOOD<span className="text-neon-red">LINK</span>
                </h1>
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] pt-1">Life Saving Network</span>
            </div>
        </div>
    );
};

export default Logo;
