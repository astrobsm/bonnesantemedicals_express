import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Admin');
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
    const [profileData, setProfileData] = useState({});
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const notificationRef = useRef(null);

    const handleRoleChange = (e) => {
        const selectedRole = e.target.value;
        setRole(selectedRole);
        setIsFirstTimeUser(['Sales Manager', 'Marketing', 'Production Manager'].includes(selectedRole));
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

        if (isFirstTimeUser) {
            try {
                // Send profile creation request
                await axios.post(`${API_BASE_URL}/auth/create-profile`, {
                    full_name: profileData.fullName,
                    email: profileData.email,
                    phone: profileData.phone,
                    role
                });
                showNotification('Profile created successfully. Please wait for admin approval.', 'success');
            } catch (err) {
                showNotification('Error creating profile. Please try again.', 'error');
            }
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username,
                password,
                role
            });
            localStorage.setItem('token', response.data.access_token);
            // Save user info for attendance
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            // Redirect based on role
            if (role === 'Admin') {
                navigate('/admin-dashboard');
            } else if (role === 'Sales Manager') {
                navigate('/sales-dashboard');
            } else if (role === 'Production Manager') {
                navigate('/production-dashboard');
            } else {
                navigate('/marketing-dashboard');
            }
        } catch (err) {
            showNotification('Invalid credentials. Please try again.', 'error');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <div ref={notificationRef} style={{display:'none',marginBottom:'16px',padding:'10px',borderRadius:'4px',fontWeight:'bold'}}></div>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleLogin}>
                <div>
                    <label>Role:</label>
                    <select value={role} onChange={handleRoleChange} required>
                        <option value="Admin">Admin</option>
                        <option value="Sales Manager">Sales Manager</option>
                        <option value="Production Manager">Production Manager</option>
                        <option value="Marketing">Marketing</option>
                    </select>
                </div>

                {isFirstTimeUser && (
                    <div className="profile-creation">
                        <h3>Create Profile</h3>
                        <div>
                            <label>Full Name:</label>
                            <input
                                type="text"
                                name="fullName"
                                value={profileData.fullName || ''}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email || ''}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Phone Number:</label>
                            <input
                                type="text"
                                name="phone"
                                value={profileData.phone || ''}
                                onChange={handleProfileChange}
                                required
                            />
                        </div>
                    </div>
                )}

                {!isFirstTimeUser && (
                    <>
                        <div>
                            <label>Username:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                <button type="submit">{isFirstTimeUser ? 'Create Profile' : 'Login'}</button>
            </form>
        </div>
    );
};

export default Login;