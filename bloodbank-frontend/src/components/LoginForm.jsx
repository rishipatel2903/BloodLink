import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const LoginForm = ({ role, onBack, onSwitchToSignup }) => {
    const { login, googleLogin } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(role, formData);
        } catch (error) {
            console.error('Login failed', error);
            alert('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const googleLoginTrigger = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                await googleLogin(tokenResponse.access_token);
            } catch (error) {
                console.error('Google Login Error:', error);
                alert('Google Login Failed');
            } finally {
                setLoading(false);
            }
        },
        onError: () => alert('Google Login Failed'),
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md relative z-20"
        >
            <button
                onClick={onBack}
                className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-all hover:-translate-x-1 group"
            >
                <span className="p-1 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">←</span>
                <span className="text-sm font-medium tracking-wide">Back to Portal</span>
            </button>

            <div className="glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-red/10 blur-[50px] rounded-full pointer-events-none" />

                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
                <p className="text-gray-400 mb-10 capitalize font-light text-lg">
                    Login to your <span className="text-neon-red font-medium">{role.toLowerCase().replace('role_', '')}</span> account
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:border-neon-red/50 focus:ring-4 focus:ring-neon-red/10 focus:outline-none transition-all"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:border-neon-red/50 focus:ring-4 focus:ring-neon-red/10 focus:outline-none transition-all"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-neon-red to-red-700 hover:to-red-600 text-white font-bold rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(255,7,58,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(255,7,58,0.6)] hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative">
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                            ) : (
                                'Sign In'
                            )}
                        </span>
                    </button>
                </form>

                {role === 'USER' && (
                    <>
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-[#151b28] text-gray-500 text-sm font-medium rounded-full">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => googleLoginTrigger()}
                            className="w-full py-3.5 bg-white hover:bg-gray-100 text-black font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            Sign in with Google
                        </button>
                    </>
                )}

                <p className="mt-8 text-center text-gray-500 text-sm">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToSignup} className="text-neon-red hover:text-red-400 hover:underline font-semibold ml-1 transition-colors">
                        Create one
                    </button>
                </p>
            </div>
        </motion.div>
    );
};

export default LoginForm;
