import React, { useState, useEffect } from 'react';
import './StaffManagement.css';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('staff');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockStaff = [
      {
        id: 1,
        employeeId: 'EMP-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@astrobsm.com',
        phone: '+1 (555) 123-4567',
        position: 'Production Manager',
        department: 'Production',
        team: 'Team Alpha',
        hireDate: '2023-01-15',
        status: 'Active',
        salary: 75000,
        hourlyRate: 36.06,
        workSchedule: 'Day Shift',
        supervisor: 'Sarah Johnson',
        skills: ['Leadership', 'Quality Control', 'Process Optimization'],
        certifications: ['Six Sigma Green Belt', 'Safety Management']
      },
      {
        id: 2,
        employeeId: 'EMP-002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@astrobsm.com',
        phone: '+1 (555) 234-5678',
        position: 'Quality Inspector',
        department: 'Quality Assurance',
        team: 'QA Team',
        hireDate: '2023-03-10',
        status: 'Active',
        salary: 55000,
        hourlyRate: 26.44,
        workSchedule: 'Day Shift',
        supervisor: 'Mike Wilson',
        skills: ['Quality Testing', 'Documentation', 'Problem Solving'],
        certifications: ['ISO 9001', 'Quality Management']
      },
      {
        id: 3,
        employeeId: 'EMP-003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@astrobsm.com',
        phone: '+1 (555) 345-6789',
        position: 'Machine Operator',
        department: 'Production',
        team: 'Team Beta',
        hireDate: '2022-11-20',
        status: 'Active',
        salary: 45000,
        hourlyRate: 21.63,
        workSchedule: 'Night Shift',
        supervisor: 'John Doe',
        skills: ['Machine Operation', 'Maintenance', 'Safety Protocols'],
        certifications: ['Forklift License', 'Safety Training']
      },
      {
        id: 4,
        employeeId: 'EMP-004',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@astrobsm.com',
        phone: '+1 (555) 456-7890',
        position: 'Warehouse Supervisor',
        department: 'Warehouse',
        team: 'Logistics',
        hireDate: '2022-08-15',
        status: 'On Leave',
        salary: 60000,
        hourlyRate: 28.85,
        workSchedule: 'Day Shift',
        supervisor: 'David Brown',
        skills: ['Inventory Management', 'Team Leadership', 'Logistics'],
        certifications: ['Warehouse Management', 'Leadership Training']
      }
    ];

    const mockAttendance = [
      {
        id: 1,
        employeeId: 'EMP-001',
        date: '2024-01-16',
        clockIn: '08:00',
        clockOut: '17:00',
        breakTime: 60,
        overtime: 0,
        status: 'Present',
        hoursWorked: 8,
        location: 'Main Plant'
      },
      {
        id: 2,
        employeeId: 'EMP-002',
        date: '2024-01-16',
        clockIn: '09:00',
        clockOut: '18:00',
        breakTime: 60,
        overtime: 0,
        status: 'Present',
        hoursWorked: 8,
        location: 'Quality Lab'
      },
      {
        id: 3,
        employeeId: 'EMP-003',
        date: '2024-01-16',
        clockIn: '22:00',
        clockOut: '06:00',
        breakTime: 60,
        overtime: 0,
        status: 'Present',
        hoursWorked: 8,
        location: 'Production Floor'
      },
      {
        id: 4,
        employeeId: 'EMP-004',
        date: '2024-01-16',
        clockIn: null,
        clockOut: null,
        breakTime: 0,
        overtime: 0,
        status: 'Absent',
        hoursWorked: 0,
        location: null
      }
    ];

    const mockPayroll = [
      {
        id: 1,
        employeeId: 'EMP-001',
        payPeriod: 'January 2024',
        basicSalary: 75000,
        overtime: 500,
        bonuses: 1000,
        deductions: 850,
        netPay: 75650,
        taxDeducted: 15130,
        benefits: 2250,
        status: 'Processed'
      },
      {
        id: 2,
        employeeId: 'EMP-002',
        payPeriod: 'January 2024',
        basicSalary: 55000,
        overtime: 200,
        bonuses: 500,
        deductions: 620,
        netPay: 55080,
        taxDeducted: 11016,
        benefits: 1650,
        status: 'Processed'
      }
    ];

    setTimeout(() => {
      setStaff(mockStaff);
      setAttendance(mockAttendance);
      setPayroll(mockPayroll);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'Active': 'badge-success',
      'On Leave': 'badge-warning',
      'Inactive': 'badge-danger',
      'Probation': 'badge-primary'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getAttendanceStatusBadge = (status) => {
    const statusMap = {
      'Present': 'badge-success',
      'Absent': 'badge-danger',
      'Late': 'badge-warning',
      'Half Day': 'badge-primary'
    };
    return statusMap[status] || 'badge-secondary';
  };

  const totalStaff = staff.length;
  const activeStaff = staff.filter(emp => emp.status === 'Active').length;
  const onLeaveStaff = staff.filter(emp => emp.status === 'On Leave').length;
  const presentToday = attendance.filter(att => att.status === 'Present').length;

  if (loading) {
    return (
      <div className="staff-loading">
        <div className="loading-spinner"></div>
        <p>Loading staff data...</p>
      </div>
    );
  }

  return (
    <div className="staff-management">
      <div className="staff-header">
        <div className="header-top">
          <h1>Staff Management</h1>
          <div className="header-actions">
            <button className="btn btn-secondary">
              Export
            </button>
            <button className="btn btn-warning" onClick={() => setShowPayrollModal(true)}>
              Process Payroll
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              Add Employee
            </button>
          </div>
        </div>

        <div className="staff-stats">
          <div className="stat-card">
            <div className="stat-icon stat-primary">
              📊
            </div>
            <div className="stat-content">
              <h3>{totalStaff}</h3>
              <p>Total Staff</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-success">
              ✅
            </div>
            <div className="stat-content">
              <h3>{activeStaff}</h3>
              <p>Active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-warning">
              📅
            </div>
            <div className="stat-content">
              <h3>{onLeaveStaff}</h3>
              <p>On Leave</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-info">
              🕐
            </div>
            <div className="stat-content">
              <h3>{presentToday}</h3>
              <p>Present Today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="staff-nav">
        <div className="nav-tabs">
          {['staff', 'attendance', 'payroll', 'performance'].map(tab => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'staff' && (
        <div className="staff-content">
          <div className="staff-grid">
            {staff.map(employee => (
              <div key={employee.id} className="employee-card" onClick={() => setSelectedEmployee(employee)}>
                <div className="employee-info">
                  <h3>{employee.firstName} {employee.lastName}</h3>
                  <p className="employee-id">{employee.employeeId}</p>
                  <p className="employee-position">{employee.position}</p>
                  <p className="employee-department">{employee.department}</p>
                </div>

                <div className="employee-details">
                  <div className="detail-row">
                    <span>Team:</span>
                    <span>{employee.team}</span>
                  </div>
                  <div className="detail-row">
                    <span>Schedule:</span>
                    <span>{employee.workSchedule}</span>
                  </div>
                  <div className="detail-row">
                    <span>Supervisor:</span>
                    <span>{employee.supervisor}</span>
                  </div>
                </div>

                <div className="employee-status">
                  <span className={`badge ${getStatusBadge(employee.status)}`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="staff-content">
          <div className="attendance-controls">
            <div className="date-filter">
              <input type="date" defaultValue="2024-01-16" />
              <button className="btn btn-primary">View Date</button>
            </div>
            <div className="attendance-summary">
              <div className="summary-item">
                <span>Present: {attendance.filter(att => att.status === 'Present').length}</span>
              </div>
              <div className="summary-item">
                <span>Absent: {attendance.filter(att => att.status === 'Absent').length}</span>
              </div>
            </div>
          </div>

          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours Worked</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => {
                  const employee = staff.find(emp => emp.employeeId === record.employeeId);
                  return (
                    <tr key={record.id}>
                      <td>
                        <div className="employee-cell">
                          <strong>{employee?.firstName} {employee?.lastName}</strong>
                          <small>{record.employeeId}</small>
                        </div>
                      </td>
                      <td>{record.clockIn || '-'}</td>
                      <td>{record.clockOut || '-'}</td>
                      <td>{record.hoursWorked}h</td>
                      <td>
                        <span className={`badge ${getAttendanceStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="staff-content">
          <div className="payroll-summary">
            <div className="payroll-card">
              <h3>Monthly Payroll Summary</h3>
              <div className="payroll-stats">
                <div className="payroll-stat">
                  <span>Total Gross Pay</span>
                  <span className="amount">${payroll.reduce((sum, p) => sum + p.basicSalary + p.overtime + p.bonuses, 0).toLocaleString()}</span>
                </div>
                <div className="payroll-stat">
                  <span>Total Net Pay</span>
                  <span className="amount">${payroll.reduce((sum, p) => sum + p.netPay, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="payroll-table-container">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Basic Salary</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map(record => {
                  const employee = staff.find(emp => emp.employeeId === record.employeeId);
                  return (
                    <tr key={record.id}>
                      <td>
                        <div className="employee-cell">
                          <strong>{employee?.firstName} {employee?.lastName}</strong>
                          <small>{record.employeeId}</small>
                        </div>
                      </td>
                      <td>{record.payPeriod}</td>
                      <td>${record.basicSalary.toLocaleString()}</td>
                      <td className="net-pay">${record.netPay.toLocaleString()}</td>
                      <td>
                        <span className="badge badge-success">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="staff-content">
          <div className="performance-dashboard">
            <div className="performance-grid">
              <div className="performance-card">
                <h3>Department Performance</h3>
                <div className="department-metrics">
                  {['Production', 'Quality Assurance', 'Warehouse'].map(dept => (
                    <div key={dept} className="dept-metric">
                      <span>{dept}</span>
                      <div className="metric-bar">
                        <div 
                          className="metric-fill"
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        ></div>
                      </div>
                      <span>{Math.floor(Math.random() * 40 + 60)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="performance-card">
                <h3>Top Performers</h3>
                <div className="top-performers">
                  {staff.slice(0, 3).map(emp => (
                    <div key={emp.id} className="performer-item">
                      <div className="performer-info">
                        <strong>{emp.firstName} {emp.lastName}</strong>
                        <small>{emp.position}</small>
                      </div>
                      <div className="performance-score">95%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;