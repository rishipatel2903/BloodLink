import { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Data Initialization
    useEffect(() => {
        // Simulating API fetch
        const mockBatches = [
            { id: 'B-101', bloodGroup: 'A+', collectionDate: '2026-01-10', expiryDate: '2026-02-21', status: 'AVAILABLE', donor: 'John Doe' },
            { id: 'B-102', bloodGroup: 'O-', collectionDate: '2026-01-05', expiryDate: '2026-02-16', status: 'AVAILABLE', donor: 'Jane Smith' },
            { id: 'B-103', bloodGroup: 'AB+', collectionDate: '2025-12-25', expiryDate: '2026-01-15', status: 'EXPIRED', donor: 'Mike Ross' },
            { id: 'B-104', bloodGroup: 'B+', collectionDate: '2026-01-20', expiryDate: '2026-03-03', status: 'AVAILABLE', donor: 'Rachel Zane' },
            { id: 'B-105', bloodGroup: 'O+', collectionDate: '2026-01-18', expiryDate: '2026-03-01', status: 'AVAILABLE', donor: 'Harvey Specter' },
            { id: 'B-106', bloodGroup: 'A-', collectionDate: '2026-01-01', expiryDate: '2026-01-25', status: 'AVAILABLE', donor: 'Louis Litt' },
        ];
        setBatches(mockBatches);
        setLoading(false);
    }, []);

    const addBatch = (newBatch) => {
        const batch = {
            ...newBatch,
            id: `B-${Math.floor(Math.random() * 10000)}`, // Simple ID generation
            status: 'AVAILABLE'
        };
        setBatches(prev => [batch, ...prev]);
    };

    const updateStatus = (id, newStatus) => {
        setBatches(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    };

    const deleteBatch = (id) => {
        setBatches(prev => prev.filter(b => b.id !== id));
    };

    return (
        <InventoryContext.Provider value={{ batches, loading, addBatch, updateStatus, deleteBatch }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => useContext(InventoryContext);
