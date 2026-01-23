import { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import InventoryGrid from '../../components/inventory/InventoryGrid';
import AddBatchModal from '../../components/inventory/AddBatchModal';
import StockAlertCard from '../../components/inventory/StockAlertCard';
import { motion } from 'framer-motion';

const InventoryPage = () => {
    const { batches, addBatch, deleteBatch, loading } = useInventory();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) return <div className="text-center p-8 text-gray-500">Loading Inventory...</div>;

    // Derived Stats
    const totalUnits = batches.length;
    const criticalCount = batches.filter(b => b.status === 'CRITICAL' || b.expiryDate < new Date().toISOString()).length; // Rough logic
    const expiredCount = batches.filter(b => b.status === 'EXPIRED').length;

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Blood Inventory</h1>
                    <p className="text-gray-400">Manage stock, track expiry, and handle batches.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-neon-red hover:bg-red-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,7,58,0.3)] transition-all flex items-center gap-2"
                >
                    <span>+</span> Add Batch
                </button>
            </div>

            {/* Alert Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StockAlertCard
                    type="CRITICAL"
                    message="Low Stock: O-"
                    count="2 Units"
                />
                <StockAlertCard
                    type="WARNING"
                    message="Expiring Soon"
                    count={`${criticalCount} Batches`}
                />
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-gray-400 tracking-wider mb-2">TOTAL INCIDENT</div>
                        <h3 className="text-xl font-bold text-white">Healthy Stock</h3>
                    </div>
                    <div className="text-4xl font-bold text-emerald-500">{totalUnits}</div>
                </div>
            </div>

            {/* Main Grid */}
            <InventoryGrid batches={batches} onDelete={deleteBatch} />

            {/* Modals */}
            <AddBatchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addBatch}
            />
        </div>
    );
};

export default InventoryPage;
