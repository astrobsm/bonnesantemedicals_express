import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import './StaffList.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const columns = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'staff_id', headerName: 'Staff ID', flex: 1 },
  { field: 'date_of_birth', headerName: 'Date of Birth', flex: 1 },
  { field: 'age', headerName: 'Age', flex: 0.5 },
  { field: 'gender', headerName: 'Gender', flex: 0.7 },
  { field: 'marital_status', headerName: 'Marital Status', flex: 1 },
  { field: 'phone_number', headerName: 'Phone', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'next_of_kin_name', headerName: 'Next of Kin', flex: 1 },
  { field: 'next_of_kin_phone', headerName: 'Next of Kin Phone', flex: 1 },
  { field: 'bank_name', headerName: 'Bank', flex: 1 },
  { field: 'account_number', headerName: 'Account Number', flex: 1 },
  { field: 'address', headerName: 'Address', flex: 1 },
  { field: 'hourly_rate', headerName: 'Hourly Rate', flex: 1 },
  { field: 'role', headerName: 'Role', flex: 1 },
  { field: 'department', headerName: 'Department', flex: 1 },
  { field: 'appointment_type', headerName: 'Appointment Type', flex: 1 },
];

const StaffList = () => {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // Always use the trailing slash to avoid CORS/redirect issues
        const response = await fetch(`${API_BASE_URL}/staff/`);
        const data = await response.json();
        setStaff(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    fetchStaff();
  }, []);

  return (
    <Box className="staff-list-container" sx={{ height: 600, width: '100%' }}>
      <h1>Staff List</h1>
      <DataGrid
        rows={staff.map((s, i) => ({ id: s.id || i, ...s }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{ background: '#fff', borderRadius: 2, boxShadow: 2 }}
      />
    </Box>
  );
};

export default StaffList;