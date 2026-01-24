import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard/user', icon: '🏠' },
        { name: 'Donate Blood', path: '/dashboard/user/donate', icon: '🩸' },
        { name: 'Find Blood', path: '/dashboard/user/find', icon: '🔍' },
        { name: 'My Activity', path: '/dashboard/user/history', icon: '📜' },
    ];

    return (
        <div className="flex h-screen bg-gradient-to-br from-dark-slate to-black overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-20">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white tracking-wider">
                        <span className="text-3xl text-neon-red">❤️</span>
                        <span>BLOOD<span className="text-neon-red">LINK</span></span>
                    </div>
                    <p className="text-xs text-emerald-400 mt-2 pl-1 font-mono uppercase tracking-[0.2em]">Donor Profile</p>
                </div>

                <div className="px-8 mb-8">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Welcome back</div>
                        <div className="text-white font-bold truncate">{user?.name}</div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
                                    ? 'bg-neon-red text-white shadow-[0_0_20px_rgba(255,7,58,0.3)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-red/5 blur-[150px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

                <div className="p-8 max-w-7xl mx-auto relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default UserLayout;
