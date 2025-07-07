import React, { useEffect, useState } from 'react';
import AdminSection from '../components/AdminSection';
import './AdminReports.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const REPORT_TYPES = [
  { key: 'sales', label: 'Sales Report' },
  { key: 'production', label: 'Production Report' },
  { key: 'staff-performance', label: 'Staff Performance' },
  { key: 'salary-report', label: 'Salary Report' },
];

const AdminReports = () => {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES[0].key);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      setReportData(null);
      let url = `${API_BASE_URL}/reports/${selectedReport}`;
      // For sales/production, add dummy date params for now
      if (selectedReport === 'sales' || selectedReport === 'production') {
        url += '?start_date=2024-01-01&end_date=2024-12-31';
      }
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch report');
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedReport]);

  const renderTable = () => {
    if (!reportData) return null;
    if (selectedReport === 'salary-report') {
      return (
        <table className="admin-reports-table">
          <thead>
            <tr>
              <th>Total Salary</th>
              <th>Total Bonus</th>
              <th>Total Deductions</th>
              <th>Net Salary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{reportData.total_salary}</td>
              <td>{reportData.total_bonus}</td>
              <td>{reportData.total_deductions}</td>
              <td>{reportData.total_net_salary}</td>
            </tr>
          </tbody>
        </table>
      );
    }
    if (selectedReport === 'staff-performance' && reportData.staff) {
      return (
        <table className="admin-reports-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Attendance Records</th>
              <th>Production Participation</th>
            </tr>
          </thead>
          <tbody>
            {reportData.staff.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.attendance_records}</td>
                <td>{s.production_participation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    // For sales/production, just JSON preview for now
    return (
      <pre style={{background:'#f5f7fa',padding:'1rem',borderRadius:'8px',overflowX:'auto'}}>{JSON.stringify(reportData, null, 2)}</pre>
    );
  };

  return (
    <AdminSection title="Reports">
      <div className="admin-reports-list">
        <div style={{marginBottom:'1rem'}}>
          {REPORT_TYPES.map((r) => (
            <button
              key={r.key}
              className={selectedReport === r.key ? 'reports-button selected' : 'reports-button'}
              onClick={() => setSelectedReport(r.key)}
              style={{marginRight:'10px',padding:'8px 18px',borderRadius:'6px',border:'none',background:selectedReport===r.key?'#8e44ad':'#e5e7eb',color:selectedReport===r.key?'#fff':'#333',fontWeight:'bold',cursor:'pointer'}}
            >
              {r.label}
            </button>
          ))}
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && renderTable()}
      </div>
    </AdminSection>
  );
};

export default AdminReports;
