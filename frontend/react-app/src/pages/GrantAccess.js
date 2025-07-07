import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GrantAccess.css';

const GrantAccess = () => {
    const navigate = useNavigate();
    return (
        <div className="grant-access-container">
            <h1>Grant Access Privileges</h1>
            <div className="grant-access-sections">
                <button className="grant-access-btn" onClick={() => navigate('/warehouse-transfer')}>Warehouse Transfer Access</button>
                {/* Add more access-related buttons/sections here as needed */}
            </div>
            <p>Form for granting access privileges will be implemented here.</p>
        </div>
    );
};

export default GrantAccess;