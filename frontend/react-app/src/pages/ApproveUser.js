import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApproveUser.css';

const ApproveUser = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/users/pending')
      .then(response => setUsers(response.data))
      .catch(err => setError('Failed to fetch users.')); // Handle error
  }, []);

  const approveUser = (userId) => {
    axios.post(`/api/approve-user/${userId}`)
      .then(() => {
        setUsers(users.filter(user => user.id !== userId));
      })
      .catch(() => setError('Failed to approve user.'));
  };

  return (
    <div className="approve-user-container">
      <h1>Approve Users</h1>
      {error && <p className="error-message">{error}</p>}
      <ul>
        {users.map(user => (
          <li key={user.id} className="user-item">
            <span>{user.username} ({user.role})</span>
            <button onClick={() => approveUser(user.id)} className="approve-button">Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApproveUser;
