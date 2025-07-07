import React, { useState, useEffect } from 'react';
import './StockIntake.css';

const StockIntake = () => {
    const [products, setProducts] = useState([]);
    const [staff, setStaff] = useState([]);
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        intakeDate: '',
        expiryDate: '',
        staffId: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        const fetchStaff = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/staff');
                const data = await response.json();
                setStaff(data);
            } catch (error) {
                console.error('Error fetching staff:', error);
            }
        };

        fetchProducts();
        fetchStaff();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch('http://localhost:8000/api/v1/stock-intake', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                data = {};
            }
            if (response.ok) {
                setMessage('Stock intake recorded successfully!');
                setFormData({
                    productId: '',
                    quantity: '',
                    intakeDate: '',
                    expiryDate: '',
                    staffId: ''
                });
            } else {
                let errorMsg = 'Failed to record stock intake.';
                if (data.detail) {
                    if (typeof data.detail === 'string') {
                        errorMsg = data.detail;
                    } else if (Array.isArray(data.detail)) {
                        errorMsg = data.detail.map(d => d.msg || JSON.stringify(d)).join('; ');
                    } else if (typeof data.detail === 'object') {
                        errorMsg = JSON.stringify(data.detail);
                    }
                }
                setMessage(errorMsg);
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stock-intake-container">
            <h1>Product Stock Intake</h1>
            <form onSubmit={handleSubmit} className="stock-intake-form">
                <label>
                    Select Product:
                    <select name="productId" value={formData.productId} onChange={handleInputChange} required>
                        <option value="">--Select Product--</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Quantity:
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Date of Intake:
                    <input
                        type="date"
                        name="intakeDate"
                        value={formData.intakeDate}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Expiry Date:
                    <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Intake Staff:
                    <select name="staffId" value={formData.staffId} onChange={handleInputChange} required>
                        <option value="">--Select Staff--</option>
                        {staff.map((staffMember) => (
                            <option key={staffMember.id} value={staffMember.id}>{staffMember.name}</option>
                        ))}
                    </select>
                </label>
                <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
            </form>
            {message && <div className={message.includes('success') ? 'success' : 'error'} style={{marginTop:'1rem'}}>{message}</div>}
        </div>
    );
};

export default StockIntake;