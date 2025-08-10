import React, { useState, useEffect } from 'react';
import './InventoryManagement.css';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockInventory = [
      {
        id: 1,
        name: 'Steel Rods',
        sku: 'STL-001',
        category: 'Raw Materials',
        quantity: 250,
        minStock: 100,
        maxStock: 500,
        unitPrice: 15.50,
        totalValue: 3875,
        supplier: 'Metal Corp',
        location: 'Warehouse A-1',
        status: 'In Stock',
        lastUpdated: '2024-01-15',
        description: 'High-grade steel rods for construction'
      },
      {
        id: 2,
        name: 'Aluminum Sheets',
        sku: 'ALU-002',
        category: 'Raw Materials',
        quantity: 75,
        minStock: 50,
        maxStock: 200,
        unitPrice: 22.30,
        totalValue: 1672.50,
        supplier: 'Aluminum Solutions',
        location: 'Warehouse B-2',
        status: 'Low Stock',
        lastUpdated: '2024-01-14',
        description: 'Premium aluminum sheets for aerospace'
      },
      {
        id: 3,
        name: 'Circuit Boards',
        sku: 'CIR-003',
        category: 'Electronics',
        quantity: 120,
        minStock: 80,
        maxStock: 300,
        unitPrice: 45.00,
        totalValue: 5400,
        supplier: 'Tech Components',
        location: 'Electronics Lab',
        status: 'In Stock',
        lastUpdated: '2024-01-16',
        description: 'Advanced PCB boards for manufacturing'
      },
      {
        id: 4,
        name: 'Safety Helmets',
        sku: 'SAF-004',
        category: 'Safety Equipment',
        quantity: 15,
        minStock: 30,
        maxStock: 100,
        unitPrice: 35.75,
        totalValue: 536.25,
        supplier: 'Safety First Inc',
        location: 'Safety Storage',
        status: 'Critical',
        lastUpdated: '2024-01-13',
        description: 'Industrial safety helmets'
      }
    ];
    
    setTimeout(() => {
      setInventory(mockInventory);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'low' && item.status === 'Low Stock') ||
                         (filterStatus === 'critical' && item.status === 'Critical') ||
                         (filterStatus === 'in-stock' && item.status === 'In Stock');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'In Stock': 'badge-success',
      'Low Stock': 'badge-warning',
      'Critical': 'badge-danger'
    };
    return statusMap[status] || 'badge-primary';
  };

  const getStockPercentage = (current, min, max) => {
    return ((current - min) / (max - min)) * 100;
  };

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Critical').length;
  const totalItems = inventory.length;

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on items:`, selectedItems);
    // Implement bulk actions here
    setSelectedItems([]);
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="loading-spinner"></div>
        <p>Loading inventory data...</p>
      </div>
    );
  }

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <div className="header-top">
          <h1>Inventory Management</h1>
          <div className="header-actions">
            <button className="btn btn-secondary">
              <i className="icon-download"></i>
              Export
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <i className="icon-plus"></i>
              Add Item
            </button>
          </div>
        </div>

        <div className="inventory-stats">
          <div className="stat-card">
            <div className="stat-icon stat-primary">
              <i className="icon-package"></i>
            </div>
            <div className="stat-content">
              <h3>{totalItems}</h3>
              <p>Total Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-success">
              <i className="icon-dollar-sign"></i>
            </div>
            <div className="stat-content">
              <h3>${totalValue.toLocaleString()}</h3>
              <p>Total Value</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-warning">
              <i className="icon-alert-triangle"></i>
            </div>
            <div className="stat-content">
              <h3>{lowStockItems}</h3>
              <p>Low Stock Alerts</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-info">
              <i className="icon-trending-up"></i>
            </div>
            <div className="stat-content">
              <h3>95%</h3>
              <p>Stock Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="inventory-nav">
        <div className="nav-tabs">
          {['overview', 'categories', 'movements', 'reports'].map(tab => (
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

      {activeTab === 'overview' && (
        <div className="inventory-content">
          <div className="inventory-filters">
            <div className="filter-group">
              <div className="search-box">
                <i className="icon-search"></i>
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {selectedItems.length > 0 && (
              <div className="bulk-actions">
                <span>{selectedItems.length} items selected</span>
                <button 
                  className="btn btn-small btn-secondary"
                  onClick={() => handleBulkAction('update')}
                >
                  Update Stock
                </button>
                <button 
                  className="btn btn-small btn-warning"
                  onClick={() => handleBulkAction('reorder')}
                >
                  Reorder
                </button>
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredInventory.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </th>
                  <th>Item</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemSelect(item.id)}
                      />
                    </td>
                    <td>
                      <div className="item-cell">
                        <strong>{item.name}</strong>
                        <small>{item.description}</small>
                      </div>
                    </td>
                    <td className="sku-cell">{item.sku}</td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td>
                      <div className="stock-cell">
                        <div className="stock-info">
                          <span className="stock-quantity">{item.quantity}</span>
                          <span className="stock-range">({item.minStock}-{item.maxStock})</span>
                        </div>
                        <div className="stock-bar">
                          <div 
                            className="stock-fill"
                            style={{ 
                              width: `${Math.max(0, Math.min(100, getStockPercentage(item.quantity, item.minStock, item.maxStock)))}%`,
                              backgroundColor: item.status === 'Critical' ? '#f56565' : 
                                             item.status === 'Low Stock' ? '#ed8936' : '#48bb78'
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="price-cell">${item.unitPrice}</td>
                    <td className="value-cell">${item.totalValue.toLocaleString()}</td>
                    <td className="location-cell">{item.location}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="Edit">
                          <i className="icon-edit"></i>
                        </button>
                        <button className="btn-icon" title="Reorder">
                          <i className="icon-refresh-cw"></i>
                        </button>
                        <button className="btn-icon btn-danger" title="Delete">
                          <i className="icon-trash-2"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="empty-state">
              <i className="icon-package"></i>
              <h3>No items found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="categories-content">
          <div className="category-grid">
            {['Raw Materials', 'Electronics', 'Safety Equipment', 'Tools', 'Finished Goods'].map(category => (
              <div key={category} className="category-card">
                <h3>{category}</h3>
                <p>{inventory.filter(item => item.category === category).length} items</p>
                <div className="category-value">
                  ${inventory.filter(item => item.category === category)
                    .reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="movements-content">
          <div className="movement-chart">
            <h3>Stock Movements</h3>
            <p>Track all inventory movements, receipts, and adjustments</p>
            {/* Add chart component here */}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="reports-content">
          <div className="report-grid">
            <div className="report-card">
              <h3>Inventory Valuation</h3>
              <p>Current total value: ${totalValue.toLocaleString()}</p>
            </div>
            <div className="report-card">
              <h3>Stock Turnover</h3>
              <p>Average turnover: 4.2x per year</p>
            </div>
            <div className="report-card">
              <h3>Aging Analysis</h3>
              <p>Items over 90 days: 12</p>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="add-item-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name</label>
                    <input type="text" placeholder="Enter item name" />
                  </div>
                  <div className="form-group">
                    <label>SKU</label>
                    <input type="text" placeholder="Enter SKU" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select>
                      <option>Raw Materials</option>
                      <option>Electronics</option>
                      <option>Safety Equipment</option>
                      <option>Tools</option>
                      <option>Finished Goods</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Supplier</label>
                    <input type="text" placeholder="Enter supplier" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Current Stock</label>
                    <input type="number" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Unit Price</label>
                    <input type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Min Stock</label>
                    <input type="number" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Max Stock</label>
                    <input type="number" placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Enter item description" rows="3"></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
