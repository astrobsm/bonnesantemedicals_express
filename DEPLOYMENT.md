# AstroBSM Oracle IVANSTAMAS - Deployment Guide

## Digital Ocean Deployment

### Prerequisites
- Digital Ocean Account
- Docker installed locally
- Git repository access

### Quick Deploy
1. Push code to repository
2. Create Digital Ocean App
3. Connect to GitHub repository
4. Configure environment variables
5. Deploy!

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `DEBUG`: Set to "false" for production

### Features Included
- FastAPI Backend with fingerprint integration
- React Frontend 
- PostgreSQL Database support
- DigitalPersona SDK integration
- Authentication system
- Comprehensive API documentation

### Admin Credentials
- Username: blakvelvet
- Password: chibuike_douglas
- Role: Admin

### API Endpoints
- Authentication: `/api/v1/auth/`
- Fingerprint: `/api/v1/fingerprint/`
- Documentation: `/docs`

### Support
For deployment issues, check the logs in Digital Ocean dashboard.
