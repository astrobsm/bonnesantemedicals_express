import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalInventory: 0,
    totalProduction: 0,
    totalSales: 0,
    systemHealth: 95,
    dailyTransactions: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchMetrics();
    fetchRecentActivities();
    fetchSystemAlerts();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchMetrics();
      fetchRecentActivities();
      fetchSystemAlerts();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/list-users`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      // Simulate fetching real metrics - replace with actual API calls
      setMetrics({
        totalUsers: Math.floor(Math.random() * 100) + 50,
        activeUsers: Math.floor(Math.random() * 30) + 20,
        pendingApprovals: Math.floor(Math.random() * 10) + 2,
        totalInventory: Math.floor(Math.random() * 10000) + 5000,
        totalProduction: Math.floor(Math.random() * 1000) + 500,
        totalSales: Math.floor(Math.random() * 50000) + 25000,
        systemHealth: Math.floor(Math.random() * 15) + 85,
        dailyTransactions: Math.floor(Math.random() * 200) + 100
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchRecentActivities = async () => {
    const activities = [
      { id: 1, type: 'user_login', user: 'John Doe', timestamp: new Date(), description: 'User logged in', icon: '👤' },
      { id: 2, type: 'inventory_update', user: 'Jane Smith', timestamp: new Date(Date.now() - 300000), description: 'Updated inventory levels', icon: '📦' },
      { id: 3, type: 'production_start', user: 'Mike Johnson', timestamp: new Date(Date.now() - 600000), description: 'Started production batch #1023', icon: '🏭' },
      { id: 4, type: 'sales_transaction', user: 'Sarah Wilson', timestamp: new Date(Date.now() - 900000), description: 'Processed sales order #5678', icon: '💰' },
      { id: 5, type: 'staff_approval', user: 'Admin', timestamp: new Date(Date.now() - 1200000), description: 'Approved new staff member', icon: '✅' }
    ];
    setRecentActivities(activities);
  };

  const fetchSystemAlerts = async () => {
    const alerts = [
      { id: 1, type: 'warning', message: 'Low inventory alert: Raw Material X below threshold', timestamp: new Date(), icon: '⚠️' },
      { id: 2, type: 'info', message: 'System backup completed successfully', timestamp: new Date(Date.now() - 1800000), icon: 'ℹ️' },
      { id: 3, type: 'success', message: 'Production quota for today achieved', timestamp: new Date(Date.now() - 3600000), icon: '✅' },
      { id: 4, type: 'error', message: 'Device maintenance required for Machine #5', timestamp: new Date(Date.now() - 7200000), icon: '❌' }
    ];
    setSystemAlerts(alerts);
  };

  const onApproveUser = async (user) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/approve-user/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Failed to approve user');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credentials_user_${user.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      alert('User approved and credentials PDF downloaded!');
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'approved' } : u));
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user.');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAlertClass = (type) => {
    const baseClass = 'alert-item';
    return `${baseClass} ${baseClass}--${type}`;
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🏢 Admin Dashboard</h1>
        <p>Manufacturing Excellence Control Center</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>{metrics.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🟢</div>
          <div className="metric-content">
            <h3>{metrics.activeUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <h3>{metrics.pendingApprovals}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>{metrics.totalInventory.toLocaleString()}</h3>
            <p>Inventory Items</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🏭</div>
          <div className="metric-content">
            <h3>{metrics.totalProduction.toLocaleString()}</h3>
            <p>Production Units</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>${metrics.totalSales.toLocaleString()}</h3>
            <p>Total Sales</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>{metrics.systemHealth}%</h3>
            <p>System Health</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>{metrics.dailyTransactions}</h3>
            <p>Daily Transactions</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Activities */}
        <div className="dashboard-section">
          <h2>📈 Recent Activities</h2>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <p className="activity-description">{activity.description}</p>
                  <div className="activity-meta">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="dashboard-section">
          <h2>🚨 System Alerts</h2>
          <div className="alerts-list">
            {systemAlerts.map(alert => (
              <div key={alert.id} className={getAlertClass(alert.type)}>
                <div className="alert-icon">{alert.icon}</div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-time">{formatTimestamp(alert.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Management Section */}
        <div className="dashboard-section full-width">
          <h2>👤 User Management</h2>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : (
            <div className="users-table">
              <div className="table-header">
                <div>Username</div>
                <div>Full Name</div>
                <div>Role</div>
                <div>Status</div>
                <div>Email</div>
                <div>Actions</div>
              </div>
              {users.map(user => (
                <div key={user.id} className="table-row">
                  <div>{user.username || 'N/A'}</div>
                  <div>{user.full_name || 'N/A'}</div>
                  <div>
                    <span className={`role-badge role-${user.role || 'user'}`}>
                      {user.role || 'user'}
                    </span>
                  </div>
                  <div>
                    <span className={`status-badge status-${user.status || 'active'}`}>
                      {user.status || 'active'}
                    </span>
                  </div>
                  <div>{user.email || 'N/A'}</div>
                  <div>
                    {user.status === 'pending' ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => onApproveUser(user)}
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="approved-text">✅ Approved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
