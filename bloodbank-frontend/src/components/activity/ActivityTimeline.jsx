import { motion } from 'framer-motion';

const ActivityTimeline = ({ events }) => {
    if (!events || events.length === 0) return null;

    // Events are expected to be sorted by date descending
    return (
        <div className="relative pl-8 border-l-2 border-white/10 space-y-8 ml-4">
            {events.map((event, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                >
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[41px] top-4 w-6 h-6 rounded-full border-4 border-[#0f1014] ${event.type === 'DONATION' ? 'bg-neon-red shadow-[0_0_10px_rgba(255,7,58,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                        }`} />

                    <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-gray-500 font-mono">{event.date}</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${event.type === 'DONATION' ? 'bg-neon-red/10 text-neon-red' : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                {event.type}
                            </span>
                        </div>
                        <h4 className="text-white font-bold text-lg mb-1">{event.title}</h4>
                        <p className="text-sm text-gray-400">{event.details}</p>
                        <div className={`mt-3 inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${event.status === 'COMPLETED' || event.status === 'UTILIZED' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10' :
                                event.status === 'PENDING' ? 'border-yellow-500/20 text-yellow-500 bg-yellow-500/10' :
                                    'border-white/10 text-gray-400 bg-white/5'
                            }`}>
                            {event.status}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ActivityTimeline;
