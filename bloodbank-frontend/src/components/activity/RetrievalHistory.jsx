import { motion } from 'framer-motion';

const RetrievalHistory = ({ requests = [] }) => {
    if (requests.length === 0) {
        return (
            <div className="glass-panel p-8 text-center text-gray-500 rounded-3xl border border-white/5 italic">
                No retrieval requests found.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((req, index) => (
                <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-panel p-6 rounded-2xl border transition-all hover:bg-white/10 ${req.status === 'APPROVED' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/5'
                        }`}
                >
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <div className="text-white font-bold flex items-center gap-3">
                                <span className="px-2 py-0.5 bg-white/10 rounded text-neon-red text-xs font-bold border border-white/10">
                                    {req.bloodGroup}
                                </span>
                                <span>Request for {req.patientName || 'Patient'}</span>
                            </div>

                            <div className="text-sm text-gray-400">
                                {req.organizationId ? `Targeted: ${req.hospitalName}` : `Hospital: ${req.hospitalName}`}
                            </div>

                            {req.status === 'APPROVED' && (
                                <div className="inline-flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs">
                                    <span>🚀</span> READY FOR PICKUP
                                </div>
                            )}
                            {req.status === 'UTILIZED' && (
                                <div className="inline-flex items-center gap-2 text-gray-400 text-xs italic">
                                    <span>✔</span> Collected & Closed
                                </div>
                            )}
                        </div>

                        <div className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest ${req.status === 'UTILIZED' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                    req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                            {req.status === 'UTILIZED' ? 'HANDED OVER' : req.status}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default RetrievalHistory;
