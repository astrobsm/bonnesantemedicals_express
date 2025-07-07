import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Payroll.css';

const Payroll = () => {
    const navigate = useNavigate();
    return (
        <div className="payroll-container">
            <h1>Payroll</h1>
            <div className="payroll-buttons">
                <button onClick={() => navigate('/salary-console')} className="payroll-button">Salary Console</button>
                <button onClick={() => navigate('/salary-report')} className="payroll-button">Salary Report</button>
            </div>
        </div>
    );
};

export default Payroll;