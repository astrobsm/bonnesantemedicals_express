import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductionInventory.css';

const ProductionInventory = () => {
    const navigate = useNavigate();

    return (
        <div className="production-inventory-container">
            <h1>Production Inventory</h1>
            <div className="button-group">
                <button onClick={() => navigate('/raw-material-stock-intake')}>Raw Material Stock Intake</button>
                <button onClick={() => navigate('/raw-material-stock-level')}>Raw Material Stock Level</button>
                <button onClick={() => navigate('/register-production-requirement')}>Production Requirement</button>
                <button onClick={() => navigate('/production-console')}>Production Console</button>
                <button onClick={() => navigate('/production-output')}>Production Output</button>
                <button onClick={() => navigate('/production-analysis')}>Production Analysis</button>
            </div>
        </div>
    );
};

export default ProductionInventory;