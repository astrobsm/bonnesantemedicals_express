# AstroBSM-Oracle Node.js Backend

## 🎉 Migration Complete!

Your application has been successfully migrated from Python/FastAPI to Node.js/Express with TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (DigitalOcean configured)
- npm or yarn package manager

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed with initial data
```

### 3. Build Application
```bash
npm run build
```

### 4. Start Server
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npx ts-node-dev --respawn --transpile-only src/server.ts

# Or use the PowerShell script
PowerShell -ExecutionPolicy Bypass -File start-server.ps1
```

## 🌐 Application URLs

- **Frontend Application**: http://localhost:8080
- **API Base URL**: http://localhost:8080/api/v1
- **Health Check**: http://localhost:8080/health
- **API Status**: http://localhost:8080/api/status

## 📊 Available API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user info

### Staff Management
- `GET /api/v1/staff` - List all staff
- `POST /api/v1/staff` - Create staff member
- `GET /api/v1/staff/:id` - Get staff details
- `PUT /api/v1/staff/:id` - Update staff
- `DELETE /api/v1/staff/:id` - Delete staff

### Product Management
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product details
- `PUT /api/v1/products/:id` - Update product
- `PATCH /api/v1/products/:id/stock` - Update stock

### Attendance System
- `POST /api/v1/attendance/clock` - Clock in/out
- `GET /api/v1/attendance` - Get attendance records
- `GET /api/v1/attendance/summary/:staffId` - Attendance summary

### Payroll Management
- `POST /api/v1/payroll/generate` - Generate payroll
- `GET /api/v1/payroll` - List payroll records
- `PATCH /api/v1/payroll/:id/approve` - Approve payroll
- `PATCH /api/v1/payroll/:id/process` - Process payment

### Notifications
- `POST /api/v1/notifications` - Create notification
- `GET /api/v1/notifications/my-notifications` - User notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read

## 🛠️ Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Frontend**: React (served from backend)

## 🔧 Environment Variables

The following environment variables are configured in `.env`:

```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 📁 Project Structure

```
backend-nodejs/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server startup
│   ├── config/
│   │   └── config.ts       # Configuration management
│   ├── lib/
│   │   └── prisma.ts       # Prisma client
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication
│   │   ├── errorHandler.ts # Error handling
│   │   └── notFoundHandler.ts
│   ├── routes/
│   │   ├── auth.ts         # Authentication routes
│   │   ├── staff.ts        # Staff management
│   │   ├── products.ts     # Product management
│   │   ├── attendance.ts   # Attendance tracking
│   │   ├── payroll.ts      # Payroll system
│   │   └── notifications.ts # Notification system
│   └── utils/
│       └── auth.ts         # Auth utilities
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Database seeding
├── dist/                   # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env
```

## 🎯 Key Features

### ✅ Staff Management
- Complete CRUD operations
- Role-based access control
- Performance tracking
- Integration with payroll and attendance

### ✅ Attendance System
- Clock in/out functionality
- Overtime calculation
- Attendance summaries
- Late arrival tracking

### ✅ Payroll Processing
- Automated payroll generation
- Tax calculations
- Overtime payments
- Approval workflow

### ✅ Product & Inventory
- Product management
- Stock tracking
- Low stock alerts
- Inventory transactions

### ✅ Notification System
- Real-time notifications
- System alerts (low stock, attendance)
- Role-based targeting
- Read/unread status

### ✅ Security & Performance
- JWT authentication
- Password hashing
- Rate limiting
- CORS protection
- Error handling
- Logging

## 🔄 Frontend Integration

The backend serves your React frontend from the `/frontend/react-app/build` directory. All non-API routes are handled by the React router.

## 📈 Monitoring & Logs

- Health check endpoint for monitoring
- Request logging with Morgan
- Error handling and logging
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**: Change PORT in .env file
2. **Database connection**: Verify DATABASE_URL in .env
3. **Build errors**: Run `npm run build` to check TypeScript errors
4. **Missing dependencies**: Run `npm install`

### Debug Mode
```bash
DEBUG=* npm start
```

## 📞 Support

For issues or questions, check the logs and ensure all environment variables are properly configured.

---

**🎊 Your Node.js backend is now running and serving your React frontend!**
