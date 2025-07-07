import React, { useEffect, useState } from 'react';
import './DatabaseTable.css';
import API_BASE_URL from '../config';

const DatabaseTable = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/database-table`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="database-table-container">
            <h1>Database Table</h1>
            <table className="database-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>{item.details}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DatabaseTable;