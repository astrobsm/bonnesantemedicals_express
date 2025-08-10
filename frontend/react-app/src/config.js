// API Configuration for AstroBSM Oracle
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
                     (process.env.NODE_ENV === 'development' 
                       ? 'http://localhost:8000/api/v1' 
                       : '/api/v1');

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    INVENTORY: '/inventory',
    PRODUCTION: '/production',
    STAFF: '/staff',
    ATTENDANCE: '/attendance',
    PAYROLL: '/payroll',
    DEVICES: '/devices',
    WAREHOUSES: '/warehouses',
    PRODUCTS: '/products',
    SETTINGS: '/settings'
  }
};

export default API_BASE_URL;