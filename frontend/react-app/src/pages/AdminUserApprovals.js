import React, { useEffect, useState, useRef } from 'react';
import './AdminUserApprovals.css';
import API_BASE_URL from '../config';

const AdminUserApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/pending-users`);
        if (!response.ok) throw new Error('Failed to fetch pending users');
        const data = await response.json();
        setPendingUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingUsers();
  }, []);

  const showNotification = (msg, type = 'success') => {
    if (notificationRef.current) {
      notificationRef.current.textContent = msg;
      notificationRef.current.className = type === 'success' ? 'success' : 'error';
      notificationRef.current.style.display = 'block';
      setTimeout(() => {
        if (notificationRef.current) notificationRef.current.style.display = 'none';
      }, 3000);
    }
  };

  const handleApprove = async (userId) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/approve-user/${userId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve user');
      setSuccess('User approved successfully!');
      showNotification('User approved successfully!', 'success');
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err.message);
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="admin-approvals-container">
      <h2>Pending User Approvals</h2>
      <div ref={notificationRef} style={{display:'none',marginBottom:'16px',padding:'10px',borderRadius:'4px',fontWeight:'bold'}}></div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {!loading && pendingUsers.length === 0 && <p>No pending users.</p>}
      {!loading && pendingUsers.length > 0 && (
        <table className="approvals-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name || '-'}</td>
                <td>{user.username || user.email || '-'}</td>
                <td>{user.phone || '-'}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <button onClick={() => handleApprove(user.id)}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserApprovals;
