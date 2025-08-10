import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import './Sidebar.responsive.css';

const Sidebar = ({ userRole = 'user' }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [expandedSections, setExpandedSections] = React.useState({});
    const sidebarRef = useRef(null);
    const firstLinkRef = useRef(null);
    const sidebarToggleRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Toggle sidebar and body class
    useEffect(() => {
        if (sidebarOpen) {
            document.body.classList.add('sidebar-open');
            // Focus trap: focus first link
            setTimeout(() => firstLinkRef.current && firstLinkRef.current.focus(), 100);
        } else {
            document.body.classList.remove('sidebar-open');
            // Move focus to sidebar toggle button when sidebar closes
            setTimeout(() => sidebarToggleRef.current && sidebarToggleRef.current.focus(), 100);
        }
        // Cleanup on unmount
        return () => document.body.classList.remove('sidebar-open');
    }, [sidebarOpen]);

    // Close sidebar on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (sidebarOpen && e.key === 'Escape') setSidebarOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sidebarOpen]);

    // Basic swipe gesture to close (left swipe)
    useEffect(() => {
        let startX = null;
        const handleTouchStart = (e) => {
            if (e.touches.length === 1) startX = e.touches[0].clientX;
        };
        const handleTouchMove = (e) => {
            if (!sidebarOpen || startX === null) return;
            const diff = e.touches[0].clientX - startX;
            if (diff < -60) { setSidebarOpen(false); startX = null; }
        };
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [sidebarOpen]);

    // Logout logic
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const handleSidebarToggle = () => {
        if (sidebarOpen) {
            // Move focus to the toggle button before hiding sidebar
            sidebarToggleRef.current && sidebarToggleRef.current.focus();
        }
        setSidebarOpen(!sidebarOpen);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const isActive = (path) => location.pathname === path;

    const navigationSections = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: '🏠',
            items: [
                { path: '/dashboard', label: 'Main Dashboard', icon: '📊' },
                { path: '/admin-dashboard', label: 'Admin Dashboard', icon: '👨‍💼', role: 'admin' }
            ]
        },
        {
            id: 'inventory',
            title: 'Inventory Management',
            icon: '📦',
            items: [
                { path: '/sales-inventory', label: 'Sales Inventory', icon: '💰' },
                { path: '/production-inventory', label: 'Production Inventory', icon: '🏭' },
                { path: '/factory-inventory', label: 'Factory Inventory', icon: '🏗️' },
                { path: '/admin/inventory', label: 'Inventory Admin', icon: '⚙️', role: 'admin' }
            ]
        },
        {
            id: 'production',
            title: 'Production',
            icon: '🏭',
            items: [
                { path: '/raw-material-stock-intake', label: 'Raw Material Intake', icon: '📥' },
                { path: '/raw-material-stock-level', label: 'Raw Material Levels', icon: '📈' },
                { path: '/production-console', label: 'Production Console', icon: '🎛️' },
                { path: '/production-output', label: 'Production Output', icon: '📤' },
                { path: '/production-analysis', label: 'Production Analysis', icon: '📊' }
            ]
        },
        {
            id: 'staff',
            title: 'Staff Management',
            icon: '👥',
            items: [
                { path: '/staff-management', label: 'Staff Management', icon: '👨‍💼' },
                { path: '/staff-list', label: 'Staff Directory', icon: '📋' },
                { path: '/staff-appraisal', label: 'Staff Appraisal', icon: '⭐' },
                { path: '/staff-performance', label: 'Performance Monitor', icon: '📈' }
            ]
        },
        {
            id: 'payroll',
            title: 'Payroll & Finance',
            icon: '💰',
            items: [
                { path: '/payroll', label: 'Payroll Management', icon: '💵' },
                { path: '/salary-calculation', label: 'Salary Calculator', icon: '🧮' },
                { path: '/salary-console', label: 'Salary Console', icon: '💻' },
                { path: '/salary-records', label: 'Salary Records', icon: '📊' },
                { path: '/salary-report', label: 'Salary Reports', icon: '📈' }
            ]
        },
        {
            id: 'attendance',
            title: 'Attendance',
            icon: '⏰',
            items: [
                { path: '/attendance', label: 'Attendance System', icon: '📅' },
                { path: '/timed-attendance', label: 'Timed Attendance', icon: '⏱️' },
                { path: '/attendance-record', label: 'Attendance Records', icon: '📝' },
                { path: '/attendance-analysis', label: 'Attendance Analysis', icon: '📊' }
            ]
        },
        {
            id: 'sales',
            title: 'Sales & Customers',
            icon: '🛒',
            items: [
                { path: '/sales-summary', label: 'Sales Summary', icon: '📈' },
                { path: '/customer-performance', label: 'Customer Performance', icon: '👥' },
                { path: '/generate-invoice', label: 'Generate Invoice', icon: '🧾' },
                { path: '/create-invoice', label: 'Create Invoice', icon: '📄' },
                { path: '/admin/customers', label: 'Customer Management', icon: '👨‍💼', role: 'admin' }
            ]
        },
        {
            id: 'admin',
            title: 'Administration',
            icon: '⚙️',
            role: 'admin',
            items: [
                { path: '/admin/users', label: 'User Management', icon: '👤' },
                { path: '/admin/user-approvals', label: 'User Approvals', icon: '✅' },
                { path: '/admin/suppliers', label: 'Supplier Management', icon: '🏢' },
                { path: '/admin/reports', label: 'Admin Reports', icon: '📊' },
                { path: '/admin/settings', label: 'System Settings', icon: '⚙️' }
            ]
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            icon: '📊',
            items: [
                { path: '/reports-analysis', label: 'Reports Analysis', icon: '📈' },
                { path: '/customers-performance', label: 'Customer Analytics', icon: '📊' },
                { path: '/database-table', label: 'Database Explorer', icon: '🗃️' }
            ]
        }
    ];

    return (
        <>
            <button
                ref={sidebarToggleRef}
                className="sidebar-toggle"
                onClick={handleSidebarToggle}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={sidebarOpen}
                aria-controls="sidebar-nav"
                style={{ left: sidebarOpen ? (window.innerWidth <= 900 ? (window.innerWidth <= 600 ? '90vw' : '70vw') : '250px') : '20px', transition: 'left 0.3s' }}
            >
                {sidebarOpen ? <span>&#8592;</span> : <span>&#9776;</span>}
            </button>
            {sidebarOpen && <div className="sidebar-backdrop" aria-hidden={!sidebarOpen} tabIndex={-1} onClick={handleSidebarToggle}></div>}
            <nav
                ref={sidebarRef}
                className={`sidebar${sidebarOpen ? ' open' : ''}`}
                id="sidebar-nav"
                aria-hidden={!sidebarOpen}
                tabIndex={sidebarOpen ? 0 : -1}
                aria-label="Sidebar navigation"
                {...(!sidebarOpen ? { inert: "" } : {})}
            >
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">🌟</span>
                        <span className="logo-text">AstroBSM</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} tabIndex={sidebarOpen ? 0 : -1}>
                        <span className="logout-icon">🚪</span>
                        Log Out
                    </button>
                </div>
                
                <div className="sidebar-nav">
                    {navigationSections.map((section) => {
                        // Filter sections by user role
                        if (section.role && section.role !== userRole) return null;
                        
                        const visibleItems = section.items.filter(item => 
                            !item.role || item.role === userRole
                        );
                        
                        if (visibleItems.length === 0) return null;
                        
                        return (
                            <div key={section.id} className="nav-section">
                                <button 
                                    className={`nav-section-header ${expandedSections[section.id] ? 'expanded' : ''}`}
                                    onClick={() => toggleSection(section.id)}
                                    tabIndex={sidebarOpen ? 0 : -1}
                                >
                                    <span className="section-icon">{section.icon}</span>
                                    <span className="section-title">{section.title}</span>
                                    <span className="section-arrow">
                                        {expandedSections[section.id] ? '▼' : '▶'}
                                    </span>
                                </button>
                                
                                {expandedSections[section.id] && (
                                    <ul className="nav-section-items">
                                        {visibleItems.map((item, index) => (
                                            <li key={item.path} className={isActive(item.path) ? 'active' : ''}>
                                                <Link 
                                                    to={item.path} 
                                                    ref={index === 0 && section.id === 'dashboard' ? firstLinkRef : null}
                                                    tabIndex={sidebarOpen ? 0 : -1} 
                                                    onClick={handleSidebarToggle}
                                                    className="nav-link"
                                                >
                                                    <span className="nav-icon">{item.icon}</span>
                                                    <span className="nav-label">{item.label}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                    
                    {/* Quick Access Section */}
                    <div className="nav-section">
                        <div className="nav-section-header">
                            <span className="section-icon">⚡</span>
                            <span className="section-title">Quick Access</span>
                        </div>
                        <ul className="nav-section-items">
                            <li>
                                <Link to="/registration" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle} className="nav-link">
                                    <span className="nav-icon">📝</span>
                                    <span className="nav-label">Registration</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/settings" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle} className="nav-link">
                                    <span className="nav-icon">⚙️</span>
                                    <span className="nav-label">Settings</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;