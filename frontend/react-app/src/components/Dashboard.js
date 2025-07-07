import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-content" style={{ backgroundImage: `url('/logo192.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <h1>Welcome to AstroBSM-Oracle IVANSTAMAS</h1>
            <p>Select a module from the sidebar to get started.</p>
        </div>
    );
};

export default Dashboard;