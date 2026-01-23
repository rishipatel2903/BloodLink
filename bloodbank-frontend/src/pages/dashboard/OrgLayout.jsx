import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const OrgLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard/org', icon: '📊' },
        { name: 'Inventory', path: '/dashboard/org/inventory', icon: '🩸' },
        { name: 'Donors', path: '/dashboard/org/donors', icon: '👥' },
        { name: 'Requests', path: '/dashboard/org/requests', icon: '🚑' },
    ];

    return (
        <div className="flex h-screen bg-gradient-to-br from-dark-slate to-black overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-20">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white tracking-wider">
                        <span className="text-3xl">🏥</span>
                        <span>MED<span className="text-neon-red">CENTER</span></span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 pl-1">{user?.name}</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
                                    ? 'bg-neon-red/10 text-neon-red shadow-[0_0_15px_rgba(255,7,58,0.1)] border border-neon-red/20'
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-neon-red/5 blur-[120px] pointer-events-none rounded-full" />

                <div className="p-8 max-w-7xl mx-auto relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default OrgLayout;
