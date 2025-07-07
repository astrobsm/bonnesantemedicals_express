import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AttendancePage = () => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [action, setAction] = useState('IN');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/staff/`)
      .then(res => res.json())
      .then(data => setStaff(Array.isArray(data) ? data : []));
  }, []);

  const handleAttendance = async () => {
    setMessage(''); setError('');
    if (!selectedStaff) { setError('Please select a staff member.'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: selectedStaff, action })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Attendance ${action === 'IN' ? 'Time-In' : 'Time-Out'} recorded successfully.`);
        fetchRecords(selectedStaff);
      } else {
        setError(data.detail || 'Error recording attendance.');
      }
    } catch (e) {
      setError('Network error.');
    }
  };

  const fetchRecords = async (staffId) => {
    if (!staffId) return;
    const res = await fetch(`${API_BASE_URL}/attendance/${staffId}`);
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (selectedStaff) fetchRecords(selectedStaff);
  }, [selectedStaff]);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Staff Attendance</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Staff</InputLabel>
        <Select
          value={selectedStaff}
          label="Select Staff"
          onChange={e => setSelectedStaff(e.target.value)}
        >
          {staff.map(s => (
            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Action</InputLabel>
        <Select
          value={action}
          label="Action"
          onChange={e => setAction(e.target.value)}
        >
          <MenuItem value="IN">Time In</MenuItem>
          <MenuItem value="OUT">Time Out</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleAttendance} sx={{ mb: 2 }}>
        Record Attendance
      </Button>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Attendance Records</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time In</TableCell>
              <TableCell>Time Out</TableCell>
              <TableCell>Hours Worked</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.time_in ? new Date(r.time_in).toLocaleTimeString() : ''}</TableCell>
                <TableCell>{r.time_out ? new Date(r.time_out).toLocaleTimeString() : ''}</TableCell>
                <TableCell>{r.hours_worked ? r.hours_worked.toFixed(2) : ''}</TableCell>
                <TableCell>{r.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendancePage;
