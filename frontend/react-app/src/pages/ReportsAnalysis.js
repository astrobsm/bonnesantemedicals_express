import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportsAnalysis.css';

const ReportsAnalysis = () => {
    const navigate = useNavigate();

    return (
        <div className="reports-analysis-container">
            <h1>Reports & Analysis</h1>
            <div className="reports-buttons">
                <button 
                    onClick={() => {
                        console.log('Navigating to Customers Performance');
                        navigate('/customers-performance');
                    }} 
                    className="reports-button"
                >
                    Customers Performance
                </button>
                <button 
                    onClick={() => {
                        console.log('Navigating to Staff Performance');
                        navigate('/staff-performance');
                    }} 
                    className="reports-button"
                >
                    Staff Performance
                </button>
            </div>
        </div>
    );
};

export default ReportsAnalysis;