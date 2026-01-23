import { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch Inventory
    const fetchInventory = async () => {
        try {
            // TODO: Get actual logged-in Org ID. For now hardcoded or skipped if relying on backend user context
            // Assuming we might need to filter by the logged in user later. 
            // For now, let's just fetch all or by a test ID if needed.
            // Actually, let's assume the user context has the Org ID.
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || user.role !== 'ROLE_ORG') {
                setBatches([]);
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:8080/api/inventory/org/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setBatches(data);
            }
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    // ✅ Add Batch
    const addBatch = async (newBatch) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const batchPayload = { ...newBatch, organizationId: user.id, status: 'AVAILABLE' };

            const response = await fetch('http://localhost:8080/api/inventory/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(batchPayload),
            });

            if (response.ok) {
                const savedBatch = await response.json();
                setBatches(prev => [savedBatch, ...prev]);
            }
        } catch (error) {
            console.error("Failed to add batch", error);
        }
    };

    // ✅ Delete Batch
    const deleteBatch = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/inventory/${id}`, { method: 'DELETE' });
            setBatches(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error("Failed to delete batch", error);
        }
    };

    const updateStatus = (id, newStatus) => {
        // Placeholder for future update status API
        setBatches(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    };

    return (
        <InventoryContext.Provider value={{ batches, loading, addBatch, updateStatus, deleteBatch }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => useContext(InventoryContext);
