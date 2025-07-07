import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './SalaryConsole.css';
import API_BASE_URL from '../config';

const SalaryConsole = () => {
    const [staff, setStaff] = useState([]);
    const [formData, setFormData] = useState({
        staffId: '',
        startDate: '',
        endDate: '',
        hourlyRate: '',
        hoursWorked: 0,
        totalSalary: 0,
    });

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/staff`);
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
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            // If all required fields are present, trigger fetch
            if (
                updated.staffId &&
                updated.startDate &&
                updated.endDate &&
                updated.hourlyRate &&
                (name === 'staffId' || name === 'startDate' || name === 'endDate' || name === 'hourlyRate')
            ) {
                setTimeout(() => {
                    fetchHoursWorkedAndSalary(updated.startDate, updated.endDate, updated.staffId, updated.hourlyRate);
                }, 0);
            }
            return updated;
        });
    };

    const fetchHoursWorkedAndSalary = async (startDate, endDate, staffId, hourlyRate) => {
        if (!staffId || !startDate || !endDate || !hourlyRate) return;
        try {
            const response = await fetch(`${API_BASE_URL}/hours-worked/${staffId}?start_date=${startDate}&end_date=${endDate}`);
            if (!response.ok) {
                setFormData((prev) => ({ ...prev, hoursWorked: 0, totalSalary: 0 }));
                return;
            }
            const data = await response.json();
            const hoursWorked = data.hoursWorked || 0;
            const totalSalary = hoursWorked * parseFloat(hourlyRate);
            setFormData((prev) => ({ ...prev, hoursWorked, totalSalary }));
        } catch (error) {
            setFormData((prev) => ({ ...prev, hoursWorked: 0, totalSalary: 0 }));
            console.error('Error fetching hours worked:', error);
        }
    };



    const generatePayslip = () => {
        if (!formData.staffId || !formData.startDate || !formData.endDate || !formData.hourlyRate) {
            alert('Please fill in all fields before generating the payslip.');
            return;
        }
        const doc = new jsPDF();
        doc.text('Payslip', 20, 20);
        autoTable(doc, {
            head: [['Field', 'Value']],
            body: [
                ['Staff Name', staff.find((s) => s.id === formData.staffId)?.name || ''],
                ['Duration', `${formData.startDate} to ${formData.endDate}`],
                ['Hourly Rate (₦)', formData.hourlyRate],
                ['Hours Worked', formData.hoursWorked],
                ['Total Salary (₦)', formData.totalSalary],
            ],
        });
        doc.save('payslip.pdf');
    };

    return (
        <div className="salary-console-container">
            <h1>Salary Console</h1>
            <form className="salary-console-form">
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
                    Start Date:
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    End Date:
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Hourly Rate (₦):
                    <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <p>Hours Worked: {formData.hoursWorked}</p>
                <p>Total Salary: ₦{formData.totalSalary}</p>
                <button type="button" onClick={generatePayslip} className="generate-button">Generate Payslip</button>
            </form>
        </div>
    );
};

export default SalaryConsole;