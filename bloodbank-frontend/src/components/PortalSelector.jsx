import { motion } from 'framer-motion';

const PortalSelector = ({ onSelect }) => {
    return (
        <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center p-8 w-full max-w-5xl">
            <PortalCard
                title="Individual"
                subtitle="For Donors & Recipients"
                description="Donate blood, request help during emergencies, and track your lifesaving impact."
                icon="🩸"
                onClick={() => onSelect('USER')}
                delay={0.1}
            />

            <div className="flex items-center justify-center">
                <div className="w-16 h-[2px] bg-white/10 md:w-[2px] md:h-16 relative">
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] px-3 text-gray-500 font-medium text-sm">OR</span>
                </div>
            </div>

            <PortalCard
                title="Organization"
                subtitle="For Hospitals & Blood Banks"
                description="Manage blood inventory, organize donation camps, and handle emergency requests."
                icon="🏥"
                onClick={() => onSelect('ORG')}
                delay={0.2}
            />
        </div>
    );
};

const PortalCard = ({ title, subtitle, description, icon, onClick, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6, type: "spring" }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex-1 glass-panel p-10 rounded-3xl cursor-pointer text-center overflow-hidden"
            onClick={onClick}
        >
            {/* Gradient Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col items-center h-full">
                <div className="w-24 h-24 mb-8 bg-white/5 rounded-full flex items-center justify-center text-6xl shadow-inner group-hover:shadow-[0_0_30px_rgba(255,7,58,0.3)] transition-all duration-300 ring-1 ring-white/10 group-hover:ring-neon-red/50">
                    {icon}
                </div>

                <h3 className="text-3xl font-bold mb-2 text-white group-hover:text-neon-red transition-colors">{title}</h3>
                <p className="text-neon-red font-medium text-sm uppercase tracking-wider mb-6">{subtitle}</p>
                <p className="text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">{description}</p>

                <div className="mt-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-white font-semibold border-b border-neon-red pb-1">Enter Portal &rarr;</span>
                </div>
            </div>
        </motion.div>
    );
};

export default PortalSelector;
