import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import './LoginPage.custom.css';
import API_BASE_URL from '../config';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const notificationRef = useRef(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [hasCredentials, setHasCredentials] = useState(true); // true = login, false = create profile
  const navigate = useNavigate();

  const roleMap = {
    admin: 'Admin',
    sales: 'Sales',
    manager: 'Manager',
    production_manager: 'Production_Manager',
    marketing: 'Marketing',
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setIsFirstTimeUser(selectedRole !== 'admin' && selectedRole !== '');
    setHasCredentials(true); // reset to login by default
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (isFirstTimeUser && !hasCredentials) {
      try {
        // Send profile creation request
        const resp = await fetch(`${API_BASE_URL}/auth/create-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: profileData.fullName,
            email: profileData.email,
            phone: profileData.phone,
            role: roleMap[role] || role
          })
        });
        if (!resp.ok) throw new Error('Error creating profile. Please try again.');
        showNotification('Profile created successfully. Please wait for admin approval.', 'success');
      } catch (err) {
        showNotification('Error creating profile. Please try again.', 'error');
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: roleMap[role] || role }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        if (role === 'admin') navigate('/dashboard');
        else if (role === 'sales') navigate('/sales-dashboard');
        else if (role === 'manager') navigate('/manager-dashboard');
        else if (role === 'production_manager') navigate('/production-dashboard');
        else if (role === 'marketing') navigate('/marketing-dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed.');
        showNotification(errorData.detail || 'Login failed.', 'error');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      showNotification('An error occurred. Please try again later.', 'error');
    }
  };

  const backgroundStyle = {
    backgroundImage: "url('/pharmacy-dispensary.jpg')",
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
  };

  return (
    <div style={backgroundStyle} className="login-page">
      <div className="login-container">
        <h1>Welcome to AstroBSM-Oracle</h1>
        <div ref={notificationRef} style={{display:'none',marginBottom:'16px',padding:'10px',borderRadius:'4px',fontWeight:'bold'}}></div>
        {isFirstTimeUser && (
          <div style={{marginBottom:'1rem'}}>
            <button type="button" className={hasCredentials ? '' : 'active'} onClick={() => setHasCredentials(true)}>
              I have login credentials
            </button>
            <button type="button" className={!hasCredentials ? 'active' : ''} onClick={() => setHasCredentials(false)} style={{marginLeft:'10px'}}>
              I am a new user (Create Profile)
            </button>
          </div>
        )}
        <form onSubmit={handleLogin}>
          {(!isFirstTimeUser || hasCredentials) && (
            <>
              <input
                type="text"
                placeholder="Username"
                className="login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}
          <select
            className="login-select"
            value={role}
            onChange={handleRoleChange}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="sales">Sales</option>
            <option value="manager">Manager</option>
            <option value="production_manager">Production Manager</option>
            <option value="marketing">Marketing</option>
          </select>
          {isFirstTimeUser && !hasCredentials && (
            <div className="profile-creation">
              <h3>Create Profile</h3>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="login-input"
                value={profileData.fullName || ''}
                onChange={handleProfileChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="login-input"
                value={profileData.email || ''}
                onChange={handleProfileChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                className="login-input"
                value={profileData.phone || ''}
                onChange={handleProfileChange}
                required
              />
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">{isFirstTimeUser && !hasCredentials ? 'Create Profile' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;