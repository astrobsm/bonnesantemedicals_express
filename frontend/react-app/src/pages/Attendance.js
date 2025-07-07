import React, { useState } from 'react';
import { getCurrentUser } from '../utils/auth';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './Attendance.css';

const Attendance = () => {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Attendance action handler
    const handleAttendance = async (action) => {
        const user = getCurrentUser();
        if (!user) {
            setMessage('User not logged in.');
            return;
        }
        try {
            const res = await apiFetch('http://localhost:8000/api/v1/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ user_id: user.id, action }),
            });
            if (res.ok) {
                setMessage('Attendance ' + action + ' recorded successfully.');
            } else {
                const err = await res.json();
                setMessage(err.detail || 'Error recording attendance.');
            }
        } catch (e) {
            setMessage('Network error.');
        }
    };

    return (
        <div className="attendance-container">
            <h1>Attendance</h1>
            <form className="attendance-form" onSubmit={e => e.preventDefault()}>
                <button type="button" onClick={() => handleAttendance('IN')}>Clock In</button>
                <button type="button" onClick={() => handleAttendance('OUT')}>Clock Out</button>
            </form>
            {message && <p className="message">{message}</p>}
            <div className="attendance-buttons">
                <button onClick={() => navigate('/timed-attendance')}>Timed Attendance</button>
                <button onClick={() => navigate('/attendance-record')}>Attendance Record</button>
                <button onClick={() => navigate('/attendance-analysis')}>Attendance Analysis</button>
            </div>
        </div>
    );
};

export default Attendance;