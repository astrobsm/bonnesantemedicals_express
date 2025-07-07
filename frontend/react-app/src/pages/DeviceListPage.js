import React, { useState, useEffect } from 'react';
import './DeviceListPage.css';
import API_BASE_URL from '../config';

const DeviceListPage = () => {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/devices`);
                const data = await response.json();
                setDevices(data);
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };

        fetchDevices();
    }, []);

    const calculateResidualLife = (usefulLife, dateOfIntake) => {
        const intakeDate = new Date(dateOfIntake);
        const currentDate = new Date();
        const yearsElapsed = (currentDate - intakeDate) / (1000 * 60 * 60 * 24 * 365);
        return Math.max(0, usefulLife - yearsElapsed).toFixed(2);
    };

    return (
        <div className="device-list-container">
            <h1>Device List</h1>
            <ul className="device-list">
                {devices.map((device) => (
                    <li key={device.id} className="device-item">
                        <h2>{device.deviceName}</h2>
                        <p>Serial Number: {device.serialNumber}</p>
                        <p>Quantity: {device.quantity}</p>
                        <p>Residual Useful Life: {calculateResidualLife(device.usefulLife, device.dateOfIntake)} years</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DeviceListPage;