import React, { useEffect, useState } from 'react';
import './RegisterProductionRequirement.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ProductionRequirementsList = ({ onEdit }) => {
    const [requirements, setRequirements] = useState([]);
    const [products, setProducts] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                let reqRes = await fetch(`${API_BASE_URL}/production-requirements`);
                if (reqRes.status === 405 || reqRes.status === 404) {
                    reqRes = await fetch(`${API_BASE_URL}/production-requirements/`);
                }
                const [prodRes, matRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/inventory/products`),
                    fetch(`${API_BASE_URL}/inventory/raw-materials`),
                ]);
                if (!reqRes.ok) throw new Error('Failed to fetch requirements: ' + reqRes.status);
                if (!prodRes.ok) throw new Error('Failed to fetch products: ' + prodRes.status);
                if (!matRes.ok) throw new Error('Failed to fetch raw materials: ' + matRes.status);
                setRequirements(await reqRes.json());
                setProducts(await prodRes.json());
                setRawMaterials(await matRes.json());
            } catch (err) {
                setError('Could not load production requirements. ' + err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const getProductName = (id) => {
        const found = products.find((p) => String(p.id) === String(id));
        return found ? found.name : id;
    };
    const getRawMaterialName = (id) => {
        const found = rawMaterials.find((m) => String(m.id) === String(id));
        return found ? found.name : id;
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this production requirement?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/production-requirements/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Delete failed');
            setRequirements(requirements.filter(r => r.id !== id));
        } catch (err) {
            setError('Delete failed.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    return (
        <div className="production-requirements-list">
            <h2>Production Requirements List</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Raw Materials</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requirements.map(req => (
                        <tr key={req.id}>
                            <td>{req.id}</td>
                            <td>{getProductName(req.productId)}</td>
                            <td>
                                {req.requirements.map((item, idx) => (
                                    <div key={idx}>{getRawMaterialName(item.rawMaterialId)} (Qty: {item.quantity})</div>
                                ))}
                            </td>
                            <td>
                                <button onClick={() => onEdit(req)}>Edit</button>
                                <button onClick={() => handleDelete(req.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductionRequirementsList;
