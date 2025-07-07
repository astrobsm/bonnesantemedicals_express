import React, { useEffect, useState } from 'react';
import './RawMaterialStockIntake.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RawMaterialStockIntake = () => {
    const [rawMaterials, setRawMaterials] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [products, setProducts] = useState([]); // For mapping product IDs to names
    const [formData, setFormData] = useState({
        rawMaterialId: '',
        quantity: '',
        supplier: '',
        expiryDate: '',
        dateOfIntake: '',
        intakeStaff: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rawMaterialResponse = await fetch(`${API_BASE_URL}/inventory/raw-materials`);
                const supplierResponse = await fetch(`${API_BASE_URL}/suppliers`);
                const staffResponse = await fetch(`${API_BASE_URL}/staff`);
                const productResponse = await fetch(`${API_BASE_URL}/inventory/products`);

                if (!rawMaterialResponse.ok || !supplierResponse.ok || !staffResponse.ok || !productResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                setRawMaterials(await rawMaterialResponse.json());
                setSuppliers(await supplierResponse.json());
                setStaff(await staffResponse.json());
                setProducts(await productResponse.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
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
            const response = await fetch(`${API_BASE_URL}/raw-material-stock-intake`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                data = {};
            }

            if (response.ok) {
                setMessage('Raw material stock intake recorded successfully!');
                setFormData({
                    rawMaterialId: '',
                    quantity: '',
                    supplier: '',
                    expiryDate: '',
                    dateOfIntake: '',
                    intakeStaff: ''
                });
            } else {
                let errorMsg = 'Failed to record raw material stock intake.';
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

    // Helper functions to get names by ID
    const getRawMaterialName = (id) => {
        const found = rawMaterials.find((m) => String(m.id) === String(id));
        return found ? found.name : id;
    };
    const getSupplierName = (id) => {
        const found = suppliers.find((s) => String(s.id) === String(id));
        return found ? found.name : id;
    };
    const getStaffName = (id) => {
        const found = staff.find((s) => String(s.id) === String(id));
        return found ? found.name : id;
    };
    const getProductName = (id) => {
        const found = products.find((p) => String(p.id) === String(id));
        return found ? found.name : id;
    };

    return (
        <div className="raw-material-stock-intake-container">
            <h1>Raw Material Stock Intake</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Raw Material ID:
                    <select name="rawMaterialId" value={formData.rawMaterialId} onChange={handleInputChange} required>
                        <option value="">Select Raw Material</option>
                        {rawMaterials.map((material) => (
                            <option key={material.id} value={material.id}>{material.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Quantity:
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
                </label>
                <label>
                    Supplier:
                    <select name="supplier" value={formData.supplier} onChange={handleInputChange} required>
                        <option value="">Select Supplier</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Expiry Date:
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required />
                </label>
                <label>
                    Date of Intake:
                    <input type="date" name="dateOfIntake" value={formData.dateOfIntake} onChange={handleInputChange} required />
                </label>
                <label>
                    Intake Staff:
                    <select name="intakeStaff" value={formData.intakeStaff} onChange={handleInputChange} required>
                        <option value="">Select Staff</option>
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

export default RawMaterialStockIntake;