// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import OTPModal from './OTPModal';
// import { useAuth } from '../context/AuthContext';
//
// const SignupForm = ({ role, onBack, onSwitchToLogin }) => {
//     const { registerUser, registerOrg, verifyOtp } = useAuth();
//     const [step, setStep] = useState(1); // 1: Form, 2: OTP
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         password: '',
//         bloodGroup: '',
//         license: '',
//         gender: ''
//     });
//
//     // ✅ STEP 1: Register & Send OTP
//     const handleSignup = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//
//         try {
//             if (role === 'USER') {
//                 await registerUser({
//                     name: formData.name,
//                     email: formData.email,
//                     password: formData.password,
//                     bloodGroup: formData.bloodGroup,
//                     gender: formData.gender
//                 });
//             } else {
//                 await registerOrg({
//                     name: formData.name,
//                     email: formData.email,
//                     password: formData.password,
//                     licenseNumber: formData.license,
//                     address: "Default Address"
//                 });
//             }
//
//             alert("✅ OTP sent to your email!");
//             setStep(2); // Show OTP modal
//
//         } catch (error) {
//             console.error(error);
//             alert("❌ Registration failed: " + error.message);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // ✅ STEP 2: Verify OTP
//     const handleVerify = async (code) => {
//         setLoading(true);
//         try {
//             await verifyOtp(formData.email, code);
//             alert("🎉 Email verified successfully! Now login.");
//             setStep(1);
//             onSwitchToLogin();
//         } catch (error) {
//             console.error(error);
//             alert("❌ Invalid OTP: " + error.message);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     return (
//         <div className="w-full max-w-md">
//             <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
//                 ← Back to Portal
//             </button>
//
//             <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className="glass-panel p-8 rounded-2xl"
//             >
//                 <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
//                 <p className="text-gray-400 mb-8">Join as {role === 'USER' ? 'a Donor' : 'an Organization'}</p>
//
//                 <form onSubmit={handleSignup} className="space-y-5">
//                     <InputGroup label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
//                     <InputGroup label="Email" type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
//
//                     {role === 'USER' ? (
//                         <div className="grid grid-cols-2 gap-4">
//                             <SelectGroup
//                                 label="Blood Group"
//                                 options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
//                                 value={formData.bloodGroup}
//                                 onChange={(v) => setFormData({ ...formData, bloodGroup: v })}
//                             />
//                             <SelectGroup
//                                 label="Gender"
//                                 options={['Male', 'Female', 'Other']}
//                                 value={formData.gender}
//                                 onChange={(v) => setFormData({ ...formData, gender: v })}
//                             />
//                         </div>
//                     ) : (
//                         <InputGroup
//                             label="License Number"
//                             placeholder="LIC-XXXX-XXXX"
//                             value={formData.license}
//                             onChange={(v) => setFormData({ ...formData, license: v })}
//                         />
//                     )}
//
//                     <InputGroup label="Password" type="password" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} />
//
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full py-3 bg-neon-red hover:bg-red-600 text-white font-bold rounded-xl transition-all flex justify-center items-center"
//                     >
//                         {loading ? "Sending OTP..." : "Get Started"}
//                     </button>
//                 </form>
//
//                 <p className="mt-8 text-center text-gray-400 text-sm">
//                     Already have an account?{' '}
//                     <button onClick={onSwitchToLogin} className="text-neon-red hover:underline font-medium">
//                         Sign in
//                     </button>
//                 </p>
//             </motion.div>
//
//             <OTPModal
//                 isOpen={step === 2}
//                 onClose={() => setStep(1)}
//                 onVerify={handleVerify}
//                 email={formData.email}
//             />
//         </div>
//     );
// };
//
// const InputGroup = ({ label, type = 'text', placeholder, value, onChange }) => (
//     <div className="relative">
//         <input
//             type={type}
//             required
//             className="peer w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
//             placeholder={placeholder || label}
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//         />
//         <label className="absolute left-4 top-3 text-gray-400 text-sm bg-[#161c2d] px-1">
//             {label}
//         </label>
//     </div>
// );
//
// const SelectGroup = ({ label, options, value, onChange }) => (
//     <div className="relative">
//         <select
//             required
//             className="peer w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white"
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//         >
//             <option value="" disabled></option>
//             {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//         </select>
//         <label className="absolute left-4 top-3 text-gray-400 text-sm bg-[#161c2d] px-1">
//             {label}
//         </label>
//     </div>
// );
//
// export default SignupForm;




import { useState } from 'react';
import { motion } from 'framer-motion';
import OTPModal from './OTPModal';
import { useAuth } from '../context/AuthContext';

const SignupForm = ({ role, onBack, onSwitchToLogin }) => {
    const { registerUser, registerOrg, verifyOtp } = useAuth();
    const [step, setStep] = useState(1); // 1: Form, 2: OTP
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        bloodGroup: '',
        license: '',
        gender: '',
        phoneNumber: ''
    });

    // ✅ STEP 1: Register & Send OTP
    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (role === 'USER') {
                await registerUser({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    bloodGroup: formData.bloodGroup,
                    gender: formData.gender,
                    phoneNumber: formData.phoneNumber
                });
            } else {
                await registerOrg({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    licenseNumber: formData.license,
                    address: "Default Address",
                    phoneNumber: formData.phoneNumber
                });
            }

            alert("✅ OTP sent to your email!");
            setStep(2); // ✅ show OTP modal AFTER backend call

        } catch (error) {
            console.error(error);
            alert("❌ Registration failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ STEP 2: Verify OTP
    const handleVerify = async (code) => {
        setLoading(true);

        try {
            await verifyOtp(formData.email, code); // ✅ verify OTP with backend

            alert("🎉 Email verified successfully! Now login.");
            setStep(1);
            onSwitchToLogin();

        } catch (error) {
            console.error(error);
            alert("❌ Invalid OTP: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md relative z-20">
            <button
                onClick={onBack}
                className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-all hover:-translate-x-1 group"
            >
                <span className="p-1 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">←</span>
                <span className="text-sm font-medium tracking-wide">Back to Portal</span>
            </button>

            <motion.div
                initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-red/5 blur-[60px] rounded-full pointer-events-none" />

                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
                <p className="text-gray-400 mb-8 font-light">
                    Join as <span className="text-neon-red font-medium">{role === 'USER' ? 'a Donor' : 'an Organization'}</span>
                </p>

                <form onSubmit={handleSignup} className="space-y-6">
                    <InputGroup label="Full Name" value={formData.name}
                        onChange={(v) => setFormData({ ...formData, name: v })} />

                    <InputGroup label="Email" type="email" value={formData.email}
                        onChange={(v) => setFormData({ ...formData, email: v })} />

                    <InputGroup label="Phone Number" placeholder="+1234567890" value={formData.phoneNumber}
                        onChange={(v) => setFormData({ ...formData, phoneNumber: v })} />

                    {role === 'USER' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <SelectGroup
                                label="Blood Group"
                                options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                                value={formData.bloodGroup}
                                onChange={(v) => setFormData({ ...formData, bloodGroup: v })}
                            />
                            <SelectGroup
                                label="Gender"
                                options={['Male', 'Female', 'Other']}
                                value={formData.gender}
                                onChange={(v) => setFormData({ ...formData, gender: v })}
                            />
                        </div>
                    ) : (
                        <InputGroup
                            label="License Number"
                            placeholder="LIC-XXXX-XXXX"
                            value={formData.license}
                            onChange={(v) => setFormData({ ...formData, license: v })}
                        />
                    )}

                    <InputGroup label="Password" type="password" value={formData.password}
                        onChange={(v) => setFormData({ ...formData, password: v })} />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-neon-red to-red-700 hover:to-red-600 text-white font-bold rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(255,7,58,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(255,7,58,0.6)] hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center mt-4 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative">
                            {loading ? "Sending OTP..." : "Get Started"}
                        </span>
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="text-neon-red hover:text-red-400 hover:underline font-semibold ml-1 transition-colors">
                        Sign in
                    </button>
                </p>
            </motion.div>

            <OTPModal
                isOpen={step === 2}
                onClose={() => setStep(1)}
                onVerify={handleVerify}
                email={formData.email}
            />
        </div>
    );
};

const InputGroup = ({ label, type = 'text', placeholder, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400 ml-1">{label}</label>
        <input
            type={type}
            required
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:border-neon-red/50 focus:ring-4 focus:ring-neon-red/10 focus:outline-none transition-all"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const SelectGroup = ({ label, options, value, onChange }) => (
    <div className="space-y-2 relative">
        <label className="text-sm font-medium text-gray-400 ml-1">{label}</label>
        <div className="relative">
            <select
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white appearance-none focus:border-neon-red/50 focus:ring-4 focus:ring-neon-red/10 focus:outline-none transition-all"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="" disabled className="bg-gray-900">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
            </select>
            {/* Custom Arrow */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">
                ▼
            </div>
        </div>
    </div>
);

export default SignupForm;
