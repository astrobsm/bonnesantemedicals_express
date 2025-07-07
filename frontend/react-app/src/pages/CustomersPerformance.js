import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import './CustomersPerformance.css';

const CustomersPerformance = () => {
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomersPerformance = async () => {
            try {
                console.log('Fetching customers performance data...');
                const response = await fetch(`${API_BASE_URL}/customer-performance/`);
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error('Failed to fetch customers performance');
                }
                const data = await response.json();
                console.log('Fetched data:', data);
                setCustomers(data);
            } catch (err) {
                console.error('Error fetching customers performance:', err);
                setError(err.message);
            }
        };

        fetchCustomersPerformance();
    }, []);

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="customers-performance-container">
            <h1>Customers Performance</h1>
            <table className="customers-performance-table">
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Transactions</th>
                        <th>Percentage Contribution</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id}>
                            <td>{customer.name}</td>
                            <td>{customer.transactions}</td>
                            <td>{customer.percentage_contribution}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomersPerformance;