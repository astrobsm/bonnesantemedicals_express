import React, { useEffect, useState } from 'react';
import AdminSection from '../components/AdminSection';
import './AdminUsers.css';
import API_BASE_URL from '../config';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/staff`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <AdminSection title="Users">
      <div className="admin-users-list">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && users.length === 0 && <p>No users found.</p>}
        {!loading && !error && users.length > 0 && (
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name || u.full_name || '-'}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminSection>
  );
};

export default AdminUsers;
