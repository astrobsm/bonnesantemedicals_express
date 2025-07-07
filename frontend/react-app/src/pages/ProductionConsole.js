import React, { useEffect, useState } from 'react';
import './ProductionConsole.css';
import API_BASE_URL from '../config';

const ProductionConsole = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantityToProduce, setQuantityToProduce] = useState(0);
    const [requiredMaterials, setRequiredMaterials] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Remove duplicate /api/v1 if API_BASE_URL already includes it
                let url = `${API_BASE_URL}/products/`;
                // If API_BASE_URL does not end with /api/v1, add it
                if (!API_BASE_URL.endsWith('/api/v1') && !API_BASE_URL.endsWith('/api/v1/')) {
                    url = `${API_BASE_URL}/api/v1/products/`;
                }
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                setProducts(await response.json());
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    const calculateMaterials = async () => {
        if (!selectedProduct || !quantityToProduce) return;
        try {
            const response = await fetch(`${API_BASE_URL}/production-console/calculate-materials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: Number(selectedProduct), quantity: Number(quantityToProduce) })
            });
            if (!response.ok) throw new Error('Failed to calculate materials');
            const data = await response.json();
            setRequiredMaterials(data.materials || []);
        } catch (error) {
            setRequiredMaterials([]);
            console.error('Error calculating materials:', error);
        }
    };

    useEffect(() => {
        if (selectedProduct && quantityToProduce > 0) {
            calculateMaterials();
        } else {
            setRequiredMaterials([]);
        }
    }, [selectedProduct, quantityToProduce]);

    const handleApproveAndExport = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/production-console/approve-production`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: Number(selectedProduct), quantity: Number(quantityToProduce) })
            });
            if (!response.ok) throw new Error('Failed to approve production');
            const data = await response.json();
            alert(data.message || 'Production approved and stock updated!');
            setRequiredMaterials([]);
        } catch (error) {
            alert('Failed to approve production. Please try again.');
        }
    };

    return (
        <div className="production-console-container">
            <h1>Production Console</h1>
            <form onSubmit={(e) => { e.preventDefault(); calculateMaterials(); }}>
                <label>
                    Product:
                    <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required>
                        <option value="">Select a product</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Quantity to Produce:
                    <input
                        type="number"
                        value={quantityToProduce}
                        onChange={(e) => setQuantityToProduce(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Calculate Materials</button>
            </form>
            {requiredMaterials.length > 0 && (
                <div className="required-materials">
                    <h2>Required Materials</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Raw Material</th>
                                <th>Quantity Needed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requiredMaterials.map((material, index) => (
                                <tr key={index}>
                                    <td>{material.raw_material_name}</td>
                                    <td>{material.quantity_needed}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={handleApproveAndExport}>Approve and Deduct Stock</button>
                </div>
            )}
        </div>
    );
};

export default ProductionConsole;