import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import './WarehouseTransfer.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

const WarehouseTransfer = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/warehouses`).then(res => res.json()).then(setWarehouses);
    apiFetch(`${API_BASE_URL}/products`).then(res => res.json()).then(setProducts);
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!fromWarehouse || !toWarehouse || !productId || !quantity) {
      setMessage('All fields are required.');
      return;
    }
    if (fromWarehouse === toWarehouse) {
      setMessage('Source and destination warehouses must be different.');
      return;
    }
    try {
      const res = await apiFetch(`${API_BASE_URL}/warehouse-transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_warehouse_id: fromWarehouse,
          to_warehouse_id: toWarehouse,
          product_id: productId,
          quantity: Number(quantity)
        })
      });
      if (res.ok) {
        setMessage('Transfer successful!');
      } else {
        const err = await res.json();
        setMessage(err.detail || 'Transfer failed.');
      }
    } catch (e) {
      setMessage('Transfer failed.');
    }
  };

  return (
    <div className="warehouse-transfer-container">
      <h2>Warehouse Product Transfer</h2>
      <form onSubmit={handleTransfer} className="warehouse-transfer-form">
        <label>From Warehouse:
          <select value={fromWarehouse} onChange={e => setFromWarehouse(e.target.value)}>
            <option value="">Select</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name || w.id}</option>)}
          </select>
        </label>
        <label>To Warehouse:
          <select value={toWarehouse} onChange={e => setToWarehouse(e.target.value)}>
            <option value="">Select</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name || w.id}</option>)}
          </select>
        </label>
        <label>Product:
          <select value={productId} onChange={e => setProductId(e.target.value)}>
            <option value="">Select</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
          </select>
        </label>
        <label>Quantity:
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
        </label>
        <button type="submit">Transfer</button>
      </form>
      {message && <div className="warehouse-transfer-message">{message}</div>}
    </div>
  );
};

export default WarehouseTransfer;
