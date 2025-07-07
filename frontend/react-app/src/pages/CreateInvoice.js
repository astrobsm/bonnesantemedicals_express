import React, { useEffect, useState } from 'react';
import '../CreateInvoice.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CreateInvoice = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ product_id: '', quantity: 1, price: 0 }]);
  const [warehouseId, setWarehouseId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('unpaid');
  const [message, setMessage] = useState('');
  const [total, setTotal] = useState(0);
  const [userWarehouses, setUserWarehouses] = useState([]);

  useEffect(() => {
    // Fetch accessible warehouses for the current user
    fetch(`${API_BASE_URL}/access/user/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // Support both array of warehouse objects or array of ids
        if (Array.isArray(data.warehouses)) {
          setUserWarehouses(data.warehouses);
        } else if (data.warehouses && typeof data.warehouses === 'object') {
          setUserWarehouses(Object.values(data.warehouses));
        } else {
          setUserWarehouses([]);
        }
      });
    // Fetch products
    fetch(`${API_BASE_URL}/inventory/products`)
      .then(res => res.json())
      .then(setProducts);
  }, []);

  useEffect(() => {
    // Calculate total
    setTotal(items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
  }, [items]);

  const handleItemChange = (idx, field, value) => {
    setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addItem = () => setItems([...items, { product_id: '', quantity: 1, price: 0 }]);
  const removeItem = idx => setItems(items => items.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        invoice_number: `INV${Date.now()}`,
        customer_name: customerName,
        date,
        total_amount: total,
        status,
        warehouse_id: warehouseId,
        items: items.map(({ product_id, quantity, price }) => ({ product_id: Number(product_id), quantity: Number(quantity), price: Number(price) }))
      };
      const res = await fetch(`${API_BASE_URL}/invoices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (res.ok) setMessage('Invoice created successfully!');
      else setMessage('Error creating invoice.');
    } catch (err) {
      setMessage('Network error.');
    }
  };

  return (
    <div className="create-invoice-container">
      <h2>Create Invoice</h2>
      <form onSubmit={handleSubmit}>
        <label>Customer Name:
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} required />
        </label>
        <label>Date:
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </label>
        <label>Warehouse:
          <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required>
            <option value="">Select warehouse</option>
            {userWarehouses.map(w => (
              typeof w === 'object' ? (
                <option key={w.id} value={w.id}>{w.name || w.id}</option>
              ) : (
                <option key={w} value={w}>{w}</option>
              )
            ))}
          </select>
        </label>
        <h4>Items</h4>
        {items.map((item, idx) => (
          <div key={idx} style={{ marginBottom: 8, border: '1px solid #ccc', padding: 8 }}>
            <select value={item.product_id} onChange={e => handleItemChange(idx, 'product_id', e.target.value)} required>
              <option value="">Select product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} style={{ width: 60 }} required />
            <input type="number" min="0" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} style={{ width: 80 }} required />
            <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addItem}>Add Item</button>
        <div>Total: <b>{total.toFixed(2)}</b></div>
        <button type="submit">Create Invoice</button>
      </form>
      {message && <div style={{ marginTop: 16 }}>{message}</div>}
    </div>
  );
};

export default CreateInvoice;
