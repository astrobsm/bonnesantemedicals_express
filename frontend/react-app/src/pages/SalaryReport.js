import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import API_BASE_URL from '../config';
import './SalaryReport.css';

const columns = [
  { field: 'id', headerName: 'Payslip ID', flex: 0.7 },
  { field: 'employee_id', headerName: 'Staff ID', flex: 1 },
  { field: 'salary', headerName: 'Salary', flex: 1 },
  { field: 'bonus', headerName: 'Bonus', flex: 1 },
  { field: 'deductions', headerName: 'Deductions', flex: 1 },
  { field: 'net_pay', headerName: 'Net Pay', flex: 1 },
  { field: 'period', headerName: 'Period', flex: 1 },
];

const SalaryReport = () => {
  const [payslips, setPayslips] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payroll`);
        if (!response.ok) throw new Error('Failed to fetch payslips');
        const data = await response.json();
        setPayslips(Array.isArray(data) ? data.map((p, i) => ({ ...p, id: p.id || i })) : []);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPayslips();
  }, []);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <Box className="salary-report-container" sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" gutterBottom>Salary Report (Payslips)</Typography>
      <DataGrid
        rows={payslips}
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

export default SalaryReport;