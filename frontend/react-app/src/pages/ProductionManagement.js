import React, { useState, useEffect } from 'react';
import './ProductionManagement.css';

const ProductionManagement = () => {
  const [productionOrders, setProductionOrders] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockOrders = [
      {
        id: 'PO-001',
        productName: 'Aerospace Component A',
        orderNumber: 'ORD-2024-001',
        quantity: 500,
        produced: 320,
        status: 'In Progress',
        priority: 'High',
        startDate: '2024-01-10',
        dueDate: '2024-01-25',
        estimatedCompletion: '2024-01-23',
        workstation: 'Assembly Line 1',
        assignedTeam: 'Team Alpha',
        efficiency: 85,
        qualityScore: 92,
        materials: [
          { name: 'Steel Rods', required: 1000, used: 640, unit: 'kg' },
          { name: 'Circuit Boards', required: 500, used: 320, unit: 'pcs' }
        ]
      },
      {
        id: 'PO-002',
        productName: 'Electronic Module B',
        orderNumber: 'ORD-2024-002',
        quantity: 200,
        produced: 200,
        status: 'Completed',
        priority: 'Medium',
        startDate: '2024-01-05',
        dueDate: '2024-01-20',
        estimatedCompletion: '2024-01-18',
        workstation: 'Electronics Lab',
        assignedTeam: 'Team Beta',
        efficiency: 98,
        qualityScore: 96,
        materials: [
          { name: 'Aluminum Sheets', required: 100, used: 100, unit: 'kg' },
          { name: 'Electronic Components', required: 400, used: 400, unit: 'pcs' }
        ]
      },
      {
        id: 'PO-003',
        productName: 'Safety Equipment C',
        orderNumber: 'ORD-2024-003',
        quantity: 150,
        produced: 0,
        status: 'Pending',
        priority: 'Low',
        startDate: '2024-01-20',
        dueDate: '2024-02-10',
        estimatedCompletion: '2024-02-08',
        workstation: 'Safety Line',
        assignedTeam: 'Team Gamma',
        efficiency: 0,
        qualityScore: 0,
        materials: [
          { name: 'Plastic Components', required: 300, used: 0, unit: 'kg' },
          { name: 'Safety Sensors', required: 150, used: 0, unit: 'pcs' }
        ]
      }
    ];

    const mockWorkstations = [
      {
        id: 'WS-001',
        name: 'Assembly Line 1',
        status: 'Running',
        currentOrder: 'PO-001',
        efficiency: 85,
        capacity: 100,
        utilization: 85,
        operators: 6,
        shiftInfo: 'Day Shift (06:00-14:00)',
        maintenanceDate: '2024-01-30',
        issues: []
      },
      {
        id: 'WS-002',
        name: 'Electronics Lab',
        status: 'Idle',
        currentOrder: null,
        efficiency: 92,
        capacity: 50,
        utilization: 0,
        operators: 3,
        shiftInfo: 'Day Shift (08:00-16:00)',
        maintenanceDate: '2024-02-05',
        issues: []
      },
      {
        id: 'WS-003',
        name: 'Quality Control',
        status: 'Maintenance',
        currentOrder: null,
        efficiency: 0,
        capacity: 75,
        utilization: 0,
        operators: 4,
        shiftInfo: 'Night Shift (22:00-06:00)',
        maintenanceDate: '2024-01-18',
        issues: ['Calibration required', 'Software update pending']
      }
    ];

    setTimeout(() => {
      setProductionOrders(mockOrders);
      setWorkstations(mockWorkstations);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'Completed': 'badge-success',
      'In Progress': 'badge-primary',
      'Pending': 'badge-warning',
      'Cancelled': 'badge-danger',
      'On Hold': 'badge-secondary'
    };
    return statusMap[status] || 'badge-primary';
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'High': 'badge-danger',
      'Medium': 'badge-warning',
      'Low': 'badge-success'
    };
    return priorityMap[priority] || 'badge-primary';
  };

  const getWorkstationStatusBadge = (status) => {
    const statusMap = {
      'Running': 'badge-success',
      'Idle': 'badge-warning',
      'Maintenance': 'badge-danger',
      'Offline': 'badge-secondary'
    };
    return statusMap[status] || 'badge-primary';
  };

  const getProgressPercentage = (produced, quantity) => {
    return Math.round((produced / quantity) * 100);
  };

  const totalOrders = productionOrders.length;
  const activeOrders = productionOrders.filter(order => order.status === 'In Progress').length;
  const completedOrders = productionOrders.filter(order => order.status === 'Completed').length;
  const overallEfficiency = Math.round(
    productionOrders.reduce((sum, order) => sum + order.efficiency, 0) / totalOrders
  );

  if (loading) {
    return (
      <div className="production-loading">
        <div className="loading-spinner"></div>
        <p>Loading production data...</p>
      </div>
    );
  }

  return (
    <div className="production-management">
      <div className="production-header">
        <div className="header-top">
          <h1>Production Management</h1>
          <div className="header-actions">
            <button className="btn btn-secondary">
              <i className="icon-download"></i>
              Export Report
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <i className="icon-plus"></i>
              New Order
            </button>
          </div>
        </div>

        <div className="production-stats">
          <div className="stat-card">
            <div className="stat-icon stat-primary">
              <i className="icon-clipboard"></i>
            </div>
            <div className="stat-content">
              <h3>{totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-warning">
              <i className="icon-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{activeOrders}</h3>
              <p>Active Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-success">
              <i className="icon-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{completedOrders}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-info">
              <i className="icon-trending-up"></i>
            </div>
            <div className="stat-content">
              <h3>{overallEfficiency}%</h3>
              <p>Efficiency</p>
            </div>
          </div>
        </div>
      </div>

      <div className="production-nav">
        <div className="nav-tabs">
          {['orders', 'workstations', 'schedule', 'analytics'].map(tab => (
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

      {activeTab === 'orders' && (
        <div className="production-content">
          <div className="orders-grid">
            {productionOrders.map(order => (
              <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                <div className="order-header">
                  <div className="order-info">
                    <h3>{order.productName}</h3>
                    <p className="order-number">{order.orderNumber}</p>
                  </div>
                  <div className="order-badges">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`badge ${getPriorityBadge(order.priority)}`}>
                      {order.priority}
                    </span>
                  </div>
                </div>

                <div className="order-progress">
                  <div className="progress-info">
                    <span>Progress: {order.produced}/{order.quantity}</span>
                    <span>{getProgressPercentage(order.produced, order.quantity)}%</span>
                  </div>
                  <div className="progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${getProgressPercentage(order.produced, order.quantity)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="order-details">
                  <div className="detail-item">
                    <i className="icon-calendar"></i>
                    <span>Due: {order.dueDate}</span>
                  </div>
                  <div className="detail-item">
                    <i className="icon-map-pin"></i>
                    <span>{order.workstation}</span>
                  </div>
                  <div className="detail-item">
                    <i className="icon-users"></i>
                    <span>{order.assignedTeam}</span>
                  </div>
                </div>

                <div className="order-metrics">
                  <div className="metric">
                    <span className="metric-label">Efficiency</span>
                    <span className="metric-value">{order.efficiency}%</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Quality</span>
                    <span className="metric-value">{order.qualityScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'workstations' && (
        <div className="production-content">
          <div className="workstations-grid">
            {workstations.map(workstation => (
              <div key={workstation.id} className="workstation-card">
                <div className="workstation-header">
                  <h3>{workstation.name}</h3>
                  <span className={`badge ${getWorkstationStatusBadge(workstation.status)}`}>
                    {workstation.status}
                  </span>
                </div>

                <div className="workstation-metrics">
                  <div className="metric-row">
                    <span>Efficiency</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill efficiency"
                        style={{ width: `${workstation.efficiency}%` }}
                      ></div>
                      <span>{workstation.efficiency}%</span>
                    </div>
                  </div>
                  <div className="metric-row">
                    <span>Utilization</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill utilization"
                        style={{ width: `${workstation.utilization}%` }}
                      ></div>
                      <span>{workstation.utilization}%</span>
                    </div>
                  </div>
                </div>

                <div className="workstation-info">
                  <div className="info-item">
                    <i className="icon-users"></i>
                    <span>{workstation.operators} Operators</span>
                  </div>
                  <div className="info-item">
                    <i className="icon-clock"></i>
                    <span>{workstation.shiftInfo}</span>
                  </div>
                  <div className="info-item">
                    <i className="icon-tool"></i>
                    <span>Maintenance: {workstation.maintenanceDate}</span>
                  </div>
                  {workstation.currentOrder && (
                    <div className="info-item">
                      <i className="icon-clipboard"></i>
                      <span>Current: {workstation.currentOrder}</span>
                    </div>
                  )}
                </div>

                {workstation.issues.length > 0 && (
                  <div className="workstation-issues">
                    <h4>Issues:</h4>
                    <ul>
                      {workstation.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="production-content">
          <div className="schedule-view">
            <div className="schedule-header">
              <h3>Production Schedule</h3>
              <div className="schedule-controls">
                <button className="btn btn-secondary">Week View</button>
                <button className="btn btn-primary">Month View</button>
              </div>
            </div>
            <div className="schedule-grid">
              <div className="schedule-timeline">
                {productionOrders.map(order => (
                  <div key={order.id} className="timeline-item">
                    <div className="timeline-content">
                      <h4>{order.productName}</h4>
                      <p>{order.startDate} - {order.dueDate}</p>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="production-content">
          <div className="analytics-dashboard">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Production Trends</h3>
                <div className="chart-placeholder">
                  <p>Production trend chart would go here</p>
                </div>
              </div>
              <div className="analytics-card">
                <h3>Efficiency by Workstation</h3>
                <div className="efficiency-chart">
                  {workstations.map(ws => (
                    <div key={ws.id} className="efficiency-bar">
                      <span>{ws.name}</span>
                      <div className="bar">
                        <div 
                          className="bar-fill"
                          style={{ width: `${ws.efficiency}%` }}
                        ></div>
                      </div>
                      <span>{ws.efficiency}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="analytics-card">
                <h3>Quality Metrics</h3>
                <div className="quality-metrics">
                  <div className="quality-item">
                    <span>Average Quality Score</span>
                    <span className="quality-score">94%</span>
                  </div>
                  <div className="quality-item">
                    <span>Defect Rate</span>
                    <span className="defect-rate">2.1%</span>
                  </div>
                  <div className="quality-item">
                    <span>Rework Rate</span>
                    <span className="rework-rate">1.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.orderNumber}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="details-section">
                  <h3>Basic Information</h3>
                  <div className="details-list">
                    <div className="detail-row">
                      <span>Product Name:</span>
                      <span>{selectedOrder.productName}</span>
                    </div>
                    <div className="detail-row">
                      <span>Order Number:</span>
                      <span>{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span>Quantity:</span>
                      <span>{selectedOrder.quantity}</span>
                    </div>
                    <div className="detail-row">
                      <span>Produced:</span>
                      <span>{selectedOrder.produced}</span>
                    </div>
                    <div className="detail-row">
                      <span>Status:</span>
                      <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Priority:</span>
                      <span className={`badge ${getPriorityBadge(selectedOrder.priority)}`}>
                        {selectedOrder.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Schedule & Assignment</h3>
                  <div className="details-list">
                    <div className="detail-row">
                      <span>Start Date:</span>
                      <span>{selectedOrder.startDate}</span>
                    </div>
                    <div className="detail-row">
                      <span>Due Date:</span>
                      <span>{selectedOrder.dueDate}</span>
                    </div>
                    <div className="detail-row">
                      <span>Est. Completion:</span>
                      <span>{selectedOrder.estimatedCompletion}</span>
                    </div>
                    <div className="detail-row">
                      <span>Workstation:</span>
                      <span>{selectedOrder.workstation}</span>
                    </div>
                    <div className="detail-row">
                      <span>Assigned Team:</span>
                      <span>{selectedOrder.assignedTeam}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section materials-section">
                  <h3>Materials</h3>
                  <div className="materials-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Required</th>
                          <th>Used</th>
                          <th>Unit</th>
                          <th>Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.materials.map((material, index) => (
                          <tr key={index}>
                            <td>{material.name}</td>
                            <td>{material.required}</td>
                            <td>{material.used}</td>
                            <td>{material.unit}</td>
                            <td>
                              <div className="material-progress">
                                <div 
                                  className="material-progress-bar"
                                  style={{ 
                                    width: `${(material.used / material.required) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
              <button className="btn btn-warning">
                Update Status
              </button>
              <button className="btn btn-primary">
                Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content create-order-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Production Order</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="create-order-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input type="text" placeholder="Enter product name" />
                  </div>
                  <div className="form-group">
                    <label>Order Number</label>
                    <input type="text" placeholder="Auto-generated" disabled />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Workstation</label>
                    <select>
                      {workstations.map(ws => (
                        <option key={ws.id} value={ws.name}>{ws.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assigned Team</label>
                    <select>
                      <option>Team Alpha</option>
                      <option>Team Beta</option>
                      <option>Team Gamma</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Enter order description" rows="3"></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary">
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionManagement;
