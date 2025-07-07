import React from 'react';
import './StaffManagement.css';
import { useNavigate } from 'react-router-dom';

const StaffManagement = () => {
    const navigate = useNavigate();

    return (
        <div className="staff-management-container">
            <h1>Staff Management</h1>
            <div className="button-group">
                <button className="awesome-button" onClick={() => navigate('/staff-list')}>Staff List</button>
                <button className="awesome-button" onClick={() => navigate('/staff-appraisal')}>Staff Appraisal</button>
            </div>
        </div>
    );
};

export default StaffManagement;