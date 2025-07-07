import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SalesInventory.css';

const SalesInventory = () => {
    const navigate = useNavigate();

    return (
        <div className="sales-inventory-container">
            <h1>Sales Inventory</h1>
            <div className="sales-inventory-buttons">
                <div className="sales-inventory-row">
                    <button onClick={() => navigate('/product-stock-intake')}>Product Stock Intake</button>
                    <button onClick={() => { console.log('Navigating to /product-stock-level'); navigate('/product-stock-level'); }}>Product Stock Level</button>
                    <button onClick={() => navigate('/generate-invoice')}>Generate Invoice</button>
                    <button onClick={() => navigate('/sales-summary')}>Sales Summary</button>
                </div>
                <div className="sales-inventory-row">
                    <button onClick={() => navigate('/customer-performance')}>Customer Performance</button>
                    <button onClick={() => navigate('/returned-product-entry')}>Returned Products</button>
                    <button onClick={() => navigate('/warehouse-transfer')}>Warehouse Transfer</button>
                </div>
            </div>
        </div>
    );
};

export default SalesInventory;