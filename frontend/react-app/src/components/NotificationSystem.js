import React, { useState, useEffect } from 'react';
import './NotificationSystem.css';

const NotificationSystem = ({ notifications }) => {
    const [systemNotifications, setSystemNotifications] = useState([]);

    useEffect(() => {
        // Simulate real-time system notifications
        const interval = setInterval(() => {
            const notifications = [
                { type: 'info', message: 'System backup completed successfully', id: Date.now() },
                { type: 'warning', message: 'Low inventory alert: Raw Material X below threshold', id: Date.now() + 1 },
                { type: 'success', message: 'Production quota for today achieved', id: Date.now() + 2 },
                { type: 'error', message: 'Device maintenance required for Machine #5', id: Date.now() + 3 }
            ];
            
            const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
            
            setSystemNotifications(prev => {
                const newNotifications = [...prev, randomNotification];
                return newNotifications.slice(-3); // Keep only last 3 notifications
            });
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const allNotifications = [...notifications, ...systemNotifications];

    const getIcon = (type) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="notification-system">
            {allNotifications.map((notification) => (
                <div 
                    key={notification.id} 
                    className={`notification notification-${notification.type}`}
                >
                    <span className="notification-icon">
                        {getIcon(notification.type)}
                    </span>
                    <span className="notification-message">
                        {notification.message}
                    </span>
                    <button 
                        className="notification-close"
                        onClick={() => {
                            setSystemNotifications(prev => 
                                prev.filter(n => n.id !== notification.id)
                            );
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;
