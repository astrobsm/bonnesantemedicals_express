import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Registration from './pages/Registration';
import Inventory from './pages/Inventory';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import FactoryInventory from './pages/FactoryInventory';
import LoginPage from './pages/LoginPage';
import StockIntake from './pages/StockIntake';
import StockLevel from './pages/StockLevel';
import GrantAccess from './pages/GrantAccess';
import TimedAttendance from './pages/TimedAttendance';
import AttendanceRecord from './pages/AttendanceRecord';
import AttendanceAnalysis from './pages/AttendanceAnalysis';
import ProductStockIntake from './pages/ProductStockIntake';
import ProductStockLevel from './pages/ProductStockLevel';
import GenerateInvoice from './pages/GenerateInvoice';
import SalesSummary from './pages/SalesSummary';
import CustomerPerformance from './pages/CustomerPerformance';
import SalesInventory from './pages/SalesInventory';
import DatabaseTable from './pages/DatabaseTable';
import ProductionInventory from './pages/ProductionInventory';
import RawMaterialStockIntake from './pages/RawMaterialStockIntake';
import RawMaterialStockLevel from './pages/RawMaterialStockLevel';
import RegisterProductionRequirement from './pages/RegisterProductionRequirement';
import ProductionConsole from './pages/ProductionConsole';
import ProductionOutput from './pages/ProductionOutput';
import ProductionAnalysis from './pages/ProductionAnalysis';
import DeviceIntake from './pages/DeviceIntake';
import DeviceList from './pages/DeviceList';
import DeviceMaintenanceLog from './pages/DeviceMaintenanceLog';
import DeviceFaultReporting from './pages/DeviceFaultReporting';
import DeviceListPage from './pages/DeviceListPage';
import StaffManagement from './pages/StaffManagement';
import StaffList from './pages/StaffList';
import SalaryCalculation from './pages/SalaryCalculation';
import StaffAppraisal from './pages/StaffAppraisal';
import SalaryConsole from './pages/SalaryConsole';
import SalaryRecords from './pages/SalaryRecords';
import SalaryReport from './pages/SalaryReport';
import ReportsAnalysis from './pages/ReportsAnalysis';
import CustomersPerformance from './pages/CustomersPerformance';
import StaffPerformance from './pages/StaffPerformance';
import Settings from './pages/Settings';
import ApproveUser from './pages/ApproveUser';
import AdminDashboard from './pages/AdminDashboard';
import AdminCustomers from './pages/AdminCustomers';
import AdminSuppliers from './pages/AdminSuppliers';
import AdminUsers from './pages/AdminUsers';
import AdminInventory from './pages/AdminInventory';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminUserApprovals from './pages/AdminUserApprovals';
import DeviceFaultReport from './pages/DeviceFaultReport';
import CreateInvoice from './pages/CreateInvoice';
import ReturnedProductEntry from './pages/ReturnedProductEntry';
import WarehouseTransfer from './pages/WarehouseTransfer';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            navigate('/login');
        } else {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, [navigate]);

    if (!isAuthenticated && !isLoading) {
        return <Login />; // Render the Login component directly for unauthenticated users
    }

    console.log('Rendering Routes with current location:', window.location.pathname);

    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content" id="main-content">
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/dashboard" element={<AdminDashboard />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/factory-inventory" element={<FactoryInventory />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/stock-intake" element={<StockIntake />} />
                    <Route path="/stock-level" element={<StockLevel />} />
                    <Route path="/grant-access" element={<GrantAccess />} />
                    <Route path="/timed-attendance" element={<TimedAttendance />} />
                    <Route path="/attendance-record" element={<AttendanceRecord />} />
                    <Route path="/attendance-analysis" element={<AttendanceAnalysis />} />
                    <Route path="/product-stock-intake" element={<ProductStockIntake />} />
                    <Route path="/product-stock-level" element={<ProductStockLevel />} />
                    <Route path="/generate-invoice" element={<GenerateInvoice />} />
                    <Route path="/sales-summary" element={<SalesSummary />} />
                    <Route path="/customer-performance" element={<CustomerPerformance />} />
                    <Route path="/sales-inventory" element={<SalesInventory />} />
                    <Route path="/database-table" element={<DatabaseTable />} />
                    <Route path="/register-customer" element={<Registration />} />
                    <Route path="/production-inventory" element={<ProductionInventory />} />
                    <Route path="/raw-material-stock-intake" element={<RawMaterialStockIntake />} />
                    <Route path="/raw-material-stock-level" element={<RawMaterialStockLevel />} />
                    <Route path="/register-production-requirement" element={<RegisterProductionRequirement />} />
                    <Route path="/production-console" element={<ProductionConsole />} />
                    <Route path="/production-output" element={<ProductionOutput />} />
                    <Route path="/production-analysis" element={<ProductionAnalysis />} />
                    <Route path="/factory-inventory/device-intake" element={<DeviceIntake />} />
                    <Route path="/factory-inventory/device-list" element={<DeviceList />} />
                    <Route path="/factory-inventory/device-maintenance-log" element={<DeviceMaintenanceLog />} />
                    <Route path="/factory-inventory/device-fault-reporting" element={<DeviceFaultReporting />} />
                    <Route path="/device-list" element={<DeviceListPage />} />
                    <Route path="/device-maintenance-log" element={<DeviceMaintenanceLog />} />
                    <Route path="/device-fault-reporting" element={<DeviceFaultReporting />} />
                    <Route path="/staff-management" element={<StaffManagement />} />
                    <Route path="/staff-list" element={<StaffList />} />
                    <Route path="/salary-calculation" element={<SalaryCalculation />} />
                    <Route path="/staff-appraisal" element={<StaffAppraisal />} />
                    <Route path="/salary-console" element={<SalaryConsole />} />
                    <Route path="/salary-records" element={<SalaryRecords />} />
                    <Route path="/salary-report" element={<SalaryReport />} />
                    <Route path="/reports-analysis" element={<ReportsAnalysis />} />
                    <Route path="/customers-performance" element={<CustomersPerformance />} />
                    <Route path="/staff-performance" element={<StaffPerformance />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/approve-users" element={<ApproveUser />} />
                    <Route path="/admin/customers" element={<AdminCustomers />} />
                    <Route path="/admin/suppliers" element={<AdminSuppliers />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/inventory" element={<AdminInventory />} />
                    <Route path="/admin/reports" element={<AdminReports />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/user-approvals" element={<AdminUserApprovals />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/device-fault-report" element={<DeviceFaultReport />} />
                    <Route path="/create-invoice" element={<CreateInvoice />} />
                    <Route path="/returned-product-entry" element={<ReturnedProductEntry />} />
                    <Route path="/warehouse-transfer" element={<WarehouseTransfer />} />
                    <Route path="*" element={<div>Route not found: {window.location.pathname}</div>} />
                </Routes>
            </div>
        </div>
    );
};

export default App;