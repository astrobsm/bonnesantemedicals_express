import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import API_BASE_URL from '../config';
import './CustomerPerformance.css';

const columns = [
  { field: 'name', headerName: 'Customer Name', flex: 1 },
  { field: 'totalTransactions', headerName: 'Total Transactions', flex: 1 },
  { field: 'totalAmount', headerName: 'Total Amount', flex: 1 },
  { field: 'feedback', headerName: 'Feedback', flex: 2 },
];

const getFeedbackMessage = (totalAmount) => {
  if (totalAmount > 10000) {
    return 'Thank you for being a top customer! We appreciate your loyalty.';
  } else if (totalAmount > 5000) {
    return 'We value your patronage! Keep shopping with us.';
  } else {
    return 'Thank you for your business! We look forward to serving you again.';
  }
};

const CustomerPerformance = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomerPerformance = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/customer-performance`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data.map(c => ({ ...c, feedback: getFeedbackMessage(c.totalAmount), id: c.id })) : []);
      } catch (error) {
        setCustomers([]);
      }
    };
    fetchCustomerPerformance();
  }, []);

  return (
    <Box className="customer-performance-container" sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" gutterBottom>Customer Performance</Typography>
      <DataGrid
        rows={customers}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        checkboxSelection
        disableRowSelectionOnClick
        sortingOrder={['desc', 'asc']}
        sx={{ background: '#fff', borderRadius: 2, boxShadow: 2 }}
      />
    </Box>
  );
};

export default CustomerPerformance;