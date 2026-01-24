import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const FindBloodPage = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [targetOrg, setTargetOrg] = useState(null);
    const [requestMode, setRequestMode] = useState('NORMAL'); // 'NORMAL' or 'URGENT'
    const [myRequests, setMyRequests] = useState([]);
    const [requestData, setRequestData] = useState({
        patientName: '',
        units: 1,
        hospitalName: '',
        contactNumber: '',
        urgency: 'NORMAL'
    });

    const fetchMyRequests = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/requests/user/${user.id}`);
            const data = await response.json();
            setMyRequests(data);
        } catch (error) {
            console.error("Failed to fetch my requests", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyRequests();
            const interval = setInterval(fetchMyRequests, 5000); // Live tracking
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/inventory/search?bloodGroup=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReserve = async (orgId, orgName) => {
        setTargetOrg({ id: orgId, name: orgName });
        setRequestData({ ...requestData, urgency: 'NORMAL' });
        setShowRequestForm(true);
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...requestData,
                userId: user.id,
                bloodGroup: query || 'A+',
                organizationId: targetOrg?.id,
                urgency: requestMode === 'URGENT' ? 'CRITICAL' : 'NORMAL',
                status: 'PENDING'
            };
            const response = await fetch('http://localhost:8080/api/requests/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                alert(targetOrg ? `Request sent to ${targetOrg.name}!` : "Urgent Request Broadcasted!");
                setShowRequestForm(false);
                setTargetOrg(null);
                fetchMyRequests(); // Refresh tracker
            }
        } catch (error) {
            console.error("Request failed", error);
        }
    };

    // Helper to group by Org
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
        <div className="space-y-12 pb-20">
            <section className="space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-white mb-2">Find Blood Stock</h1>
                    <p className="text-gray-400">Search real-time inventory at registered blood banks.</p>
                </header>

                {/* Search Bar and Tabs */}
                <div className="space-y-6 max-w-2xl">
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setRequestMode('NORMAL'); setResults([]); }}
                            className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${requestMode === 'NORMAL' ? 'bg-neon-red text-white border-neon-red shadow-[0_0_15px_rgba(255,7,58,0.2)]' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                        >
                            <span className="mr-2">🏦</span> Find in Banks (Normal)
                        </button>
                        <button
                            onClick={() => { setRequestMode('URGENT'); setResults([]); }}
                            className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${requestMode === 'URGENT' ? 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                        >
                            <span className="mr-2">📢</span> Urgent Broadcast
                        </button>
                    </div>

                    {requestMode === 'NORMAL' ? (
                        <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
                            <div className="relative">
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-xl text-white focus:outline-none focus:border-neon-red focus:ring-1 focus:ring-neon-red/50 transition-all pl-16 appearance-none shadow-2xl cursor-pointer"
                                    value={query}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setQuery(val);
                                        if (val) {
                                            // Trigger search immediately
                                            setLoading(true);
                                            fetch(`http://localhost:8080/api/inventory/search?bloodGroup=${encodeURIComponent(val)}`)
                                                .then(res => res.json())
                                                .then(data => setResults(data))
                                                .catch(err => console.error("Search failed", err))
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
                                <div className="absolute right-20 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    ▼
                                </div>
                                <button
                                    type="submit"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-neon-red text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-red-500">⚠</span> Create Urgent Broadcast
                            </h3>
                            <p className="text-gray-400 text-sm">This will notify all nearby blood donors and registered organizations immediately. Use this if you can't find stock in banks or for extreme emergencies.</p>
                            <button
                                onClick={() => { setTargetOrg(null); setShowRequestForm(true); }}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl w-full shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
                            >
                                Open Broadcast Form
                            </button>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 italic">Searching database...</motion.div>
                    ) : (requestMode === 'NORMAL' && Object.keys(groupedResults).length > 0) ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {Object.values(groupedResults).map(org => (
                                <div key={org.id} className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center group hover:border-neon-red/30 transition-all shadow-xl gap-4">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-16 h-16 bg-neon-red/10 rounded-2xl flex items-center justify-center text-neon-red text-3xl font-bold border border-neon-red/20">
                                            {query}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-2xl">{org.name}</h3>
                                            <div className="text-emerald-400 font-bold text-lg mt-1">
                                                {org.totalUnits} Units Available
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleReserve(org.id, org.name)}
                                        className="w-full md:w-auto px-10 py-4 bg-neon-red text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(255,7,58,0.3)] hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Request Blood
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        requestMode === 'NORMAL' && query && !loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center space-y-4 shadow-2xl"
                            >
                                <div className="text-5xl mb-4 text-gray-600">🏛️</div>
                                <h3 className="text-xl font-bold text-white">No {query} stock found in banks.</h3>
                                <p className="text-gray-400 max-w-sm mx-auto">None of the registered organizations have this blood group available. Switch to **Urgent Mode** to broadcast your request.</p>
                                <button
                                    onClick={() => setRequestMode('URGENT')}
                                    className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10"
                                >
                                    Switch to Urgent Mode
                                </button>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </section>

            {/* My Requests Tracker */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white">My Retrieval Requests</h2>
                <div className="space-y-4">
                    {myRequests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 glass-panel rounded-3xl border border-white/5">
                            You haven't requested any blood for retrieval yet.
                        </div>
                    ) : (
                        myRequests.map(req => (
                            <div key={req.id} className={`glass-panel p-6 rounded-2xl border transition-all ${req.status === 'APPROVED' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/5'
                                }`}>
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <div className="text-white font-bold flex items-center gap-3">
                                            <span className="px-2 py-0.5 bg-white/10 rounded text-neon-red text-xs">{req.bloodGroup}</span>
                                            <span>Request for {req.patientName}</span>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {req.organizationId ? `Targeted: ${req.hospitalName}` : `Hospital: ${req.hospitalName}`}
                                        </div>
                                        {req.status === 'APPROVED' && (
                                            <motion.div
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="mt-2 text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-sm flex items-center gap-2"
                                            >
                                                <span>🚀</span> READY FOR PICKUP! Visit the bank to collect.
                                            </motion.div>
                                        )}
                                        {req.status === 'UTILIZED' && (
                                            <div className="mt-2 text-gray-400 text-sm italic">
                                                ✔ Blood units collected and inventory updated.
                                            </div>
                                        )}
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest ${req.status === 'UTILIZED' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                        req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                            req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                                'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                        {req.status === 'UTILIZED' ? 'HANDED OVER' : req.status}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Request Form Modal */}
            <AnimatePresence>
                {showRequestForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-panel w-full max-w-xl p-8 rounded-3xl relative"
                        >
                            <button onClick={() => { setShowRequestForm(false); setTargetOrg(null); }} className="absolute right-6 top-6 text-gray-400 hover:text-white text-xl">✕</button>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {targetOrg ? `Request from ${targetOrg.name}` : 'General Urgent Request'}
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">Enter patient details to initiate the retrieval workflow.</p>

                            <form onSubmit={handleCreateRequest} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase block mb-1 font-bold">Patient Name</label>
                                        <input required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-red outline-none" placeholder="Enter Patient Name"
                                            value={requestData.patientName} onChange={e => setRequestData({ ...requestData, patientName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase block mb-1 font-bold">Units Required</label>
                                        <input type="number" min="1" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-red outline-none"
                                            value={requestData.units} onChange={e => setRequestData({ ...requestData, units: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase block mb-1 font-bold">Hospital Name</label>
                                        <input required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-red outline-none" placeholder="e.g. City General"
                                            value={requestData.hospitalName} onChange={e => setRequestData({ ...requestData, hospitalName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase block mb-1 font-bold">Contact No.</label>
                                        <input required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-red outline-none" placeholder="+91 XXXX..."
                                            value={requestData.contactNumber} onChange={e => setRequestData({ ...requestData, contactNumber: e.target.value })} />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-neon-red hover:bg-red-600 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(255,7,58,0.3)] transition-all mt-4">Send Request</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FindBloodPage;
