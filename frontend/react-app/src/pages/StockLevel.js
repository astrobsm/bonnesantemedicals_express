import React, { useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const StockLevel = () => {
    const [stockLevels, setStockLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStockLevels = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`${API_BASE_URL}/inventory/stock-level`);
                if (!response.ok) throw new Error('Failed to fetch stock levels');
                const data = await response.json();
                setStockLevels(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('Could not load stock levels.');
                setStockLevels([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStockLevels();
    }, []);

    return (
        <div className="stock-level-container">
            <h1>Stock Level</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{color:'red'}}>{error}</p>}
            {!loading && !error && (
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Warehouse</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockLevels.length === 0 ? (
                            <tr><td colSpan="4">No stock data found.</td></tr>
                        ) : (
                            stockLevels.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.productName || item.name || item.product?.name || '-'}</td>
                                    <td>{item.warehouse_name || item.warehouseName || '-'}</td>
                                    <td>{item.available_quantity ?? item.quantity ?? '-'}</td>
                                    <td>{item.status || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default StockLevel;