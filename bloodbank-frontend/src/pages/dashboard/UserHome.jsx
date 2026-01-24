import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const UserHome = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <header>
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-bold text-white mb-2"
                >
                    Welcome, {user?.name} 👋
                </motion.h1>
                <p className="text-gray-400">Track your impact and manage your blood donations.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5">
                    <div className="text-neon-red text-3xl mb-4">🩸</div>
                    <h3 className="text-white font-bold text-lg mb-2">Ready to Donate?</h3>
                    <p className="text-sm text-gray-400 mb-4">You are eligible to donate. Your last donation was over 3 months ago.</p>
                    <button className="text-neon-red text-sm font-bold hover:underline">Book Appointment →</button>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5">
                    <div className="text-blue-400 text-3xl mb-4">🔍</div>
                    <h3 className="text-white font-bold text-lg mb-2">Need Blood?</h3>
                    <p className="text-sm text-gray-400 mb-4">Search real-time inventory at hospitals near you.</p>
                    <button className="text-blue-400 text-sm font-bold hover:underline">Search Stock →</button>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/5">
                    <div className="text-emerald-400 text-3xl mb-4">⭐</div>
                    <h3 className="text-white font-bold text-lg mb-2">Your Impact</h3>
                    <p className="text-sm text-gray-400 mb-4">You have saved 3 lives so far. Thank you for your contribution!</p>
                    <button className="text-emerald-400 text-sm font-bold hover:underline">View History →</button>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 h-64 flex items-center justify-center">
                <p className="text-gray-500 italic">Advanced Analytics & Impact Timeline (Coming in Module 5)</p>
            </div>
        </div>
    );
};

export default UserHome;
