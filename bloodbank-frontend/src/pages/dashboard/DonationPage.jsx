import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const DonationPage = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myRequests, setMyRequests] = useState([]);
    const [formData, setFormData] = useState({
        organizationId: '',
        appointmentDate: '',
        healthCheck: {
            feelingWell: 'yes',
            recentTravel: 'no',
            medication: 'no',
            surgery: 'no'
        }
    });

    const fetchMyRequests = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/donations/user/${user.id}`);
            const data = await response.json();
            setMyRequests(data);
        } catch (err) {
            console.error("Failed to fetch my requests", err);
        }
    };

    useEffect(() => {
        // Fetch registered and verified Organizations
        const fetchOrgs = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/auth/organizations');
                const data = await response.json();
                setOrgs(data);
            } catch (err) {
                console.error("Failed to fetch organizations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
        if (user) fetchMyRequests();
    }, [user]);

    const handleBooking = async () => {
        try {
            const payload = {
                userId: user.id,
                userName: user.name,
                organizationId: formData.organizationId,
                bloodGroup: user.bloodGroup || 'A+',
                appointmentDate: formData.appointmentDate,
                healthCheckParams: formData.healthCheck
            };

            const response = await fetch('http://localhost:8080/api/donations/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Appointment Booked Successfully!");
                fetchMyRequests(); // Refresh list
                setStep(3);
            }
        } catch (error) {
            console.error("Booking failed", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-white mb-2">Be a Hero, Save a Life</h1>
                <p className="text-gray-400">Schedule your blood donation appointment in minutes.</p>
            </header>

            <div className="grid grid-cols-1 gap-12">
                {/* Booking Section */}
                <section>
                    {/* Stepper */}
                    <div className="flex justify-between max-w-sm mx-auto mb-12">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-neon-red text-white' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                                    {s}
                                </div>
                                {s < 3 && <div className={`w-16 h-1 transition-all ${step > s ? 'bg-neon-red' : 'bg-white/5'}`} />}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-panel p-8 rounded-3xl border border-white/10 bg-white/5 space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">Digital Health Questionnaire</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Are you feeling well today?', key: 'feelingWell' },
                                        { label: 'Have you traveled abroad in the last 28 days?', key: 'recentTravel' },
                                        { label: 'Are you currently taking any prescription medication?', key: 'medication' },
                                        { label: 'Have you had surgery in the last 6 months?', key: 'surgery' },
                                    ].map(item => (
                                        <div key={item.key} className="flex justify-between items-center p-4 rounded-2xl bg-black/30">
                                            <span className="text-gray-300">{item.label}</span>
                                            <div className="flex gap-2">
                                                {['yes', 'no'].map(val => (
                                                    <button
                                                        key={val}
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            healthCheck: { ...formData.healthCheck, [item.key]: val }
                                                        })}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${formData.healthCheck[item.key] === val ? 'bg-neon-red text-white' : 'bg-white/10 text-gray-500'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-4 bg-neon-red hover:bg-red-600 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(255,7,58,0.3)] transition-all mt-8"
                                >
                                    Next Step
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-panel p-8 rounded-3xl border border-white/10 bg-white/5 space-y-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">Select Bank & Date</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Nearest Blood Bank / Hospital</label>
                                        <select
                                            className="w-full bg-black/30 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-red"
                                            value={formData.organizationId}
                                            onChange={e => setFormData({ ...formData, organizationId: e.target.value })}
                                        >
                                            <option value="" className="bg-dark-slate italic">Select an Organization</option>
                                            {orgs.map(org => (
                                                <option key={org.id} value={org.id} className="bg-dark-slate">{org.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm block mb-2">Preferred Appointment Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/30 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-red"
                                            value={formData.appointmentDate}
                                            onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleBooking}
                                        className="flex-[2] py-4 bg-neon-red hover:bg-red-600 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(255,7,58,0.3)] transition-all"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-panel p-12 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    ✔
                                </div>
                                <h2 className="text-3xl font-bold text-white">Application Sent!</h2>
                                <p className="text-emerald-400 font-medium tracking-wide">Your request for {formData.appointmentDate} is now **Pending** approval from the organization.</p>
                                <p className="text-gray-400 text-sm max-w-sm mx-auto">You can track the status below. Once approved, you'll see "Confirmed".</p>
                                <button
                                    onClick={() => setStep(1)}
                                    className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                                >
                                    Book Another
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* My Requests Tracker */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">My Donation Status</h2>
                    <div className="space-y-4">
                        {myRequests.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 glass-panel rounded-3xl border border-white/5">
                                You haven't made any donation requests yet.
                            </div>
                        ) : (
                            myRequests.map(req => (
                                <div key={req.id} className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5 flex justify-between items-center group hover:border-white/10 transition-all">
                                    <div className="space-y-1">
                                        <div className="text-white font-bold flex items-center gap-3">
                                            <span>{orgs.find(o => o.id === req.organizationId)?.name || 'Processing...'}</span>
                                            <span className="text-xs font-mono text-gray-500">#{req.id.slice(-6)}</span>
                                        </div>
                                        <div className="text-sm text-gray-400 flex items-center gap-4">
                                            <span>📅 {req.appointmentDate}</span>
                                            <span>🩸 {req.bloodGroup}</span>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest ${req.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                req.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                        {req.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DonationPage;
