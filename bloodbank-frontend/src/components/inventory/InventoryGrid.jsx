import { useState } from 'react';
import ExpiryProgressBar from './ExpiryProgressBar';

const InventoryGrid = ({ batches, onDelete, onUpdateStatus }) => {
    const [filterGroup, setFilterGroup] = useState('ALL');

    const filtered = filterGroup === 'ALL'
        ? batches
        : batches.filter(b => b.bloodGroup === filterGroup);

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                {['ALL', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <button
                        key={bg}
                        onClick={() => setFilterGroup(bg)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filterGroup === bg
                                ? 'bg-neon-red text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {bg}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                                <th className="p-4 font-medium">Batch ID</th>
                                <th className="p-4 font-medium">Blood Group</th>
                                <th className="p-4 font-medium">Donor</th>
                                <th className="p-4 font-medium min-w-[200px]">Expiry Status</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-500">
                                        No batches found for this filter.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((batch) => (
                                    <tr key={batch.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-white font-mono text-sm">{batch.id}</td>
                                        <td className="p-4">
                                            <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm bg-black/30 border border-white/10 ${batch.bloodGroup.includes('+') ? 'text-neon-red' : 'text-orange-400'
                                                }`}>
                                                {batch.bloodGroup}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300 text-sm">{batch.donor}</td>
                                        <td className="p-4">
                                            <ExpiryProgressBar collectionDate={batch.collectionDate} expiryDate={batch.expiryDate} />
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider font-semibold ${batch.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    batch.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500' :
                                                        'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {batch.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => onDelete(batch.id)}
                                                className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded-lg"
                                                title="Discard Batch"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryGrid;
