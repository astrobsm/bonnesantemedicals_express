import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './SalaryCalculation.css';

const SalaryCalculation = () => {
    const [staff, setStaff] = useState([]);
    const [formData, setFormData] = useState({
        staffId: '',
        salaryRate: '',
        duration: '',
        hoursWorked: 0,
        totalSalary: 0,
    });

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/staff');
                const data = await response.json();
                setStaff(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching staff:', error);
            }
        };

        fetchStaff();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const fetchHoursWorked = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/hours-worked/${formData.staffId}?duration=${formData.duration}`);
            const data = await response.json();
            setFormData({ ...formData, hoursWorked: data.hoursWorked });
        } catch (error) {
            console.error('Error fetching hours worked:', error);
        }
    };

    const calculateSalary = () => {
        const totalSalary = formData.hoursWorked * parseFloat(formData.salaryRate);
        setFormData({ ...formData, totalSalary });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Salary Calculation', 20, 20);
        doc.autoTable({
            head: [['Staff Name', 'Hours Worked', 'Salary Rate', 'Total Salary']],
            body: [
                [
                    staff.find((s) => s.id === formData.staffId)?.name || '',
                    formData.hoursWorked,
                    formData.salaryRate,
                    formData.totalSalary,
                ],
            ],
        });
        doc.save('salary_calculation.pdf');
    };

    return (
        <div className="salary-calculation-container">
            <h1>Salary Calculation</h1>
            <form className="salary-calculation-form">
                <label>
                    Select Staff:
                    <select
                        name="staffId"
                        value={formData.staffId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">-- Select a Staff --</option>
                        {staff.map((member) => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Salary Rate (per hour):
                    <input
                        type="number"
                        name="salaryRate"
                        value={formData.salaryRate}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Duration:
                    <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <button type="button" onClick={fetchHoursWorked} className="fetch-button">Fetch Hours Worked</button>
                <p>Hours Worked: {formData.hoursWorked}</p>
                <button type="button" onClick={calculateSalary} className="calculate-button">Calculate Salary</button>
                <p>Total Salary: {formData.totalSalary}</p>
                <button type="button" onClick={exportToPDF} className="export-button">Export to PDF</button>
            </form>
        </div>
    );
};

export default SalaryCalculation;