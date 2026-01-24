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

    // Derived Stats (Total Units, not Batch counts)
    const totalUnits = batches.filter(b => {
        const isExpired = new Date(b.expiryDate) < new Date();
        return b.status === 'AVAILABLE' && !isExpired;
    }).reduce((sum, b) => sum + (b.quantity || 0), 0);

    // Group by Blood Group to find lowest stock (Excluding Expired)
    const stockByGroup = batches.reduce((acc, batch) => {
        const isExpired = new Date(batch.expiryDate) < new Date();
        if (batch.status === 'AVAILABLE' && !isExpired) {
            acc[batch.bloodGroup] = (acc[batch.bloodGroup] || 0) + (batch.quantity || 0);
        }
        return acc;
    }, {});

    // Find group with minimum stock (ignoring 0 explicitly if needed, but here just min of present)
    let lowestStockGroup = "N/A";
    let lowestStockCount = 0;

    if (Object.keys(stockByGroup).length > 0) {
        const sortedGroups = Object.entries(stockByGroup).sort((a, b) => a[1] - b[1]);
        lowestStockGroup = sortedGroups[0][0];
        lowestStockCount = sortedGroups[0][1];
    }

    // Logic for "Expiring Soon" (e.g., expiry date is within next 7 days and not already expired)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringSoonCount = batches.filter(b => {
        const expiry = new Date(b.expiryDate);
        const now = new Date();
        return b.status === 'AVAILABLE' && expiry > now && expiry <= sevenDaysFromNow;
    }).length;

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
                    message={lowestStockGroup !== "N/A" ? `Low Stock: ${lowestStockGroup}` : "No Stock Data"}
                    count={`${lowestStockCount} Units`}
                />
                <StockAlertCard
                    type="WARNING"
                    message="Expiring Soon"
                    count={`${expiringSoonCount} Batches`}
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
