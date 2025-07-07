import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import './Registration.css';
import { saveFormData } from '../db/indexedDB';
import WebAuthnButton from '../components/WebAuthnButton';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const Registration = () => {
    const [formData, setFormData] = useState({
        type: 'staff',
        additionalFields: {},
    });
    const [message, setMessage] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [qrCodeData, setQrCodeData] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/suppliers`);
                const data = await response.json();
                setSuppliers(data);
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };

        fetchSuppliers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAdditionalFieldsChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            additionalFields: { ...formData.additionalFields, [name]: value },
        });
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            let endpoint = '';
            let payload = {};
            const type = formData.type;
            const fields = formData.additionalFields;
            // Map frontend fields to backend payloads and endpoints
            switch (type) {
                case 'staff':
                    endpoint = `${API_BASE_URL}/registration/staff-profile`;
                    payload = {
                        name: fields.staffName,
                        staff_id: fields.staffId || `ASTRO${Math.floor(1000 + Math.random() * 9000)}`,
                        dob: fields.dob,
                        gender: fields.gender,
                        phone: fields.phone,
                        address: fields.address,
                        bank: fields.bankName,
                        account_number: fields.accountNumber,
                        hourly_rate: fields.hourlyRate ? parseFloat(fields.hourlyRate) : 0,
                        role: fields.role || 'staff',
                        department: fields.department,
                        appointment_type: fields.appointmentType,
                    };
                    break;
                case 'product':
                    endpoint = `${API_BASE_URL}/registration/product`;
                    payload = {
                        name: fields.productName,
                        product_id: fields.productId || undefined,
                        description: fields.productDescription,
                        uom: fields.unitOfMeasure,
                        source: fields.source || '',
                        unit_price: fields.unitPrice ? parseFloat(fields.unitPrice) : 0,
                        reorder_point: fields.reorderPoint ? parseInt(fields.reorderPoint) : 0,
                        opening_stock: fields.openingStockQuantity ? parseInt(fields.openingStockQuantity) : 0,
                    };
                    break;
                case 'raw_material':
                    endpoint = `${API_BASE_URL}/registration/raw-material`;
                    payload = {
                        name: fields.rawMaterialName,
                        rm_id: fields.rawMaterialId || undefined,
                        category: fields.category || '',
                        source: fields.source || '',
                        uom: fields.unitOfMeasure,
                        reorder_point: fields.reorderPoint ? parseInt(fields.reorderPoint) : 0,
                        unit_cost: fields.unitPrice ? parseFloat(fields.unitPrice) : 0,
                        opening_stock: fields.openingStockQuantity ? parseInt(fields.openingStockQuantity) : 0,
                    };
                    break;
                case 'customer':
                    endpoint = `${API_BASE_URL}/registration/customer`;
                    payload = {
                        name: fields.customerName,
                        company: fields.company || '',
                        phone: fields.phoneNumber,
                        address: fields.address || '',
                    };
                    break;
                case 'warehouse':
                    endpoint = `${API_BASE_URL}/registration/warehouse`;
                    payload = {
                        name: fields.warehouseName,
                        wh_id: fields.warehouseId || `WH${Math.floor(1000 + Math.random() * 9000)}`,
                        location: fields.location,
                        manager_name: fields.manager,
                        manager_phone: fields.managerPhone,
                        date_created: new Date().toISOString().split('T')[0],
                    };
                    break;
                case 'supplier':
                    endpoint = `${API_BASE_URL}/registration/supplier`;
                    payload = {
                        name: fields.supplierName,
                        phone: fields.contactPhone, // use the correct field from the form
                        country: fields.country || '',
                        state: fields.state || '',
                    };
                    break;
                case 'distributor':
                    endpoint = `${API_BASE_URL}/registration/distributor`;
                    payload = {
                        name: fields.distributorName,
                        dist_id: fields.distributorId || `DIST${Math.floor(1000 + Math.random() * 9000)}`,
                        phone: fields.phoneNumber,
                        coverage: fields.region,
                        address: fields.address || '',
                    };
                    break;
                case 'marketer':
                    endpoint = `${API_BASE_URL}/registration/marketer`;
                    payload = {
                        name: fields.marketerName,
                        mark_id: fields.marketerId || `MARK${Math.floor(1000 + Math.random() * 9000)}`,
                        coverage: fields.region || '',
                        phone: fields.phoneNumber,
                        email: fields.email || '',
                    };
                    break;
                default:
                    setMessage('Invalid registration type.');
                    setLoading(false);
                    return;
            }
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            let data;
            let errorMsg = '';
            try {
                data = await response.json();
            } catch (jsonErr) {
                data = {};
                errorMsg = 'Invalid server response.';
            }
            if (response.ok) {
                setMessage('Registration successful!');
                setQrCodeData(JSON.stringify(payload));
                await saveFormData(payload);
                setFormData({ type: 'staff', additionalFields: {} });
                setLoading(false);
            } else {
                if (!errorMsg) errorMsg = 'Registration failed. Please try again.';
                if (data.detail) {
                    if (typeof data.detail === 'string') {
                        errorMsg = data.detail;
                    } else if (Array.isArray(data.detail)) {
                        errorMsg = data.detail.map(d => d.msg || JSON.stringify(d)).join('; ');
                    } else if (typeof data.detail === 'object') {
                        errorMsg = JSON.stringify(data.detail);
                    }
                } else if (data.message) {
                    errorMsg = data.message;
                }
                setMessage(errorMsg);
                setLoading(false);
            }
        } catch (error) {
            let errorMsg = 'An error occurred. Please try again.';
            if (error && error.message) {
                errorMsg = `Network or server error: ${error.message}`;
            }
            setMessage(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <h1>Registration</h1>
            <form onSubmit={handleSubmit} className="registration-form">
                <label>
                    Type:
                    <select
                        name="type"
                        value={formData.type || ''}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="staff">Staff</option>
                        <option value="product">Product</option>
                        <option value="raw_material">Raw Material</option>
                        <option value="customer">Customer</option>
                        <option value="warehouse">Warehouse</option>
                        <option value="supplier">Supplier</option>
                        <option value="distributor">Distributor</option>
                        <option value="marketer">Marketer</option>
                    </select>
                </label>
                {formData.type === 'staff' && (
                    <div>
                        <label>
                            Staff Name:
                            <input
                                type="text"
                                name="staffName"
                                value={formData.additionalFields?.staffName || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Staff ID (Auto-generated):
                            <input
                                type="text"
                                name="staffId"
                                value={`ASTRO${Math.floor(1000 + Math.random() * 9000)}`}
                                readOnly
                            />
                        </label>
                        <label>
                            Date of Birth:
                            <input
                                type="date"
                                name="dob"
                                value={formData.additionalFields?.dob || ''}
                                onChange={(e) => {
                                    handleAdditionalFieldsChange(e);
                                    setFormData((prev) => ({
                                        ...prev,
                                        additionalFields: {
                                            ...prev.additionalFields,
                                            dob: e.target.value,
                                            age: calculateAge(e.target.value),
                                        },
                                    }));
                                }}
                                required
                            />
                        </label>
                        <label>
                            Age (Auto-calculated):
                            <input
                                type="number"
                                name="age"
                                value={formData.additionalFields.age || ''}
                                readOnly
                            />
                        </label>
                        <label>
                            Gender:
                            <select
                                name="gender"
                                value={formData.additionalFields?.gender || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </label>
                        <label>
                            Contact Phone Number:
                            <input
                                type="text"
                                name="phone"
                                value={formData.additionalFields?.phone || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Address:
                            <input
                                type="text"
                                name="address"
                                value={formData.additionalFields?.address || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Bank Name:
                            <input
                                type="text"
                                name="bankName"
                                value={formData.additionalFields?.bankName || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Account Number:
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.additionalFields?.accountNumber || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Hourly Rate:
                            <input
                                type="number"
                                name="hourlyRate"
                                value={formData.additionalFields?.hourlyRate || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </label>
                        <label>
                            Department:
                            <input
                                type="text"
                                name="department"
                                value={formData.additionalFields?.department || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Appointment Type:
                            <input
                                type="text"
                                name="appointmentType"
                                value={formData.additionalFields?.appointmentType || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                    </div>
                )}
                {formData.type === 'product' && (
                    <div>
                        <label>
                            Product Name:
                            <input
                                type="text"
                                name="productName"
                                value={formData.additionalFields?.productName || ''}
                                onChange={e => {
                                    handleAdditionalFieldsChange(e);
                                    // Auto-generate Product ID when product name is entered
                                    const name = e.target.value || '';
                                    if (name) {
                                        const id = `PRD${name.replace(/\s+/g, '').toUpperCase().slice(0,6)}${Math.floor(1000 + Math.random() * 9000)}`;
                                        setFormData(prev => ({
                                            ...prev,
                                            additionalFields: {
                                                ...prev.additionalFields,
                                                productId: id
                                            }
                                        }));
                                    } else {
                                        setFormData(prev => ({
                                            ...prev,
                                            additionalFields: {
                                                ...prev.additionalFields,
                                                productId: ''
                                            }
                                        }));
                                    }
                                }}
                                required
                            />
                        </label>
                        <label>
                            Product ID:
                            <input
                                type="text"
                                name="productId"
                                value={formData.additionalFields?.productId || ''}
                                readOnly
                            />
                        </label>
                        <label>
                            Product Description:
                            <textarea
                                name="productDescription"
                                value={formData.additionalFields?.productDescription || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Unit of Measure:
                            <input
                                type="text"
                                name="unitOfMeasure"
                                value={formData.additionalFields?.unitOfMeasure || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Source:
                            <input
                                type="text"
                                name="source"
                                value={formData.additionalFields?.source || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Unit Price:
                            <input
                                type="number"
                                name="unitPrice"
                                value={formData.additionalFields?.unitPrice || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </label>
                        <label>
                            Reorder Point:
                            <input
                                type="number"
                                name="reorderPoint"
                                value={formData.additionalFields?.reorderPoint || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                                min="0"
                            />
                        </label>
                        <label>
                            Opening Stock Quantity:
                            <input
                                type="number"
                                name="openingStockQuantity"
                                value={formData.additionalFields?.openingStockQuantity || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                                min="0"
                            />
                        </label>
                    </div>
                )}
                {formData.type === 'raw_material' && (
                    <div>
                        <label>
                            Raw Material Name:
                            <input
                                type="text"
                                name="rawMaterialName"
                                value={formData.additionalFields?.rawMaterialName || ''}
                                onChange={e => {
                                    handleAdditionalFieldsChange(e);
                                    // Auto-generate Raw Material ID when raw material name is entered
                                    const name = e.target.value || '';
                                    if (name) {
                                        const id = `RAW${name.replace(/\s+/g, '').toUpperCase().slice(0,6)}${Math.floor(1000 + Math.random() * 9000)}`;
                                        setFormData(prev => ({
                                            ...prev,
                                            additionalFields: {
                                                ...prev.additionalFields,
                                                rawMaterialId: id
                                            }
                                        }));
                                    } else {
                                        setFormData(prev => ({
                                            ...prev,
                                            additionalFields: {
                                                ...prev.additionalFields,
                                                rawMaterialId: ''
                                            }
                                        }));
                                    }
                                }}
                                required
                            />
                        </label>
                        <label>
                            Raw Material ID:
                            <input
                                type="text"
                                name="rawMaterialId"
                                value={formData.additionalFields?.rawMaterialId || ''}
                                readOnly
                            />
                        </label>
                        <label>
                            Category:
                            <select
                                name="category"
                                value={formData.additionalFields?.category || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="ACTIVE AGENT">ACTIVE AGENT</option>
                                <option value="BASE">BASE</option>
                                <option value="PACKAGING">PACKAGING</option>
                                <option value="CARRIER">CARRIER</option>
                            </select>
                        </label>
                        <label>
                            Source:
                            <input
                                type="text"
                                name="source"
                                value={formData.additionalFields?.source || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Unit of Measure:
                            <input
                                type="text"
                                name="unitOfMeasure"
                                value={formData.additionalFields?.unitOfMeasure || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Unit Cost:
                            <input
                                type="number"
                                name="unitPrice"
                                value={formData.additionalFields?.unitPrice || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </label>
                        <label>
                            Reorder Point:
                            <input
                                type="number"
                                name="reorderPoint"
                                value={formData.additionalFields?.reorderPoint || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                                min="0"
                            />
                        </label>
                        <label>
                            Opening Stock Quantity:
                            <input
                                type="number"
                                name="openingStockQuantity"
                                value={formData.additionalFields?.openingStockQuantity || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                                min="0"
                            />
                        </label>
                    </div>
                )}
                {formData.type === 'customer' && (
                    <div>
                        <label>
                            Customer Name:
                            <input
                                type="text"
                                name="customerName"
                                value={formData.additionalFields?.customerName || ''}
                                onChange={e => {
                                    handleAdditionalFieldsChange(e);
                                    // Auto-generate Customer ID when customer name is entered
                                    const name = e.target.value || '';
                                    if (name) {
                                        const id = `CUS${name.replace(/\s+/g, '').toUpperCase().slice(0,6)}${Math.floor(1000 + Math.random() * 9000)}`;
                                        setFormData(prev => ({
                                            ...prev,
                                            additionalFields: {
                                                ...prev.additionalFields,
                                                customerId: id
                                            }
                                        }));
                                    } else {
                                        setFormData(prev => ({
                                            ...prev,
                                            additionalFields: {
                                                ...prev.additionalFields,
                                                customerId: ''
                                            }
                                        }));
                                    }
                                }}
                                required
                            />
                        </label>
                        <label>
                            Customer ID:
                            <input
                                type="text"
                                name="customerId"
                                value={formData.additionalFields?.customerId || ''}
                                readOnly
                            />
                        </label>
                        <label>
                            Company (Optional):
                            <input
                                type="text"
                                name="company"
                                value={formData.additionalFields?.company || ''}
                                onChange={handleAdditionalFieldsChange}
                            />
                        </label>
                        <label>
                            Phone Number:
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.additionalFields?.phoneNumber || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Address:
                            <input
                                type="text"
                                name="address"
                                value={formData.additionalFields?.address || ''}
                                onChange={handleAdditionalFieldsChange}
                            />
                        </label>
                    </div>
                )}
                {formData.type === 'warehouse' && (
                    <div>
                        <label>
                            Warehouse Name:
                            <input
                                type="text"
                                name="warehouseName"
                                value={formData.additionalFields?.warehouseName || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Warehouse ID (Auto-generated):
                            <input
                                type="text"
                                name="warehouseId"
                                value={formData.additionalFields?.warehouseId || `WH${Math.floor(1000 + Math.random() * 9000)}`}
                                readOnly
                            />
                        </label>
                        <label>
                            Location:
                            <input
                                type="text"
                                name="location"
                                value={formData.additionalFields?.location || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Manager Name:
                            <input
                                type="text"
                                name="manager"
                                value={formData.additionalFields?.manager || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Manager Phone Number:
                            <input
                                type="text"
                                name="managerPhone"
                                value={formData.additionalFields?.managerPhone || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                    </div>
                )}
                {formData.type === 'supplier' && (
                    <div>
                        <label>
                            Supplier Name:
                            <input
                                type="text"
                                name="supplierName"
                                value={formData.additionalFields?.supplierName || ''}
                                onChange={e => {
                                    handleAdditionalFieldsChange(e);
                                    // Auto-generate Supplier ID when supplier name is entered
                                    const name = e.target.value || '';
                                    if (name) {
                                        const id = `SUP${name.replace(/\s+/g, '').toUpperCase().slice(0,6)}${Math.floor(1000 + Math.random() * 9000)}`;
                                        setFormData(prev => ({
                                            ...prev,
                                            additionalFields: {
                                                ...prev.additionalFields,
                                                supplierId: id
                                            }
                                        }));
                                    } else {
                                        setFormData(prev => ({
                                            ...prev,
                                            additionalFields: {
                                                ...prev.additionalFields,
                                                supplierId: ''
                                            }
                                        }));
                                    }
                                }}
                                required
                            />
                        </label>
                        <label>
                            Supplier ID:
                            <input
                                type="text"
                                name="supplierId"
                                value={formData.additionalFields?.supplierId || ''}
                                readOnly
                            />
                        </label>
                        <label>
                            Contact Phone Number:
                            <input
                                type="text"
                                name="contactPhone"
                                value={formData.additionalFields?.contactPhone || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Country:
                            <input
                                type="text"
                                name="country"
                                value={formData.additionalFields?.country || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            State:
                            <input
                                type="text"
                                name="state"
                                value={formData.additionalFields?.state || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                    </div>
                )}
                {formData.type === 'distributor' && (
                    <div>
                        <label>
                            Distributor Name:
                            <input
                                type="text"
                                name="distributorName"
                                value={formData.additionalFields?.distributorName || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Distributor ID (Auto-generated):
                            <input
                                type="text"
                                name="distributorId"
                                value={formData.additionalFields?.distributorId || `DIST${Math.floor(1000 + Math.random() * 9000)}`}
                                readOnly
                            />
                        </label>
                        <label>
                            Phone Number:
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.additionalFields?.phoneNumber || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Coverage (Region):
                            <input
                                type="text"
                                name="region"
                                value={formData.additionalFields?.region || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Address:
                            <input
                                type="text"
                                name="address"
                                value={formData.additionalFields?.address || ''}
                                onChange={handleAdditionalFieldsChange}
                            />
                        </label>
                    </div>
                )}
                {formData.type === 'marketer' && (
                    <div>
                        <label>
                            Marketer Name:
                            <input
                                type="text"
                                name="marketerName"
                                value={formData.additionalFields?.marketerName || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Marketer ID (Auto-generated):
                            <input
                                type="text"
                                name="marketerId"
                                value={formData.additionalFields?.marketerId || `MARK${Math.floor(1000 + Math.random() * 9000)}`}
                                readOnly
                            />
                        </label>
                        <label>
                            Coverage (Region):
                            <input
                                type="text"
                                name="region"
                                value={formData.additionalFields?.region || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Phone Number:
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.additionalFields?.phoneNumber || ''}
                                onChange={handleAdditionalFieldsChange}
                                required
                            />
                        </label>
                        <label>
                            Email Address:
                            <input
                                type="email"
                                name="email"
                                value={formData.additionalFields?.email || ''}
                                onChange={handleAdditionalFieldsChange}
                            />
                        </label>
                    </div>
                )}
                <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
            </form>
            {message && <div className={message.includes('success') ? 'success' : 'error'} style={{marginTop:'1rem'}}>{message}</div>}
            {qrCodeData && (
                <div className="qr-code">
                    <h3>QR Code:</h3>
                    <QRCodeCanvas value={qrCodeData} />
                </div>
            )}
        </div>
    );
};

export default Registration;