import React, { useState, useEffect } from 'react';
import './ReturnedProductEntry.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const ReturnedProductEntry = () => {
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [entries, setEntries] = useState([]);
    const [form, setForm] = useState({
        product_id: '',
        quantity: '',
        batch_no: '',
        manufacturing_date: '',
        expiry_date: '',
        date_of_return: '',
        reason: '',
        customer_id: '',
        receiving_staff_id: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE_URL}/inventory/products`).then(res => res.json()).then(setProducts);
        fetch(`${API_BASE_URL}/customers`).then(res => res.json()).then(setCustomers);
        fetch(`${API_BASE_URL}/staff`).then(res => res.json()).then(setStaff);
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const payload = {
                product_id: form.product_id,
                quantity: Number(form.quantity),
                batch_no: form.batch_no,
                manufacturing_date: form.manufacturing_date || null,
                expiry_date: form.expiry_date || null,
                date_of_return: form.date_of_return,
                reason: form.reason,
                customer_id: form.customer_id,
                receiving_staff_id: form.receiving_staff_id
            };
            const res = await fetch(`${API_BASE_URL}/returned-products/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Return entry saved!');
                setForm({ product_id: '', quantity: '', batch_no: '', manufacturing_date: '', expiry_date: '', date_of_return: '', reason: '', customer_id: '', receiving_staff_id: '' });
            } else if (data.detail) {
                if (Array.isArray(data.detail)) {
                    setMessage(data.detail.map(d => d.msg).join(', '));
                } else {
                    setMessage(data.detail);
                }
            } else {
                setMessage('Failed to save entry.');
            }
        } catch (err) {
            setMessage('Network error.');
        } finally {
            setLoading(false);
        }
    };

    const fetchEntries = async () => {
        setLoading(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/returned-products/`, {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include'
            });
            const data = await res.json();
            setEntries(Array.isArray(data) ? data : []);
        } catch (err) {
            setMessage('Failed to fetch entries.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="returned-product-entry-container">
            <h1>Returned Product Entry</h1>
            <form onSubmit={handleSubmit} className="returned-product-form">
                <label>Product:
                    <select name="product_id" value={form.product_id} onChange={handleChange} required>
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </label>
                <label>Quantity:
                    <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
                </label>
                <label>Batch Number:
                    <input name="batch_no" value={form.batch_no} onChange={handleChange} required />
                </label>
                <label>Manufacturing Date:
                    <input name="manufacturing_date" type="date" value={form.manufacturing_date} onChange={handleChange} required />
                </label>
                <label>Expiry Date:
                    <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} required />
                </label>
                <label>Date of Return:
                    <input name="date_of_return" type="date" value={form.date_of_return} onChange={handleChange} required />
                </label>
                <label>Reason for Return:
                    <input name="reason" value={form.reason} onChange={handleChange} required />
                </label>
                <label>Customer:
                    <select name="customer_id" value={form.customer_id} onChange={handleChange} required>
                        <option value="">Select Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </label>
                <label>Receiving Staff:
                    <select name="receiving_staff_id" value={form.receiving_staff_id} onChange={handleChange} required>
                        <option value="">Select Staff</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </label>
                <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Entry'}</button>
            </form>
            {message && <div style={{marginTop:16}}>{message}</div>}
            <button onClick={fetchEntries} style={{marginTop:24}}>Fetch Returned Products</button>
            <table className="returned-product-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Batch</th>
                        <th>Mfg Date</th>
                        <th>Exp Date</th>
                        <th>Date of Return</th>
                        <th>Reason</th>
                        <th>Customer</th>
                        <th>Staff</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.length === 0 && <tr><td colSpan="9">No returned products found</td></tr>}
                    {entries.map((e, i) => (
                        <tr key={i}>
                            <td>{e.product_name || e.productId}</td>
                            <td>{e.quantity}</td>
                            <td>{e.batchNumber}</td>
                            <td>{e.manufacturingDate}</td>
                            <td>{e.expiryDate}</td>
                            <td>{e.dateOfReturn}</td>
                            <td>{e.reason}</td>
                            <td>{e.customer_name || e.customerId}</td>
                            <td>{e.staff_name || e.staffId}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReturnedProductEntry;
