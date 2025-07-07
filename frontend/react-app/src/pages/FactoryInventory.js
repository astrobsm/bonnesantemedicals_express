import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './FactoryInventory.css';
import API_BASE_URL from '../config';

const FactoryInventory = () => {
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/suppliers`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setSuppliers(data);
                } else {
                    console.error('Unexpected response format:', data);
                    setSuppliers([]);
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error);
                setSuppliers([]);
            }
        };

        fetchSuppliers();
    }, []);

    return (
        <div className="factory-inventory-container">
            <h1>Factory Inventory</h1>
            <div className="inventory-buttons">
                <Link to="/factory-inventory/device-intake" className="awesome-button">Device Intake</Link>
                <Link to="/factory-inventory/device-list" className="awesome-button">Device List</Link>
                <Link to="/factory-inventory/device-maintenance-log" className="awesome-button">Device Maintenance Log</Link>
            </div>
        </div>
    );
};

export default FactoryInventory;