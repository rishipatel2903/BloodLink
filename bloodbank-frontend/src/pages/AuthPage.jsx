import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PortalSelector from '../components/PortalSelector';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const AuthPage = () => {
    const [view, setView] = useState('portal'); // portal, login, signup
    const [role, setRole] = useState(null); // USER, ORG

    const handlePortalSelect = (selectedRole) => {
        setRole(selectedRole);
        setView('login');
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
        visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.98, filter: "blur(10px)", transition: { duration: 0.4 } }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-start pt-32 p-6 relative">
            {/* Fixed Background Ambience */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-neon-red/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Header / Logo */}
            <div className="fixed top-8 left-8 z-50 flex items-center gap-4">
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

            {/* Main Content Area */}
            <div className="relative z-10 w-full flex flex-col items-center max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {view === 'portal' && (
                        <motion.div
                            key="portal"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full flex flex-col items-center"
                        >
                            <div className="text-center mb-16 space-y-4">
                                <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-400 tracking-tight">
                                    Welcome to BloodLink
                                </h1>
                                <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                                    A centralized platform bridging the gap between donors, recipients, and blood banks.
                                </p>
                            </div>
                            <PortalSelector onSelect={handlePortalSelect} />
                        </motion.div>
                    )}

                    {view === 'login' && (
                        <motion.div
                            key="login"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <LoginForm
                                role={role}
                                onBack={() => setView('portal')}
                                onSwitchToSignup={() => setView('signup')}
                            />
                        </motion.div>
                    )}

                    {view === 'signup' && (
                        <motion.div
                            key="signup"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <SignupForm
                                role={role}
                                onBack={() => setView('portal')}
                                onSwitchToLogin={() => setView('login')}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AuthPage;
