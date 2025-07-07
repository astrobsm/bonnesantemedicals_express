import React, { useEffect, useState } from 'react';
import './Inventory.css';
import API_BASE_URL from '../config';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error('API did not return an array:', data);
                    setProducts([]); // Fallback to an empty array
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]); // Fallback to an empty array
            }
        };

        const fetchRawMaterials = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/inventory/raw-materials`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setRawMaterials(data);
                } else {
                    console.error('API did not return an array:', data);
                    setRawMaterials([]); // Fallback to an empty array
                }
            } catch (error) {
                console.error('Error fetching raw materials:', error);
                setRawMaterials([]); // Fallback to an empty array
            }
        };

        fetchProducts();
        fetchRawMaterials();
    }, []);

    return (
        <div className="inventory-container">
            <h1>Inventory</h1>
            <div className="inventory-section">
                <h2>Products</h2>
                <ul>
                    {products.map((product) => (
                        <li key={product.id}>{product.name} - {product.unit_price}</li>
                    ))}
                </ul>
            </div>
            <div className="inventory-section">
                <h2>Raw Materials</h2>
                <ul>
                    {rawMaterials.map((material) => (
                        <li key={material.id}>{material.name} - {material.unit_cost}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Inventory;