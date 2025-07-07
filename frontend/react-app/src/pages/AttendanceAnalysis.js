import React from 'react';
import './AttendanceAnalysis.css';

const AttendanceAnalysis = () => {
    return (
        <div className="attendance-analysis-container">
            <h1>Attendance Analysis</h1>
            <table className="awesome-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Punctuality</th>
                        <th>Days Missed</th>
                        <th>Extra Time Worked</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Removed dummy data */}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceAnalysis;