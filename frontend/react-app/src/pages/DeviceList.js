import React, { useEffect, useState } from 'react';
import './DeviceList.css';
import API_BASE_URL from '../config';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';

const DeviceList = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                // Ensure correct endpoint with trailing slash
                let url = `${API_BASE_URL}/devices/`;
                if (!API_BASE_URL.endsWith('/api/v1') && !API_BASE_URL.endsWith('/api/v1/')) {
                    url = `${API_BASE_URL}/api/v1/devices/`;
                }
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch devices');
                const data = await response.json();
                setDevices(Array.isArray(data) ? data : []);
            } catch (error) {
                setError('Error fetching devices');
                // Log error for debugging
                if (window && window.console) {
                    console.error('Device fetch error:', error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
    }, []);

    if (loading) return <div>Loading devices...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="device-list-container">
            <h1>Device List</h1>
            <Grid container spacing={2}>
                {devices.map(device => (
                    <Grid item xs={12} md={6} lg={4} key={device.id}>
                        <Card className="device-card" variant="outlined">
                            <CardContent>
                                <Typography variant="h6">{device.name}</Typography>
                                <Typography variant="body2">ID: {device.id}</Typography>
                                <Typography variant="body2">Serial: {device.serial_number}</Typography>
                                <Typography variant="body2">Model: {device.model || 'N/A'}</Typography>
                                <Typography variant="body2">Manufacturer: {device.manufacturer || 'N/A'}</Typography>
                                <Typography variant="body2">Status: {device.status || 'N/A'}</Typography>
                                <Typography variant="body2">Location: {device.location || 'N/A'}</Typography>
                                <Typography variant="body2">Notes: {device.notes || 'N/A'}</Typography>
                                <Button variant="contained" color="primary" style={{marginTop:8}}>View Details</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default DeviceList;