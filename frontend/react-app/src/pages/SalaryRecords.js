import React, { useState, useEffect } from 'react';
import './SalaryRecords.css';
import API_BASE_URL from '../config';

const SalaryRecords = () => {
    const [salaryRecords, setSalaryRecords] = useState([]);

    useEffect(() => {
        const fetchSalaryRecords = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/salary-records`);
                const data = await response.json();
                setSalaryRecords(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching salary records:', error);
            }
        };

        fetchSalaryRecords();
    }, []);

    return (
        <div className="salary-records-container">
            <h1>Salary Records</h1>
            <table className="salary-records-table">
                <thead>
                    <tr>
                        <th>Staff ID</th>
                        <th>Name</th>
                        <th>Month</th>
                        <th>Hours Worked</th>
                        <th>Hourly Rate</th>
                        <th>Total Salary</th>
                    </tr>
                </thead>
                <tbody>
                    {salaryRecords.map((record, index) => (
                        <tr key={index}>
                            <td>{record.staffId}</td>
                            <td>{record.name}</td>
                            <td>{record.month}</td>
                            <td>{record.hoursWorked}</td>
                            <td>{record.hourlyRate}</td>
                            <td>{record.totalSalary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SalaryRecords;