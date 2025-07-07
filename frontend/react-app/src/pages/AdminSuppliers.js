import React, { useEffect, useState } from 'react';
import AdminSection from '../components/AdminSection';
import './AdminSuppliers.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/suppliers`);
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        const data = await response.json();
        setSuppliers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  return (
    <AdminSection title="Suppliers">
      <div className="admin-suppliers-list">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && suppliers.length === 0 && <p>No suppliers found.</p>}
        {!loading && !error && suppliers.length > 0 && (
          <table className="admin-suppliers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Supplier ID</th>
                <th>Phone</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.supplier_id}</td>
                  <td>{s.phone_number}</td>
                  <td>{s.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminSection>
  );
};

export default AdminSuppliers;
