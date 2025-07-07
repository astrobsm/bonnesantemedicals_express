# AstroBSM-Oracle IVANSTAMAS

AstroBSM-Oracle IVANSTAMAS is a comprehensive web-based ERP platform designed to streamline various business operations, including sales inventory, production inventory, factory inventory, staff management, attendance tracking, payroll, accounting, and reporting. This platform aims to enhance efficiency and provide insightful analysis for better decision-making.

## Features

- **Sales Inventory Management**: Track product intake, stock levels, and generate invoices.
- **Production Inventory Management**: Manage raw materials, production requirements, and output.
- **Factory Inventory Management**: Oversee machinery and tools, including maintenance logs and fault reporting.
- **Staff Management**: Handle staff registration, attendance tracking, and performance reporting.
- **Payroll & Accounting**: Calculate salaries, manage expenses, and generate financial reports.
- **Reports & Analysis**: Generate various reports to analyze sales, production efficiency, and staff performance.

## Technical Stack

- **Backend**: Python (FastAPI)
- **Frontend**: React (main UI) + Angular (production module) + Vanilla JS/HTML for service worker
- **Database**: PostgreSQL
- **Offline Support**: Service Worker + IndexedDB (localForage)
- **Authentication**: JWT tokens, password hashing (bcrypt)
- **Deployment**: Docker Compose (FastAPI, Postgres, Nginx)

## Installation

1. **Clone the repository**:
   ```
   git clone https://github.com/yourusername/AstroBSM-Oracle-IVANSTAMAS.git
   cd AstroBSM-Oracle-IVANSTAMAS
   ```

2. **Set up the backend**:
   - Navigate to the `backend` directory.
   - Install dependencies:
     ```
     pip install -r requirements.txt
     ```
   - Configure the database connection in `backend/app/core/config.py`.

3. **Run the backend**:
   ```
   uvicorn app.main:app --reload
   ```

4. **Set up the frontend**:
   - Navigate to the `frontend/react-app` directory.
   - Install dependencies:
     ```
     npm install
     ```
   - Start the React application:
     ```
     npm start
     ```

5. **For the Angular production module**:
   - Navigate to the `frontend/angular-production-module` directory.
   - Install dependencies:
     ```
     npm install
     ```
   - Start the Angular application:
     ```
     ng serve
     ```

## Usage

- Access the application via your web browser at `http://localhost:8000`.
- Use the login page to authenticate with your credentials.
- Navigate through the dashboard to access various modules.

## Next Steps

- Finalize the ER diagram and database migrations.
- Implement authentication and registration flows.
- Develop modules iteratively and test online/offline functionalities.
- Deploy the application using Docker Compose.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.