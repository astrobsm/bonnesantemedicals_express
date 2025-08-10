import React, { useState, useEffect } from 'react';
import './PerformanceMonitor.css';

const PerformanceMonitor = () => {
    const [metrics, setMetrics] = useState({
        cpuUsage: 0,
        memoryUsage: 0,
        activeUsers: 0,
        apiResponseTime: 0,
        systemLoad: 'Low'
    });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Simulate real-time performance monitoring
        const interval = setInterval(() => {
            setMetrics({
                cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
                memoryUsage: Math.floor(Math.random() * 20) + 40, // 40-60%
                activeUsers: Math.floor(Math.random() * 10) + 15, // 15-25 users
                apiResponseTime: Math.floor(Math.random() * 50) + 100, // 100-150ms
                systemLoad: Math.random() > 0.8 ? 'High' : Math.random() > 0.5 ? 'Medium' : 'Low'
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const getLoadColor = (load) => {
        switch (load) {
            case 'High': return '#f44336';
            case 'Medium': return '#ff9800';
            case 'Low': return '#4caf50';
            default: return '#4caf50';
        }
    };

    const getUsageColor = (usage) => {
        if (usage > 80) return '#f44336';
        if (usage > 60) return '#ff9800';
        return '#4caf50';
    };

    return (
        <>
            <button 
                className="performance-toggle"
                onClick={() => setIsVisible(!isVisible)}
                title="System Performance Monitor"
            >
                📊
            </button>
            
            {isVisible && (
                <div className="performance-monitor">
                    <div className="performance-header">
                        <h3>System Performance</h3>
                        <button 
                            className="performance-close"
                            onClick={() => setIsVisible(false)}
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="performance-metrics">
                        <div className="metric">
                            <div className="metric-label">CPU Usage</div>
                            <div className="metric-bar">
                                <div 
                                    className="metric-fill"
                                    style={{ 
                                        width: `${metrics.cpuUsage}%`,
                                        background: getUsageColor(metrics.cpuUsage)
                                    }}
                                />
                            </div>
                            <div className="metric-value">{metrics.cpuUsage}%</div>
                        </div>
                        
                        <div className="metric">
                            <div className="metric-label">Memory</div>
                            <div className="metric-bar">
                                <div 
                                    className="metric-fill"
                                    style={{ 
                                        width: `${metrics.memoryUsage}%`,
                                        background: getUsageColor(metrics.memoryUsage)
                                    }}
                                />
                            </div>
                            <div className="metric-value">{metrics.memoryUsage}%</div>
                        </div>
                        
                        <div className="metric-row">
                            <div className="metric-item">
                                <span className="metric-icon">👥</span>
                                <span className="metric-text">Active Users: {metrics.activeUsers}</span>
                            </div>
                            
                            <div className="metric-item">
                                <span className="metric-icon">⚡</span>
                                <span className="metric-text">API: {metrics.apiResponseTime}ms</span>
                            </div>
                        </div>
                        
                        <div className="system-load">
                            <span>System Load: </span>
                            <span 
                                className="load-indicator"
                                style={{ color: getLoadColor(metrics.systemLoad) }}
                            >
                                {metrics.systemLoad}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PerformanceMonitor;
