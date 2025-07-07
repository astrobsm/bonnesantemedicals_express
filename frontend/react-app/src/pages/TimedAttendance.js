
import React, { useState, useEffect } from 'react';
import './TimedAttendance.css';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";


const TimedAttendance = () => {
    const [staff, setStaff] = useState([]);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [action, setAction] = useState('time-in');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/staff/`);
                const data = await response.json();
                setStaff(Array.isArray(data) ? data : []);
            } catch (error) {
                setMessage('Error fetching staff list.');
            }
        };
        fetchStaff();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStaffId || !action) {
            setMessage('Please select staff and action.');
            return;
        }
        setLoading(true);
        setMessage('Submitting attendance...');
        const payload = {
            user_id: selectedStaffId,
            action: action === 'time-in' ? 'IN' : 'OUT'
        };
        try {
            const res = await fetch(`${API_BASE_URL}/attendance/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Attendance recorded!');
                setSelectedStaffId('');
                setAction('time-in');
            } else {
                setMessage(data.detail || 'Error recording attendance.');
            }
        } catch (err) {
            setMessage('Network error.');
        }
        setLoading(false);
    };

    return (
        <div className="timed-attendance-container">
            <h1>Timed Attendance</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Select Staff:
                    <select value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} required>
                        <option value="">-- Select Staff --</option>
                        {staff.map((s) => (
                            <option key={s.id || s.staff_id} value={s.id || s.staff_id}>
                                {s.name || s.full_name || s.username || s.staff_id}
                            </option>
                        ))}
                    </select>
                </label>
                <label style={{ marginLeft: 16 }}>
                    Select Action:
                    <select value={action} onChange={e => setAction(e.target.value)} required>
                        <option value="time-in">Time In</option>
                        <option value="time-out">Time Out</option>
                    </select>
                </label>
                <button type="submit" disabled={loading} style={{ marginLeft: 16 }}>
                    {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default TimedAttendance;