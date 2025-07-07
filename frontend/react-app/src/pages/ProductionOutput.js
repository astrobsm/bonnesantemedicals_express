import React, { useEffect, useState } from 'react';
import './ProductionOutput.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ProductionOutput = () => {
    const [products, setProducts] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [goodProducts, setGoodProducts] = useState(0);
    const [damagedProducts, setDamagedProducts] = useState(0);
    const [efficiency, setEfficiency] = useState(0);
    const [participatingStaff, setParticipatingStaff] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProductsAndStaff = async () => {
            try {
                const productResponse = await fetch(`${API_BASE_URL}/products`);
                const staffResponse = await fetch(`${API_BASE_URL}/staff`);

                if (!productResponse.ok || !staffResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                setProducts(await productResponse.json());
                setStaff(await staffResponse.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchProductsAndStaff();
    }, []);

    const calculateEfficiency = () => {
        const totalProducts = goodProducts + damagedProducts;
        if (totalProducts > 0) {
            setEfficiency(((goodProducts / totalProducts) * 100).toFixed(2));
        } else {
            setEfficiency(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/production-output`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: selectedProduct,
                    goodProducts,
                    damagedProducts,
                    efficiency,
                    participatingStaff
                })
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                data = {};
            }

            if (response.ok) {
                setMessage('Production output recorded successfully!');
                setSelectedProduct('');
                setGoodProducts(0);
                setDamagedProducts(0);
                setEfficiency(0);
                setParticipatingStaff([]);
            } else {
                let errorMsg = 'Failed to record production output.';
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
        <div className="production-output-container">
            <h1>Production Output</h1>
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
                <label>
                    Good Products:
                    <input
                        type="number"
                        value={goodProducts}
                        onChange={(e) => setGoodProducts(e.target.value)}
                        onBlur={calculateEfficiency}
                        required
                    />
                </label>
                <label>
                    Damaged Products:
                    <input
                        type="number"
                        value={damagedProducts}
                        onChange={(e) => setDamagedProducts(e.target.value)}
                        onBlur={calculateEfficiency}
                        required
                    />
                </label>
                <label>
                    Efficiency: {efficiency}%
                </label>
                <label>
                    Participating Staff:
                    <select
                        multiple
                        value={participatingStaff}
                        onChange={(e) => setParticipatingStaff([...e.target.selectedOptions].map(option => option.value))}
                    >
                        {staff.map((member) => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>
                </label>
                <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
            </form>
            {message && <div className={message.includes('success') ? 'success' : 'error'} style={{marginTop:'1rem'}}>{message}</div>}
        </div>
    );
};

export default ProductionOutput;