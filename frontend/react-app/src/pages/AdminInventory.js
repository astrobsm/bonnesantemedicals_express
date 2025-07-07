import React, { useEffect, useState } from 'react';
import AdminSection from '../components/AdminSection';
import './AdminInventory.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/inventory/stock-level`);
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();
        setInventory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <AdminSection title="Inventory">
      <div className="admin-inventory-list">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && inventory.length === 0 && <p>No inventory records found.</p>}
        {!loading && !error && inventory.length > 0 && (
          <table className="admin-inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock Level</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id || item.sku}>
                  <td>{item.product_name || item.name}</td>
                  <td>{item.sku || '-'}</td>
                  <td>{item.stock_level}</td>
                  <td>{item.unit || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminSection>
  );
};

export default AdminInventory;
