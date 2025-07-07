import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './ProductStockLevel.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';
const REFRESH_INTERVAL = 10000; // 10 seconds

const ProductStockLevel = () => {
    const [stockLevels, setStockLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef();

    const fetchStockLevels = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/inventory/stock-level`);
            setStockLevels(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (err) {
            setStockLevels([]);
            setError('Could not fetch stock levels.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockLevels();
        intervalRef.current = setInterval(fetchStockLevels, REFRESH_INTERVAL);
        // Listen for global event to refresh stock levels immediately
        const handler = () => fetchStockLevels();
        window.addEventListener('stockLevelUpdated', handler);
        return () => {
            clearInterval(intervalRef.current);
            window.removeEventListener('stockLevelUpdated', handler);
        };
    }, []);

    const handleManualRefresh = () => {
        setLoading(true);
        fetchStockLevels();
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="product-stock-level-container">
            <h1>Product Stock Levels</h1>
            <button className="refresh-btn" onClick={handleManualRefresh}>Refresh Now</button>
            <table className="stock-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Warehouse</th>
                        <th>Available Quantity</th>
                        <th>Reorder Point</th>
                    </tr>
                </thead>
                <tbody>
                    {stockLevels.length === 0 && (
                        <tr><td colSpan="4">No stock levels found</td></tr>
                    )}
                    {stockLevels.map((item) => (
                        <tr key={item.id + '-' + (item.warehouse_name || item.warehouseId || '')} className={item.available_quantity <= item.reorder_point ? 'low-stock' : ''}>
                            <td>{item.productName || item.name}</td>
                            <td>{item.warehouse_name || item.warehouseName || item.warehouseId || '-'}</td>
                            <td>{item.available_quantity}</td>
                            <td>{item.reorder_point}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductStockLevel;