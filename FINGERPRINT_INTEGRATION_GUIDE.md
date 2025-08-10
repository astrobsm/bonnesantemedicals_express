# DigitalPersona Fingerprint Integration

This document explains how to set up and use the DigitalPersona fingerprint scanner for attendance tracking in the AstroBSM system.

## Prerequisites

1. **DigitalPersona U.are.U SDK** - Must be installed on the Windows machine
   - Location: `C:\Users\USER\Documents\Wound Care Business\BRANDING FILE\u are u`
   - Or standard installation paths

2. **Compatible Fingerprint Reader** - DigitalPersona U.are.U series

3. **Windows Environment** - Required for COM interface with the SDK

## Installation

### 1. Automatic Setup (Recommended)

Run the setup script as Administrator:

```powershell
cd backend
python setup_fingerprint.py
```

This will:
- Check for DigitalPersona SDK
- Install Python dependencies
- Set up database migration
- Install Windows service
- Configure firewall rules
- Create desktop shortcut

### 2. Manual Setup

If automatic setup fails, follow these steps:

#### Install Dependencies
```bash
pip install pywin32 asyncpg
```

#### Database Migration
```bash
cd backend
python -m alembic upgrade head
```

#### Install Windows Service
```bash
python fingerprint_service.py install
python fingerprint_service.py start
```

## Usage

### 1. Fingerprint Enrollment

Before staff can use fingerprint attendance, they must be enrolled:

1. Navigate to the Fingerprint Attendance page
2. Click "Enroll Fingerprint"
3. Select the staff member
4. Follow the on-screen instructions to scan the finger 4 times
5. Enrollment is complete when you see a success message

### 2. Attendance Recording

Staff can record attendance using fingerprint:

1. Select "Clock In" or "Clock Out"
2. Click "Scan for IN/OUT"
3. Place finger on the scanner
4. System will identify the user and record attendance

### 3. System Status

The interface shows:
- **Reader Status**: Connected/Disconnected
- **SDK Status**: Available/Simulation Mode
- **Template Count**: Number of enrolled fingerprints

## API Endpoints

### Fingerprint Management

- `GET /api/v1/fingerprint/status` - Get system status
- `POST /api/v1/fingerprint/enroll` - Enroll a fingerprint
- `POST /api/v1/fingerprint/verify` - Verify fingerprint and record attendance
- `GET /api/v1/fingerprint/templates` - List all templates
- `DELETE /api/v1/fingerprint/templates/{staff_id}` - Delete template
- `POST /api/v1/fingerprint/test-capture` - Test scanner functionality

### Enhanced Attendance

The attendance system now includes:
- `fingerprint_verified`: Boolean indicating if attendance was verified by fingerprint
- `verification_confidence`: Confidence score (0-100)
- `auth_method`: 'fingerprint', 'manual', or 'web'
- `device_info`: JSON metadata about the verification device

## Architecture

### Components

1. **Fingerprint Service** (`app/services/fingerprint_service.py`)
   - Interfaces with DigitalPersona SDK
   - Handles enrollment and verification
   - Provides mock functionality when SDK unavailable

2. **API Endpoints** (`app/api/v1/endpoints/fingerprint.py`)
   - RESTful API for fingerprint operations
   - Integrates with attendance system
   - Handles staff identification

3. **Database Models**
   - `FingerprintTemplate` - Stores encrypted fingerprint templates
   - Enhanced `AttendanceRecord` - Includes fingerprint verification data

4. **Windows Service** (`fingerprint_service.py`)
   - Background service for fingerprint operations
   - Runs on port 8001
   - Provides health monitoring

5. **React Component** (`FingerprintAttendance.js`)
   - User interface for enrollment and verification
   - Real-time status monitoring
   - Staff management integration

### Data Flow

1. **Enrollment**:
   ```
   User selects staff → Capture 4 samples → Create template → Store in database
   ```

2. **Attendance**:
   ```
   User scans finger → Verify against templates → Identify staff → Record attendance
   ```

## Configuration

### Environment Variables

Add to your `.env` file:
```
FINGERPRINT_SERVICE_PORT=8001
FINGERPRINT_LOG_LEVEL=INFO
```

### Service Configuration

The Windows service can be managed with:
```bash
# Start service
python fingerprint_service.py start

# Stop service
python fingerprint_service.py stop

# Restart service
python fingerprint_service.py restart

# Remove service
python fingerprint_service.py remove
```

## Troubleshooting

### Common Issues

1. **"SDK not available"**
   - Ensure DigitalPersona SDK is installed
   - Check if running in simulation mode

2. **"Reader not connected"**
   - Verify fingerprint reader is plugged in
   - Check device manager for proper driver installation

3. **"Service won't start"**
   - Run as Administrator
   - Check Windows Event Viewer for errors
   - Verify firewall settings

4. **"Enrollment fails"**
   - Ensure finger is clean and dry
   - Try different finger positions
   - Check finger placement on scanner

### Logs

Check these log files for debugging:
- `fingerprint_service.log` - Service operations
- Backend application logs - API errors
- Windows Event Viewer - Service installation issues

### Simulation Mode

When the DigitalPersona SDK is not available, the system runs in simulation mode:
- Mock fingerprint capture
- Always successful verification (for testing)
- Template storage still works
- All UI functionality available

## Security Considerations

1. **Template Storage**: Fingerprint templates are encrypted and stored securely
2. **Network Security**: Service runs on localhost only by default
3. **Access Control**: Only authorized users can enroll fingerprints
4. **Audit Trail**: All fingerprint operations are logged

## Production Deployment

For production deployment:

1. Install DigitalPersona SDK on the server
2. Configure firewall rules appropriately
3. Set up monitoring for the fingerprint service
4. Regular backup of fingerprint templates
5. Test disaster recovery procedures

## Support

For issues with the fingerprint integration:

1. Check the troubleshooting section above
2. Review log files for error details
3. Verify DigitalPersona SDK installation
4. Contact system administrator

---

*Last updated: August 7, 2025*
