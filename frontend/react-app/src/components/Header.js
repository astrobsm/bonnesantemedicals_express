import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ userRole }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const name = localStorage.getItem('userName') || 'Admin User';
        setUserName(name);
    }, []);

    return (
        <header className="app-header">
            <div className="header-left">
                <h1 className="app-title">AstroBSM Oracle IVANSTAMAS</h1>
                <span className="header-subtitle">Manufacturing Excellence Platform</span>
            </div>
            
            <div className="header-center">
                <div className="status-indicators">
                    <div className="status-indicator online">
                        <span className="status-dot"></span>
                        System Online
                    </div>
                    <div className="status-indicator">
                        <span className="status-dot warning"></span>
                        Real-time Monitoring
                    </div>
                </div>
            </div>

            <div className="header-right">
                <div className="time-display">
                    <div className="current-time">
                        {currentTime.toLocaleTimeString()}
                    </div>
                    <div className="current-date">
                        {currentTime.toLocaleDateString()}
                    </div>
                </div>
                
                <div className="user-info">
                    <div className="user-avatar">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">{userRole.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
