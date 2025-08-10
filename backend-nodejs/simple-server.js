const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'AstroBSM-Oracle IVANSTAMAS Node.js Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Welcome to AstroBSM-Oracle IVANSTAMAS Node.js API',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    features: [
      'Staff Management',
      'Attendance Tracking', 
      'Payroll Processing',
      'Product Management',
      'Notification System',
      'Performance Monitoring'
    ]
  });
});

// Basic API endpoints (without database for now)
app.get('/api/v1/auth/me', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
});

app.get('/api/v1/auth/user/me', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: false,
    message: 'Database connection required for authentication'
  });
});

// Products endpoint stub
app.get('/api/v1/products', (req, res) => {
  res.json([]);
});

// Warehouses endpoint stub
app.get('/api/v1/warehouses', (req, res) => {
  res.json([]);
});

// Customers endpoint stub
app.get('/api/v1/customers', (req, res) => {
  res.json([]);
});

// Staff endpoint stub
app.get('/api/v1/staff', (req, res) => {
  res.json([]);
});

// Suppliers endpoint stub
app.get('/api/v1/suppliers', (req, res) => {
  res.json([]);
});

// Orders endpoint stub
app.get('/api/v1/orders', (req, res) => {
  res.json([]);
});

// Inventory endpoint stub
app.get('/api/v1/inventory', (req, res) => {
  res.json([]);
});

// Invoices endpoint stub
app.get('/api/v1/invoices', (req, res) => {
  res.json([]);
});

// Categories endpoint stub
app.get('/api/v1/categories', (req, res) => {
  res.json([]);
});

// Attendance endpoint stub
app.get('/api/v1/attendance', (req, res) => {
  res.json([]);
});

// Payroll endpoint stub
app.get('/api/v1/payroll', (req, res) => {
  res.json([]);
});

// Notifications endpoint stub
app.get('/api/v1/notifications', (req, res) => {
  res.json([]);
});

// Reports endpoint stub
app.get('/api/v1/reports', (req, res) => {
  res.json([]);
});

// Settings endpoint stub
app.get('/api/v1/settings', (req, res) => {
  res.json({});
});

// Products endpoint stub for frontend compatibility
app.get('/api/v1/products', (req, res) => {
  res.json([]); // Return an empty array for now
});

// Serve static files from React build
const staticPath = path.resolve(__dirname, '../frontend/react-app/build');
console.log(`📁 Serving static files from: ${staticPath}`);

app.use(express.static(staticPath));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path 
    });
  }
  
  const indexPath = path.join(staticPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving React app:', err);
      res.status(500).json({
        error: 'Could not serve React app',
        message: 'React build not found. Please build the frontend first.'
      });
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎉 ========================================');
  console.log('🚀 AstroBSM-Oracle Node.js Backend Started!');
  console.log('🎉 ========================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`� Status: http://localhost:${PORT}/api/status`);
  console.log('🎉 ========================================');
  console.log('');
  console.log('✅ Server is ready to accept connections!');
  console.log('📱 Open http://localhost:8080 in your browser');
  console.log('');
  console.log('⚠️  Note: Database features will be available once DB connection is fixed');
});

module.exports = app;
