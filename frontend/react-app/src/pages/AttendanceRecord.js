import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import './AttendanceRecord.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'staff_name', headerName: 'Staff Name', flex: 1 },
  { field: 'date', headerName: 'Date', flex: 1 },
  { field: 'time_in', headerName: 'Time In', flex: 1 },
  { field: 'time_out', headerName: 'Time Out', flex: 1 },
  { field: 'hours_worked', headerName: 'Hours Worked', flex: 1 },
  { field: 'action', headerName: 'Action', flex: 1 },
];

const AttendanceRecord = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/attendance/attendance-with-names`);
        const data = await res.json();
        const allRecords = data.map(r => ({
          ...r,
          date: r.date,
          time_in: r.time_in ? new Date(r.time_in).toLocaleTimeString() : '',
          time_out: r.time_out ? new Date(r.time_out).toLocaleTimeString() : '',
          hours_worked: r.hours_worked ? r.hours_worked.toFixed(2) : '',
        }));
        setRecords(allRecords);
      } catch (error) {
        setRecords([]);
      }
      setLoading(false);
    };
    fetchAllAttendance();
  }, []);

  return (
    <Box className="attendance-record-container" sx={{ height: 600, width: '100%' }}>
      <h1>Attendance Record</h1>
      <DataGrid
        rows={records.map((r, i) => ({ id: r.id || i, ...r }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        loading={loading}
        sx={{ background: '#fff', borderRadius: 2, boxShadow: 2 }}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default AttendanceRecord;