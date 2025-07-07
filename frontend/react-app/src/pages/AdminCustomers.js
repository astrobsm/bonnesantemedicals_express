import React, { useEffect, useState } from 'react';
import AdminSection from '../components/AdminSection';
import './AdminCustomers.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/customers`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <AdminSection title="Customers">
      <div className="admin-customers-list">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && customers.length === 0 && <p>No customers found.</p>}
        {!loading && !error && customers.length > 0 && (
          <table className="admin-customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Customer ID</th>
                <th>Phone</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.customer_id}</td>
                  <td>{c.phone_number}</td>
                  <td>{c.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminSection>
  );
};

export default AdminCustomers;
