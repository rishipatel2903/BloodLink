import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryApi } from '../../api/inventoryApi';
import { requestApi } from '../../api/requestApi';
import { useRealtime } from '../../hooks/useRealtime';

const HospitalRequest = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [targetOrg, setTargetOrg] = useState(null);
    const [requestMode, setRequestMode] = useState('NORMAL'); // 'NORMAL' or 'URGENT'
    const [requestData, setRequestData] = useState({
        units: 1,
        contactNumber: '',
    });

    const triggerSearch = useCallback(async (searchQuery) => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            const data = await inventoryApi.searchStock(searchQuery);
            setResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        triggerSearch(query);
    };

    // REAL-TIME: Refresh search results if inventory changes
    useRealtime((event) => {
        if (event.type === 'INVENTORY_UPDATED' && query) {
            console.log("Real-time inventory update detected, refreshing search...");
            triggerSearch(query);
        }
    });

    const handleReserve = async (orgId, orgName) => {
        setTargetOrg({ id: orgId, name: orgName });
        setShowRequestForm(true);
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                hospitalId: user.id,
                hospitalName: user.name,
                hospitalAddress: user.address || "N/A",
                bloodGroup: query || 'A+',
                units: requestData.units,
                contactNumber: requestData.contactNumber || user.phoneNumber,
                organizationId: targetOrg?.id,
                urgency: requestMode === 'URGENT' ? 'CRITICAL' : 'NORMAL',
                status: 'PENDING'
            };

            await requestApi.createRequest(payload);

            alert(targetOrg ? `Request sent to ${targetOrg.name}!` : "Urgent Request Broadcasted!");
            setShowRequestForm(false);
            setTargetOrg(null);
        } catch (error) {
            console.error("Request failed", error);
            alert("Failed to submit request. Please try again.");
        }
    };

    const groupedResults = results.reduce((acc, batch) => {
        const orgId = batch.organizationId;
        if (!acc[orgId]) {
            acc[orgId] = {
                id: orgId,
                name: batch.organizationName || 'Unnamed Org',
                batches: [],
                totalUnits: 0
            };
        }
        acc[orgId].batches.push(batch);
        acc[orgId].totalUnits += batch.quantity;
        return acc;
    }, {});

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center space-y-12 pb-20 w-full px-4">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Request Blood Stock</h1>
                <p className="text-gray-400">Search inventory at registered blood banks or create an urgent broadcast.</p>
            </header>

            <div className="space-y-6 w-full max-w-2xl flex flex-col items-center">
                <div className="flex gap-6 w-full">
                    <button
                        onClick={() => { setRequestMode('NORMAL'); setResults([]); }}
                        className={`flex-1 py-6 rounded-3xl font-bold text-lg transition-all border ${requestMode === 'NORMAL' ? 'bg-neon-red text-white border-neon-red shadow-[0_0_30px_rgba(255,7,58,0.3)]' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                    >
                        <span className="text-2xl mr-3">🏦</span> Private Banks
                    </button>
                    <button
                        onClick={() => { setRequestMode('URGENT'); setResults([]); }}
                        className={`flex-1 py-6 rounded-3xl font-bold text-lg transition-all border ${requestMode === 'URGENT' ? 'bg-red-500 text-white border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                    >
                        <span className="text-2xl mr-3">📢</span> Urgent Broadcast
                    </button>
                </div>

                {requestMode === 'NORMAL' ? (
                    <div className="glass-panel p-12 rounded-3xl space-y-8 flex flex-col items-center text-center w-full border border-white/5 bg-white/5">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Search Private Inventory</h3>
                            <p className="text-gray-400 text-sm">Select a blood group to check real-time availability in registered private banks.</p>
                        </div>
                        <form onSubmit={handleSearch} className="relative group w-full">
                            <div className="relative">
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-xl text-white focus:outline-none focus:border-neon-red focus:ring-1 focus:ring-neon-red/50 transition-all pl-16 appearance-none shadow-2xl cursor-pointer"
                                    value={query}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setQuery(val);
                                        if (val) {
                                            setLoading(true);
                                            inventoryApi.searchStock(val)
                                                .then(data => setResults(Array.isArray(data) ? data : []))
                                                .catch(err => console.error(err))
                                                .finally(() => setLoading(false));
                                        }
                                    }}
                                >
                                    <option value="" disabled className="bg-dark-slate">Select Blood Group...</option>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                        <option key={bg} value={bg} className="bg-dark-slate">{bg}</option>
                                    ))}
                                </select>
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl">🩸</span>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-red-500/5 border border-red-500/20 p-12 rounded-3xl space-y-6 flex flex-col items-center text-center w-full">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Broadcast Urgent Need</h3>
                            <p className="text-gray-400 text-sm">Notify all organizations of a critical shortage at your facility.</p>
                        </div>
                        <button
                            onClick={() => { setTargetOrg(null); setShowRequestForm(true); }}
                            className="py-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-3xl w-full text-lg shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all"
                        >
                            Open Broadcast Form
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {loading ? (
                    <div className="text-gray-500 italic">Searching database...</div>
                ) : (requestMode === 'NORMAL' && Object.keys(groupedResults).length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                        {Object.values(groupedResults).map(org => (
                            <div key={org.id} className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 flex flex-col justify-between items-center text-center group hover:border-neon-red/30 transition-all shadow-xl gap-6">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-neon-red/10 rounded-2xl flex items-center justify-center text-neon-red text-4xl font-bold border border-neon-red/20 shadow-glow">
                                        {query}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-2xl">{org.name}</h3>
                                        <div className="text-emerald-400 font-bold text-lg mt-1">{org.totalUnits} Units Available</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleReserve(org.id, org.name)}
                                    className="w-full py-5 bg-neon-red text-white font-bold rounded-3xl text-lg shadow-[0_0_20px_rgba(255,7,58,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Request Blood
                                </button>
                            </div>
                        ))}
                    </div>
                ) : null}
            </AnimatePresence>

            <AnimatePresence>
                {showRequestForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel w-full max-w-xl p-8 rounded-3xl relative">
                            <button onClick={() => setShowRequestForm(false)} className="absolute right-6 top-6 text-gray-500">✕</button>
                            <h2 className="text-2xl font-bold text-white mb-4">Confirm Request</h2>
                            <form onSubmit={handleCreateRequest} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 block">Units Required</label>
                                    <input type="number" min="1" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white" value={requestData.units} onChange={e => setRequestData({ ...requestData, units: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block">Contact Person Phone/Extension</label>
                                    <input required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white" value={requestData.contactNumber} onChange={e => setRequestData({ ...requestData, contactNumber: e.target.value })} />
                                </div>
                                <button type="submit" className="w-full py-4 bg-neon-red text-white font-bold rounded-2xl mt-4">Submit Request</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HospitalRequest;
