import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import API_BASE_URL from '../config';

const DeviceFaultReport = () => {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({
    device_id: '',
    date: '',
    fault_nature: '',
    action_required: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/devices/`)
      .then(res => res.json())
      .then(data => setDevices(Array.isArray(data) ? data : []));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage(''); setError('');
    if (!form.device_id || !form.date || !form.fault_nature || !form.action_required) {
      setError('All fields are required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/device-fault-reporting/device-fault-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: form.device_id,
          date: form.date,
          fault_nature: form.fault_nature,
          action_required: form.action_required
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Device fault report submitted successfully.');
        setForm({ device_id: '', date: '', fault_nature: '', action_required: '' });
      } else {
        setError(data.detail || 'Error submitting fault report.');
      }
    } catch (e) {
      setError('Network error.');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Device Fault Reporting</Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Device</InputLabel>
          <Select
            name="device_id"
            value={form.device_id}
            label="Select Device"
            onChange={handleChange}
            required
          >
            {devices.map(d => (
              <MenuItem key={d.id} value={d.id}>{d.deviceName || d.name || d.id}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Nature of Fault"
          name="fault_nature"
          value={form.fault_nature}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          required
        />
        <TextField
          label="Action Required"
          name="action_required"
          value={form.action_required}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          required
        />
        <Button variant="contained" color="primary" type="submit">Submit Fault Report</Button>
      </form>
      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default DeviceFaultReport;
