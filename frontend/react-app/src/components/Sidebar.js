import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import './Sidebar.responsive.css';

const Sidebar = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const sidebarRef = useRef(null);
    const firstLinkRef = useRef(null);
    const sidebarToggleRef = useRef(null);
    const navigate = useNavigate();

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
        // Optionally clear other user/session data here
        navigate('/login');
    };

    const handleSidebarToggle = () => {
        if (sidebarOpen) {
            // Move focus to the toggle button before hiding sidebar
            sidebarToggleRef.current && sidebarToggleRef.current.focus();
        }
        setSidebarOpen(!sidebarOpen);
    };

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
                    <button className="logout-btn" onClick={handleLogout} tabIndex={sidebarOpen ? 0 : -1}>
                        Log Out
                    </button>
                </div>
                <h2>Navigation</h2>
                <ul>
                    <li><Link to="/dashboard" ref={firstLinkRef} tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Dashboard</Link></li>
                    <li><Link to="/registration" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Registration</Link></li>
                    <li><Link to="/attendance" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Attendance</Link></li>
                    <li><Link to="/sales-inventory" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Sales Inventory</Link></li>
                    <li><Link to="/production-inventory" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Production Inventory</Link></li>
                    <li><Link to="/factory-inventory" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Factory Inventory</Link></li>
                    <li><Link to="/staff-management" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Staff Management</Link></li>
                    <li><Link to="/payroll" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Payroll</Link></li>
                    <li><Link to="/reports-analysis" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Reports & Analysis</Link></li>
                    <li><Link to="/settings" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Settings</Link></li>
                    <li><Link to="/admin-dashboard" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Admin Dashboard</Link></li>
                    <li><Link to="/admin/users" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>Manage Users</Link></li>
                    <li><Link to="/admin/user-approvals" tabIndex={sidebarOpen ? 0 : -1} onClick={handleSidebarToggle}>User Approvals</Link></li>
                </ul>
            </nav>
        </>
    );
};

export default Sidebar;