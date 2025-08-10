import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FingerprintAttendance.css';

const FingerprintAttendance = () => {
  const [status, setStatus] = useState({
    reader_connected: false,
    sdk_available: false,
    service_status: 'inactive',
    total_templates: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info', 'warning'
  const [currentAction, setCurrentAction] = useState('IN');
  const [enrollmentMode, setEnrollmentMode] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    checkStatus();
    loadStaffList();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await axios.get('/api/v1/fingerprint/status');
      setStatus(response.data);
      
      if (!response.data.reader_connected) {
        showMessage('Fingerprint reader not connected', 'warning');
      } else if (!response.data.sdk_available) {
        showMessage('Fingerprint SDK not available - running in simulation mode', 'warning');
      } else {
        showMessage('Fingerprint system ready', 'success');
      }
    } catch (error) {
      showMessage('Failed to check fingerprint system status', 'error');
      console.error('Status check error:', error);
    }
  };

  const loadStaffList = async () => {
    try {
      const response = await axios.get('/api/v1/staff');
      setStaffList(response.data);
    } catch (error) {
      console.error('Failed to load staff list:', error);
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleAttendanceVerification = async () => {
    if (loading) return;
    
    setLoading(true);
    showMessage(`Place finger on scanner for ${currentAction}...`, 'info');

    try {
      const response = await axios.post('/api/v1/fingerprint/verify', {
        action: currentAction
      });

      if (response.data.success && response.data.matched) {
        showMessage(response.data.message, 'success');
      } else {
        showMessage(response.data.message || 'Fingerprint not recognized', 'error');
      }
    } catch (error) {
      showMessage('Verification failed. Please try again.', 'error');
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!selectedStaffId) {
      showMessage('Please select a staff member first', 'warning');
      return;
    }

    if (loading) return;
    
    setLoading(true);
    showMessage('Starting fingerprint enrollment. Please follow instructions...', 'info');

    try {
      const response = await axios.post('/api/v1/fingerprint/enroll', {
        staff_id: parseInt(selectedStaffId),
        finger_position: 1
      });

      if (response.data.success) {
        showMessage(response.data.message, 'success');
        setEnrollmentMode(false);
        setSelectedStaffId('');
        checkStatus(); // Refresh status to update template count
      } else {
        showMessage(response.data.error || 'Enrollment failed', 'error');
      }
    } catch (error) {
      showMessage('Enrollment failed. Please try again.', 'error');
      console.error('Enrollment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCapture = async () => {
    if (loading) return;
    
    setLoading(true);
    showMessage('Testing fingerprint capture...', 'info');

    try {
      const response = await axios.post('/api/v1/fingerprint/test-capture');
      
      if (response.data.success) {
        showMessage('Fingerprint capture test successful!', 'success');
      } else {
        showMessage(response.data.message || 'Capture test failed', 'error');
      }
    } catch (error) {
      showMessage('Test failed', 'error');
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fingerprint-attendance">
      <div className="fingerprint-header">
        <h2>Fingerprint Attendance System</h2>
        <div className="status-indicators">
          <div className={`status-item ${status.reader_connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            Reader: {status.reader_connected ? 'Connected' : 'Disconnected'}
          </div>
          <div className={`status-item ${status.sdk_available ? 'available' : 'unavailable'}`}>
            <span className="status-dot"></span>
            SDK: {status.sdk_available ? 'Available' : 'Simulation Mode'}
          </div>
          <div className="status-item">
            <span className="status-dot"></span>
            Templates: {status.total_templates}
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="fingerprint-content">
        {!enrollmentMode ? (
          <div className="attendance-mode">
            <div className="action-selector">
              <button 
                className={`action-btn ${currentAction === 'IN' ? 'active' : ''}`}
                onClick={() => setCurrentAction('IN')}
              >
                Clock In
              </button>
              <button 
                className={`action-btn ${currentAction === 'OUT' ? 'active' : ''}`}
                onClick={() => setCurrentAction('OUT')}
              >
                Clock Out
              </button>
            </div>

            <div className="fingerprint-scanner">
              <div className={`scanner-icon ${loading ? 'scanning' : ''}`}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <path
                    d="M60 10 C32 10, 10 32, 10 60 C10 88, 32 110, 60 110 C88 110, 110 88, 110 60 C110 32, 88 10, 60 10 Z"
                    fill="none"
                    stroke={loading ? "#007bff" : "#6c757d"}
                    strokeWidth="3"
                    strokeDasharray={loading ? "5,5" : "none"}
                  />
                  <circle cx="60" cy="60" r="25" fill="none" stroke="#007bff" strokeWidth="2"/>
                  <path d="M45 60 Q60 45, 75 60 Q60 75, 45 60" fill="#007bff" opacity="0.3"/>
                </svg>
              </div>
              <p className="scanner-text">
                {loading 
                  ? `Scanning for ${currentAction}...` 
                  : `Click to scan fingerprint for ${currentAction}`
                }
              </p>
              <button 
                className="scan-btn"
                onClick={handleAttendanceVerification}
                disabled={loading}
              >
                {loading ? 'Scanning...' : `Scan for ${currentAction}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="enrollment-mode">
            <h3>Enroll New Fingerprint</h3>
            <div className="enrollment-form">
              <select 
                value={selectedStaffId} 
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="staff-selector"
              >
                <option value="">Select Staff Member</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
              
              <button 
                className="enroll-btn"
                onClick={handleEnrollment}
                disabled={loading || !selectedStaffId}
              >
                {loading ? 'Enrolling...' : 'Start Enrollment'}
              </button>
              
              <button 
                className="cancel-btn"
                onClick={() => {
                  setEnrollmentMode(false);
                  setSelectedStaffId('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="fingerprint-controls">
        <button 
          className="mode-btn"
          onClick={() => setEnrollmentMode(!enrollmentMode)}
          disabled={loading}
        >
          {enrollmentMode ? 'Switch to Attendance' : 'Enroll Fingerprint'}
        </button>
        
        <button 
          className="test-btn"
          onClick={testCapture}
          disabled={loading}
        >
          Test Scanner
        </button>
        
        <button 
          className="refresh-btn"
          onClick={checkStatus}
          disabled={loading}
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default FingerprintAttendance;
