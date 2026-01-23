import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AddBatchModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        bloodGroup: 'A+',
        collectionDate: new Date().toISOString().split('T')[0],
        donor: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Auto-calc expiry (e.g., 42 days for WB/RBC)
        const expiry = new Date(formData.collectionDate);
        expiry.setDate(expiry.getDate() + 42); // 42 days shelf life rule

        onAdd({
            ...formData,
            expiryDate: expiry.toISOString().split('T')[0]
        });
        onClose();
        setFormData({ bloodGroup: 'A+', collectionDate: new Date().toISOString().split('T')[0], donor: '' });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="absolute inset-0" onClick={onClose}></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="glass-panel w-full max-w-lg p-8 rounded-2xl relative z-10 mx-4"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Add New Batch</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Blood Group</label>
                                <select
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-red focus:outline-none"
                                    value={formData.bloodGroup}
                                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                        <option key={bg} value={bg} className="bg-dark-slate">{bg}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Collection Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-red focus:outline-none"
                                    value={formData.collectionDate}
                                    onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Donor Name / ID</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. John Doe (D-123)"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-red focus:outline-none"
                                value={formData.donor}
                                onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-3 bg-neon-red hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,7,58,0.3)]"
                            >
                                Create Batch
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddBatchModal;
