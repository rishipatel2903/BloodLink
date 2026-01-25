import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtime } from '../../hooks/useRealtime';

const DonationPage = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eligibility, setEligibility] = useState({ eligible: true, daysRemaining: 0, message: '' });
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

    const [isChecking, setIsChecking] = useState(false);
    const [denialResult, setDenialResult] = useState(null);

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // Fetch Organizations and Eligibility in parallel
            const [orgsRes, eligibilityRes] = await Promise.all([
                fetch('http://localhost:8080/api/auth/organizations').then(res => res.json()),
                fetch(`http://localhost:8080/api/donations/eligibility/${user.id}`).then(res => res.json())
            ]);

            setOrgs(orgsRes);
            setEligibility(eligibilityRes);
        } catch (err) {
            console.error("Failed to fetch donation page data", err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // REAL-TIME: Refresh eligibility if a donation is completed in background/other tab
    useRealtime((event) => {
        if (event.type === 'DONATION_COMPLETED') {
            fetchData();
        }
    });

    const handleEligibilityCheck = async () => {
        setIsChecking(true);
        setDenialResult(null);
        try {
            const payload = {
                userId: user.id,
                feelingWell: formData.healthCheck.feelingWell === 'yes',
                traveledRecently: formData.healthCheck.recentTravel === 'yes',
                takingMedication: formData.healthCheck.medication === 'yes',
                recentSurgery: formData.healthCheck.surgery === 'yes'
            };

            const response = await fetch('http://localhost:8080/api/donor/eligibility-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.eligible) {
                setStep(2);
            } else {
                setDenialResult(result);
            }
        } catch (error) {
            console.error("Eligibility check failed", error);
            alert("Unable to verify eligibility. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };

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
                setStep(3);
            } else {
                const errorData = await response.text();
                alert(errorData || "Booking failed. Please try again.");
            }
        } catch (error) {
            console.error("Booking failed", error);
            alert("Connection error. Please check your internet.");
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
                                        { label: 'Are you feeling well today?', key: 'feelingWell', tooltip: 'Donors must be in good health to ensure a safe donation process.' },
                                        { label: 'Have you traveled abroad in the last 28 days?', key: 'recentTravel', tooltip: 'Travel to specific regions can increase risk of malaria or other latent viruses.' },
                                        { label: 'Are you currently taking any prescription medication?', key: 'medication', tooltip: 'Some medications (like blood thinners) can affect the recipient or donor.' },
                                        { label: 'Have you had surgery in the last 6 months?', key: 'surgery', tooltip: 'Surgery recovery uses significant body resources needed for blood replenishment.' },
                                    ].map(item => {
                                        const isDisqualified = (item.key === 'feelingWell' && formData.healthCheck[item.key] === 'no') ||
                                            (item.key !== 'feelingWell' && formData.healthCheck[item.key] === 'yes');

                                        return (
                                            <div key={item.key} className={`flex justify-between items-center p-4 rounded-2xl bg-black/30 transition-all border ${isDisqualified ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-transparent'}`}>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-300 font-medium">{item.label}</span>
                                                    <span className="text-[10px] text-gray-500 mt-1 italic">{item.tooltip}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {['yes', 'no'].map(val => (
                                                        <button
                                                            key={val}
                                                            onClick={() => {
                                                                setFormData({
                                                                    ...formData,
                                                                    healthCheck: { ...formData.healthCheck, [item.key]: val }
                                                                });
                                                                setDenialResult(null); // Clear previous rejection on change
                                                            }}
                                                            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all ${formData.healthCheck[item.key] === val ? 'bg-neon-red text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                                        >
                                                            {val}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {denialResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-start gap-4 mb-6 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                                        <span className="text-3xl animate-pulse">🚫</span>
                                        <div className="space-y-1">
                                            <p className="text-red-400 font-bold tracking-tight">Eligibility Restriction</p>
                                            <p className="text-sm text-gray-300 leading-relaxed">{denialResult.message}</p>
                                            {denialResult.nextEligibleDate && (
                                                <div className="mt-4 pt-4 border-t border-red-500/10">
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Next Eligible Date</p>
                                                    <p className="text-white font-bold">{new Date(denialResult.nextEligibleDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                <button
                                    onClick={handleEligibilityCheck}
                                    disabled={isChecking}
                                    className={`w-full py-5 font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(255,7,58,0.3)] transition-all mt-8 uppercase tracking-widest flex items-center justify-center gap-3 ${isChecking ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-neon-red hover:bg-red-600 text-white hover:scale-[1.02]'}`}
                                >
                                    {isChecking ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Verifying Medical Records...
                                        </>
                                    ) : (
                                        'Validate & Continue'
                                    )}
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

                {/* History Moved to MyActivity */}
            </div>
        </div>
    );
};

export default DonationPage;
