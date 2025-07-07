import React, { useState, useEffect } from 'react';
import './DeviceIntake.css';
import API_BASE_URL from '../config';

// Helper to generate ASTROxxxx device ID
function generateAstroId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `ASTRO${randomNum}`;
}

const DeviceIntake = () => {
    const [deviceData, setDeviceData] = useState({
        deviceName: '',
        serialNumber: '',
        quantity: 0,
        functions: [],
        dateOfIntake: '',
        cost: 0,
        staffId: '',
        usefulLife: 0,
        depreciationRate: 0,
    });
    const [staffList, setStaffList] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/staff`);
                const data = await response.json();
                console.log('Fetched staff:', data); // Debugging log
                setStaffList(Array.isArray(data) ? data : []); // Ensure staffList is always an array
            } catch (error) {
                console.error('Error fetching staff:', error);
                setStaffList([]); // Fallback to an empty array
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products`);
                const data = await response.json();
                console.log('Fetched products:', data); // Debugging log
                setProducts(Array.isArray(data) ? data : []); // Ensure products is always an array
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]); // Fallback to an empty array
            }
        };

        fetchStaff();
        fetchProducts();
    }, []);

    useEffect(() => {
        if (deviceData.deviceName) {
            setDeviceData((prev) => ({ ...prev, serialNumber: generateAstroId() }));
        }
        // eslint-disable-next-line
    }, [deviceData.deviceName]);

    const handleInputChange = (e) => {
        const { name, value, type, multiple, options } = e.target;
        if (name === 'functions' && multiple) {
            // Handle multiple select for functions
            const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
            setDeviceData({ ...deviceData, functions: selected });
        } else {
            setDeviceData({ ...deviceData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: deviceData.deviceName,
                    serial_number: deviceData.serialNumber,
                    quantity: deviceData.quantity,
                    functions: deviceData.functions,
                    date_of_intake: deviceData.dateOfIntake,
                    cost: deviceData.cost,
                    staff_id: deviceData.staffId,
                    useful_life: deviceData.usefulLife,
                    depreciation_rate: deviceData.depreciationRate
                }),
            });
            if (!response.ok) throw new Error('Failed to submit device');
            const data = await response.json();
            alert(data.message || 'Device intake recorded successfully!');
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="device-intake-container">
            <h1>Device Intake</h1>
            <form onSubmit={handleSubmit} className="device-intake-form">
                <label>
                    Device Name:
                    <input
                        type="text"
                        name="deviceName"
                        value={deviceData.deviceName}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Device ID (Auto-generated):
                    <input
                        type="text"
                        name="serialNumber"
                        value={deviceData.serialNumber}
                        readOnly
                    />
                </label>
                <label>
                    Quantity:
                    <input
                        type="number"
                        name="quantity"
                        value={deviceData.quantity}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Functions:
                    <select
                        name="functions"
                        value={deviceData.functions}
                        onChange={handleInputChange}
                        multiple
                    >
                        {products.map((product) => (
                            <option key={product.id} value={product.name}>{product.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Date of Intake:
                    <input
                        type="date"
                        name="dateOfIntake"
                        value={deviceData.dateOfIntake}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Cost of Machine:
                    <input
                        type="number"
                        name="cost"
                        value={deviceData.cost}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Select Staff:
                    <select
                        name="staffId"
                        value={deviceData.staffId}
                        onChange={handleInputChange}
                        required
                    >
                        {staffList.map((staff) => (
                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Useful Life (years):
                    <input
                        type="number"
                        name="usefulLife"
                        value={deviceData.usefulLife}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Depreciation Rate (%):
                    <input
                        type="number"
                        name="depreciationRate"
                        value={deviceData.depreciationRate}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default DeviceIntake;