import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { saveAs } from 'file-saver';

const ReportDownloadModal = ({ isOpen, onClose, userId }) => {
    const [reportType, setReportType] = useState('full'); // 'full' or 'range'
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const url = reportType === 'full'
                ? `/reports/user/${userId}/full`
                : `/reports/user/${userId}/range?from=${fromDate}&to=${toDate}`;

            const res = await api.get(url, {
                responseType: 'blob'
            });

            // Note: Since our axios interceptor returns response.data, 'res' here is the blob
            saveAs(res, `BloodLink_User_Report_${reportType === 'full' ? 'Full' : 'Range'}.pdf`);
            onClose();
        } catch (error) {
            console.error("Failed to download report", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-neon-red">📄</span> Download Report
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Report Type Selection */}
                        <div className="flex gap-4 p-1 bg-white/5 rounded-xl border border-white/5">
                            <button
                                onClick={() => setReportType('full')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'full'
                                    ? 'bg-neon-red text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Full Report
                            </button>
                            <button
                                onClick={() => setReportType('range')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${reportType === 'range'
                                    ? 'bg-neon-red text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Date Range
                            </button>
                        </div>

                        {/* Date Range Inputs */}
                        {reportType === 'range' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">From Date</label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-red/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">To Date</label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-red/50 transition-colors"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={handleDownload}
                                disabled={loading || (reportType === 'range' && (!fromDate || !toDate))}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 ${loading
                                    ? 'bg-gray-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-neon-red to-red-600 hover:shadow-[0_0_20px_rgba(255,18,18,0.4)]'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Generating...
                                    </span>
                                ) : (
                                    "Generate PDF Report"
                                )}
                            </button>
                        </div>

                        <p className="text-center text-xs text-gray-500">
                            Report will include your full medical activity history.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReportDownloadModal;
