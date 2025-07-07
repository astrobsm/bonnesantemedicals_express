import React, { useEffect, useState } from 'react';
import './NewPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const NewPage = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/data-endpoint`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="new-page-container">
            <h1>Data Table</h1>
            <table className="data-table">
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

export default NewPage;