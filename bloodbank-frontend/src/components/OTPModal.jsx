import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const OTPModal = ({ isOpen, onClose, onVerify, email }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        setOtp([...otp.map((d, i) => (i === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code.length === 6) {
            onVerify(code);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel p-8 rounded-2xl w-full max-w-md mx-4 relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>

                    <h3 className="text-2xl font-bold text-center mb-2 text-white">Verify Email</h3>
                    <p className="text-center text-gray-400 mb-8 text-sm">
                        Enter the 6-digit code sent to <span className="text-neon-red">{email}</span>
                    </p>

                    <div className="flex justify-center gap-2 mb-8">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                className="w-12 h-14 bg-black/30 border border-white/10 rounded-lg text-center text-xl font-bold text-white focus:border-neon-red focus:outline-none transition-colors"
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                        e.target.previousSibling.focus();
                                    }
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleVerify}
                        className="w-full py-3 bg-neon-red hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,7,58,0.3)] hover:shadow-[0_0_30px_rgba(255,7,58,0.5)]"
                    >
                        Verify
                    </button>

                    <div className="text-center mt-6 text-sm text-gray-500">
                        {timeLeft > 0 ? (
                            <span>Resend code in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                        ) : (
                            <button className="text-neon-red hover:underline">Resend Code</button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OTPModal;
