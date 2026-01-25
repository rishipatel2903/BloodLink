import { createContext, useContext, useState, useCallback } from 'react';
import { useRealtime } from '../hooks/useRealtime';
import { AnimatePresence, motion } from 'framer-motion';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    // REAL-TIME: Global Notification Listener
    useRealtime((event) => {
        let message = '';
        let type = 'info';

        switch (event.type) {
            case 'NEW_BLOOD_REQUEST':
                message = '🚨 New Urgent Blood Request Received!';
                type = 'urgent';
                break;
            case 'DONATION_STATUS_UPDATED':
                message = `📅 Your donation status has been updated to ${event.payload.status}`;
                type = 'success';
                break;
            case 'DONATION_COMPLETED':
                message = '🎉 Donation Completed! Thank you for saving lives.';
                type = 'success';
                break;
            case 'REQUEST_STATUS_UPDATED':
                message = `🚑 Your blood request is now ${event.payload.status}`;
                type = 'success';
                break;
            case 'LOW_STOCK_ALERT':
                message = '⚠️ Critical Stock Alert: Inventory is running low.';
                type = 'warning';
                break;
            case 'CERTIFICATE_GENERATED':
                message = '📄 Your donation certificate is now available!';
                type = 'success';
                break;
        }

        if (message) {
            addNotification(message, type);
        }
    });

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
                <AnimatePresence>
                    {notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            className={`pointer-events-auto min-w-[300px] p-5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 ${n.type === 'urgent' ? 'bg-red-500/20 border-red-500/50 text-white' :
                                n.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-white' :
                                    n.type === 'warning' ? 'bg-orange-500/20 border-orange-500/50 text-white' :
                                        'bg-blue-500/20 border-blue-500/50 text-white'
                                }`}
                        >
                            <div className="flex-1 font-medium">{n.message}</div>
                            <button
                                onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                                className="text-white/50 hover:text-white"
                            >
                                ✕
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
