import React, { useEffect, useState } from 'react';
import './RegisterProductionRequirement.css';
import ProductionRequirementsList from './ProductionRequirementsList';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RegisterProductionRequirement = () => {
    const [products, setProducts] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [requirements, setRequirements] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showList, setShowList] = useState(false);
    const [editReq, setEditReq] = useState(null);

    useEffect(() => {
        const fetchProductsAndMaterials = async () => {
            try {
                // Fetch products from the correct inventory endpoint
                const productResponse = await fetch(`${API_BASE_URL}/inventory/products`);
                // Fetch raw materials from the correct inventory endpoint
                const materialResponse = await fetch(`${API_BASE_URL}/inventory/raw-materials`);

                if (!productResponse.ok || !materialResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                setProducts(await productResponse.json());
                setRawMaterials(await materialResponse.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchProductsAndMaterials();
    }, []);

    const handleAddRequirement = () => {
        setRequirements([...requirements, { rawMaterialId: '', quantity: '' }]);
    };

    const handleRequirementChange = (index, field, value) => {
        const updatedRequirements = [...requirements];
        updatedRequirements[index][field] = value;
        setRequirements(updatedRequirements);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            // Ensure numeric values for IDs and quantity
            const cleanRequirements = requirements.map(r => ({
                rawMaterialId: Number(r.rawMaterialId),
                quantity: Number(r.quantity)
            }));
            const payload = {
                productId: Number(selectedProduct),
                requirements: cleanRequirements
            };
            // Try both with and without trailing slash for robustness
            let response = await fetch(`${API_BASE_URL}/production-requirements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.status === 405) {
                response = await fetch(`${API_BASE_URL}/production-requirements/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                data = {};
            }

            if (!response.ok) {
                let errorMsg = 'Failed to register production requirements. Please try again.';
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
            } else {
                setMessage('Production requirements registered successfully!');
                setSelectedProduct('');
                setRequirements([]);
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-production-requirement-container">
            <h1>Register Production Requirement</h1>
            {showList ? (
                <ProductionRequirementsList onEdit={(req) => { setEditReq(req); setShowList(false); setSelectedProduct(req.productId); setRequirements(req.requirements); }} />
            ) : (
                <form onSubmit={handleSubmit}>
                    <label>
                        Product:
                        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required>
                            <option value="">Select a product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </label>
                    <div className="requirements-list">
                        {requirements.map((requirement, index) => (
                            <div key={index} className="requirement-item">
                                <select
                                    value={requirement.rawMaterialId}
                                    onChange={(e) => handleRequirementChange(index, 'rawMaterialId', e.target.value)}
                                    required
                            >
                                    <option value="">Select Raw Material</option>
                                    {rawMaterials.map((material) => (
                                        <option key={material.id} value={material.id}>{material.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={requirement.quantity}
                                    onChange={(e) => handleRequirementChange(index, 'quantity', e.target.value)}
                                    placeholder="Quantity per unit"
                                    required
                                />
                            </div>
                        ))}
                        <button type="button" onClick={handleAddRequirement}>Add Requirement</button>
                    </div>
                    <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
                </form>
            )}
            {message && <div className={message.includes('success') ? 'success' : 'error'} style={{marginTop:'1rem'}}>{message}</div>}
            <button onClick={() => setShowList(!showList)}>{showList ? 'Back to Form' : 'View Production Requirements'}</button>
        </div>
    );
};

export default RegisterProductionRequirement;