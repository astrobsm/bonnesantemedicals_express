"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config/config");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const auth_1 = require("./routes/auth");
const staff_1 = require("./routes/staff");
const products_1 = require("./routes/products");
const attendance_1 = require("./routes/attendance");
const payroll_1 = require("./routes/payroll");
const notifications_1 = require("./routes/notifications");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);
const corsOptions = {
    origin: config_1.config.ALLOWED_ORIGINS.split(','),
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/v1/auth', auth_1.authRoutes);
app.use('/api/v1/staff', staff_1.staffRoutes);
app.use('/api/v1/products', products_1.productsRoutes);
app.use('/api/v1/attendance', attendance_1.attendanceRoutes);
app.use('/api/v1/payroll', payroll_1.payrollRoutes);
app.use('/api/v1/notifications', notifications_1.notificationsRoutes);
app.get('/api/status', (req, res) => {
    res.json({
        message: 'Welcome to AstroBSM-Oracle IVANSTAMAS API',
        status: 'running',
        timestamp: new Date().toISOString(),
        environment: config_1.config.NODE_ENV,
        version: '2.0.0'
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        app: 'AstroBSM-Oracle IVANSTAMAS',
        environment: config_1.config.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
const staticPath = path_1.default.resolve(__dirname, '../../frontend/react-app/build');
app.use(express_1.default.static(staticPath));
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    const indexPath = path_1.default.join(staticPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving React app:', err);
            res.status(500).send('Could not serve React app');
        }
    });
});
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
//# sourceMappingURL=app.js.map