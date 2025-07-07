import React, { useState, useEffect } from 'react';
import './DeviceFaultReporting.css';
import API_BASE_URL from '../config';

const DeviceFaultReporting = () => {
    const [devices, setDevices] = useState([]);
    const [formData, setFormData] = useState({
        deviceId: '',
        date: '',
        faultSeverity: '',
        actionRequired: '',
    });

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/devices`);
                const data = await response.json();
                setDevices(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };

        fetchDevices();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/fault-reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            alert(data.message || 'Fault reported successfully!');
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="fault-reporting-container">
            <h1>Device Fault Reporting</h1>
            <form onSubmit={handleSubmit} className="fault-reporting-form">
                <label>
                    Select Device:
                    <select
                        name="deviceId"
                        value={formData.deviceId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">-- Select a Device --</option>
                        {devices.map((device) => (
                            <option key={device.id} value={device.id}>{device.deviceName}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Date:
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Nature of Fault:
                    <select
                        name="faultSeverity"
                        value={formData.faultSeverity}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">-- Select Severity --</option>
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                        <option value="Critical">Critical</option>
                    </select>
                </label>
                <label>
                    Action Required:
                    <textarea
                        name="actionRequired"
                        value={formData.actionRequired}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
};

export default DeviceFaultReporting;