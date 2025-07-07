import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiFetch } from '../utils/api';
import './GenerateInvoice.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';
const LOGO_URL = '/logo192.png'; // Place your logo in public/logo192.png or update path

const GenerateInvoice = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [vat] = useState(0.5);
    const [subtotal, setSubtotal] = useState(0);
    const [vatAmount, setVatAmount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [showDownload, setShowDownload] = useState(false);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pdfType, setPdfType] = useState('');
    const [warehouses, setWarehouses] = useState([]);
    const [userWarehouses, setUserWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Always check for token and validate session
        const token = localStorage.getItem('token');
        if (!token) {
            setUserWarehouses([]);
            alert('You must be logged in to generate invoices.');
            navigate('/login');
            return;
        }
        // Use apiFetch and let it handle Authorization header for user/me
        apiFetch(`${API_BASE_URL}/auth/user/me`)
            .then(async res => {
                if (!res.ok) {
                    if (res.status === 401 || res.status === 422) {
                        localStorage.removeItem('token');
                        alert('Session expired or invalid. Please log in again.');
                        navigate('/login');
                        return Promise.reject();
                    }
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || 'Failed to fetch user info');
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data.warehouses)) {
                    setUserWarehouses(data.warehouses);
                } else if (data.warehouses && typeof data.warehouses === 'object') {
                    setUserWarehouses(Object.values(data.warehouses));
                } else {
                    setUserWarehouses([]);
                }
            })
            .catch(e => {
                setUserWarehouses([]);
            });
        // Fetch all warehouses (with correct access logic)
        apiFetch(`${API_BASE_URL}/warehouses`)
            .then(res => res.json())
            .then(setWarehouses);
    }, [API_BASE_URL, navigate]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await apiFetch(`${API_BASE_URL}/customers`);
                const data = await response.json();
                setCustomers(Array.isArray(data) ? data : []);
            } catch (error) {
                setCustomers([]);
            }
        };
        const fetchProducts = async () => {
            try {
                const response = await apiFetch(`${API_BASE_URL}/products`);
                const data = await response.json();
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                setProducts([]);
            }
        };
        fetchCustomers();
        fetchProducts();
    }, [API_BASE_URL]);

    useEffect(() => {
        // Recalculate totals whenever selectedProducts changes
        const sub = selectedProducts.reduce((sum, item) => sum + (item.quantity * (item.product?.unit_price || 0)), 0);
        const vatVal = sub * vat / 100;
        setSubtotal(sub);
        setVatAmount(vatVal);
        setTotalAmount(sub + vatVal);
    }, [selectedProducts, vat]);

    const handleAddProduct = () => {
        setSelectedProducts([...selectedProducts, { product: '', quantity: 0 }]);
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...selectedProducts];
        if (field === 'product') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            updatedProducts[index][field] = selectedProduct || '';
        } else {
            updatedProducts[index][field] = value;
        }
        setSelectedProducts(updatedProducts);
    };

    const generateInvoicePDF = async (status) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [58, 150] // 58mm width for POS/thermal printer
        });
        // Add logo (centered at top) using data URL for reliability
        let logoDataUrl = null;
        try {
            const response = await fetch(LOGO_URL);
            const blob = await response.blob();
            const reader = new window.FileReader();
            const dataUrlPromise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
            logoDataUrl = await dataUrlPromise;
            doc.addImage(logoDataUrl, 'PNG', 14, 4, 30, 12, undefined, 'FAST');
        } catch (e) {
            // If logo fails, just skip
        }
        let y = 18;
        doc.setFontSize(10);
        doc.text('Bonnesante Medicals', 29, y, { align: 'center' });
        y += 5;
        doc.setFontSize(7);
        doc.text('No 17A Isuofia/6B Peace Avenue, Federal Housing TransEkulu', 29, y, { align: 'center' });
        y += 4;
        doc.text('Bank: MONIEPOINT 8259518195 | Access 1379643548', 29, y, { align: 'center' });
        y += 4;
        doc.text('Account Name: BONNESANTE MEDICALS', 29, y, { align: 'center' });
        y += 5;
        doc.setFontSize(9);
        doc.text(status === 'paid' ? 'Payment Receipt' : 'Invoice', 29, y, { align: 'center' });
        y += 6;
        doc.setFontSize(7);
        doc.text(`Customer: ${customers.find(c => c.id === parseInt(selectedCustomer))?.name || ''}`, 4, y);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 38, y);
        y += 4;
        // Separator line
        doc.setDrawColor(150);
        doc.setLineWidth(0.3);
        doc.line(2, y, 56, y);
        y += 2;
        const tableData = selectedProducts.map((item, idx) => [
            idx + 1,
            item.product?.name?.slice(0, 12) || '',
            item.quantity,
            (item.product?.unit_price || 0).toFixed(2),
            ((item.quantity || 0) * (item.product?.unit_price || 0)).toFixed(2)
        ]);
        autoTable(doc, {
            head: [['#', 'Product', 'Qty', 'Price', 'Total']],
            body: tableData,
            startY: y,
            margin: { left: 2, right: 2 },
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [142, 68, 173], textColor: 255, halign: 'center' },
            bodyStyles: { halign: 'center' },
            theme: 'grid',
            tableWidth: 54
        });
        let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : y + tableData.length * 4;
        finalY += 2;
        // Subtotal and VAT
        doc.setFontSize(8);
        doc.text(`Subtotal: ₦${subtotal.toFixed(2)}`, 4, finalY);
        doc.text(`VAT (${vat}%): ₦${vatAmount.toFixed(2)}`, 4, finalY + 4);
        // Bold and centered total
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`TOTAL: ₦${totalAmount.toFixed(2)}`, 29, finalY + 10, { align: 'center' });
        doc.setFont(undefined, 'normal');
        // Separator line before paid
        doc.setDrawColor(150);
        doc.setLineWidth(0.3);
        doc.line(2, finalY + 12, 56, finalY + 12);
        if (status === 'paid') {
            doc.setFontSize(10);
            doc.setTextColor(0, 128, 0);
            doc.text('PAID', 29, finalY + 17, { align: 'center' });
            doc.setTextColor(0, 0, 0);
        }
        setPdfDoc(doc);
        setPdfType(status === 'paid' ? 'receipt' : 'invoice');
        setShowDownload(true);
        // Return logoDataUrl for backend usage
        return logoDataUrl;
    };

    // Helper to save invoice to backend
    const saveInvoiceToBackend = async (status, logoDataUrl = null) => {
        const now = new Date();
        const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
        // Prepare invoice payload
        const invoicePayload = {
            invoice_number: invoiceNumber,
            customer_name: customers.find(c => c.id === parseInt(selectedCustomer))?.name || '',
            total_amount: totalAmount,
            vat: vatAmount,
            status: status === 'paid' ? 'paid' : 'unpaid',
            items: selectedProducts.map(item => ({
                product_id: item.product?.id,
                quantity: item.quantity,
                price: item.product?.unit_price
            })),
            date: now.toISOString().split('T')[0],
            logo_url: logoDataUrl || LOGO_URL,
            pdf_url: null, // Optionally, set this if you upload the PDF somewhere
            warehouse_id: selectedWarehouse ? Number(selectedWarehouse) : undefined,
        };
        try {
            const response = await apiFetch(`${API_BASE_URL}/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoicePayload)
            });
            if (!response.ok) {
                const err = await response.text();
                console.error('Failed to save invoice:', err);
            }
        } catch (err) {
            console.error('Error saving invoice:', err);
        }
    };

    const handleSubmit = async (status) => {
        const logoDataUrl = await generateInvoicePDF(status);
        await saveInvoiceToBackend(status, logoDataUrl);
    };

    const handleDownload = () => {
        if (pdfDoc) {
            // Format customer name and date for filename
            const customerName = customers.find(c => c.id === parseInt(selectedCustomer))?.name?.replace(/\s+/g, '_') || 'customer';
            const dateStr = new Date().toISOString().split('T')[0];
            const baseName = pdfType === 'receipt' ? 'payment_receipt' : 'invoice';
            const fileName = `${baseName}_${customerName}_${dateStr}.pdf`;
            pdfDoc.save(fileName);
            setShowDownload(false);
        }
    };

    return (
        <div className="generate-invoice-container">
            <img src={LOGO_URL} alt="Company Logo" style={{ display: 'block', margin: '0 auto 10px', maxWidth: 100, maxHeight: 60 }} />
            <h1>Generate Invoice</h1>
            <div className="company-details">
                <h2>Bonnesante Medicals</h2>
                <p>Head Office: No 17A Isuofia/6B Peace Avenue, Federal Housing TransEkulu</p>
                <p>Bank Name: MONIEPOINT</p>
                <p>Account Name: BONNESANTE MEDICALS</p>
                <p>Account Number: 8259518195</p>
                <p>Bank Name: Access Bank</p>
                <p>Account Name: BONNESANTE MEDICALS</p>
                <p>Account Number: 1379643548</p>
            </div>
            <form onSubmit={e => e.preventDefault()}>
                <label>
                    Customer:
                    <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        required
                    >
                        <option value="">Select a customer</option>
                        {customers.length === 0 && <option disabled>No customers found</option>}
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>{customer.name}</option>
                        ))}
                    </select>
                </label>
                <p>
                    <a href="#" onClick={() => navigate('/register-customer')}>
                        Register a new customer
                    </a>
                </p>
                <label>
                    Warehouse:
                    <select
                        value={selectedWarehouse}
                        onChange={e => setSelectedWarehouse(e.target.value)}
                        required
                    >
                        <option value="">Select warehouse</option>
                        {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name || w.id}</option>
                        ))}
                    </select>
                </label>
                <div className="product-list">
                    {selectedProducts.map((item, index) => (
                        <div key={index} className="product-item">
                            <select
                                value={item.product?.id || ''}
                                onChange={(e) => handleProductChange(index, 'product', e.target.value)}
                            >
                                <option value="">Select Product</option>
                                {products.length === 0 && <option disabled>No products found</option>}
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                placeholder="Quantity"
                            />
                        </div>
                    ))}
                    <button type="button" onClick={handleAddProduct}>Add Product</button>
                </div>
                <p>Subtotal: ₦{subtotal.toFixed(2)}</p>
                <p>VAT ({vat}%): ₦{vatAmount.toFixed(2)}</p>
                <p><b>Total Amount: ₦{totalAmount.toFixed(2)}</b></p>
                <button type="button" onClick={() => handleSubmit('unpaid')}>Submit as Unpaid (Generate Invoice PDF)</button>
                <button type="button" onClick={() => handleSubmit('paid')}>Submit as Paid (Generate Payment Receipt PDF)</button>
            </form>
            {showDownload && (
                <div className="pdf-download-modal">
                    <p>{pdfType === 'receipt' ? 'Payment receipt' : 'Invoice'} generated!</p>
                    <button onClick={handleDownload}>Download PDF</button>
                </div>
            )}
        </div>
    );
};

export default GenerateInvoice;