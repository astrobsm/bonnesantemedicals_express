import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
import API_BASE_URL from '../config';

const StaffAppraisal = () => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [appraisals, setAppraisals] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/staff/`)
      .then(res => res.json())
      .then(data => setStaff(Array.isArray(data) ? data : []));
  }, []);

  const fetchAppraisals = async () => {
    setError(''); setMessage('');
    if (!selectedStaff) { setError('Please select a staff member.'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/appraisal/appraisals/${selectedStaff}`);
      const data = await res.json();
      if (res.ok) {
        setAppraisals(Array.isArray(data) ? data : []);
        setMessage('Appraisal data fetched successfully.');
      } else {
        setError(data.detail || 'Error fetching appraisals.');
      }
    } catch (e) {
      setError('Network error.');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Staff Appraisal Report', 20, 20);
    doc.autoTable({
      head: [['Date', 'Score', 'Remarks', 'Appraiser']],
      body: appraisals.map(a => [a.date, a.score, a.remarks || '', a.appraiser || ''])
    });
    doc.save('staff_appraisal.pdf');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Staff Appraisal</Typography>
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
      <Button variant="contained" color="primary" onClick={fetchAppraisals} sx={{ mb: 2 }}>
        Fetch Appraisal Data
      </Button>
      <Button variant="outlined" color="secondary" onClick={exportToPDF} sx={{ mb: 2, ml: 2 }} disabled={appraisals.length === 0}>
        Export as PDF
      </Button>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Appraisal Records</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Appraiser</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appraisals.map(a => (
              <TableRow key={a.id}>
                <TableCell>{a.date}</TableCell>
                <TableCell>{a.score}</TableCell>
                <TableCell>{a.remarks}</TableCell>
                <TableCell>{a.appraiser}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StaffAppraisal;