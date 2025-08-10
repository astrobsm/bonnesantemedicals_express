
import React, { useEffect, useState } from 'react';

import { MODERN_FONTS, HOSPITAL_BACKGROUNDS, MODERN_THEMES } from '../assets/modernUiOptions';
import './Settings.css';

const Settings = () => {
    const [allSettings, setAllSettings] = useState([]); // Array of all settings rows
    const [settings, setSettings] = useState({ page_name: '', background_image: '', font_family: '', theme: '' });
    const [selectedPage, setSelectedPage] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [selectedFont, setSelectedFont] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('');
    const [selectedBackground, setSelectedBackground] = useState('');

    // Grant Access UI state
    const [users, setUsers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [userWarehouseAccess, setUserWarehouseAccess] = useState([]);
    const [userSectionAccess, setUserSectionAccess] = useState([]);
    const [showGrantAccess, setShowGrantAccess] = useState(false);

    const pages = [
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/registration', name: 'Registration' },
        { path: '/inventory', name: 'Inventory' },
        { path: '/payroll', name: 'Payroll' },
        { path: '/attendance', name: 'Attendance' },
        { path: '/factory-inventory', name: 'Factory Inventory' },
        { path: '/login', name: 'Login' },
        { path: '/stock-intake', name: 'Stock Intake' },
        { path: '/stock-level', name: 'Stock Level' },
        { path: '/grant-access', name: 'Grant Access' },
        { path: '/timed-attendance', name: 'Timed Attendance' },
        { path: '/attendance-record', name: 'Attendance Record' },
        { path: '/attendance-analysis', name: 'Attendance Analysis' },
        { path: '/product-stock-intake', name: 'Product Stock Intake' },
        { path: '/product-stock-level', name: 'Product Stock Level' },
        { path: '/generate-invoice', name: 'Generate Invoice' },
        { path: '/sales-summary', name: 'Sales Summary' },
        { path: '/customer-performance', name: 'Customer Performance' },
        { path: '/sales-inventory', name: 'Sales Inventory' },
        { path: '/database-table', name: 'Database Table' },
        { path: '/register-customer', name: 'Register Customer' },
        // Add more pages as needed
    ];

    const [settingsError, setSettingsError] = useState('');
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/v1/settings');
                if (!response.ok) {
                    setAllSettings([]);
                    setSettingsError('Settings not found. You may need to configure them.');
                    return;
                }
                const data = await response.json();
                setAllSettings(data);
                setSettingsError('');
            } catch (error) {
                setAllSettings([]);
                setSettingsError('Error fetching settings.');
            }
        };
        fetchSettings();
    }, []);

    // When selectedPage changes, update settings state to match that page's settings
    useEffect(() => {
        if (!selectedPage) {
            setSettings({ page_name: '', background_image: '', font_family: '', theme: '' });
            setUploadedImage(null);
            setSelectedFont('');
            setSelectedTheme('');
            setSelectedBackground('');
            return;
        }
        const found = allSettings.find(s => s.page_name === selectedPage);
        if (found) {
            setSettings(found);
            setUploadedImage(found.background_image || null);
            setSelectedFont(found.font_family || '');
            setSelectedTheme(found.theme || '');
            setSelectedBackground(found.background_image || '');
        } else {
            setSettings({ page_name: selectedPage, background_image: '', font_family: '', theme: '' });
            setUploadedImage(null);
            setSelectedFont('');
            setSelectedTheme('');
            setSelectedBackground('');
        }
    }, [selectedPage, allSettings]);

    // Fetch users and warehouses for Grant Access
    useEffect(() => {
        if (showGrantAccess) {
            fetch('/api/v1/auth/list-users').then(res => res.json()).then(setUsers);
            fetch('/api/v1/warehouses').then(res => res.json()).then(setWarehouses);
        }
    }, [showGrantAccess]);

    // Fetch access for selected user
    useEffect(() => {
        if (selectedUser) {
            fetch(`/api/v1/access/user/${selectedUser}`).then(res => res.json()).then(data => {
                setUserWarehouseAccess(data.warehouses || []);
                setUserSectionAccess(data.sections || []);
            });
        }
    }, [selectedUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/v1/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
            const data = await response.json();
            alert(data.message || 'Settings updated successfully!');
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    const handlePageChange = (e) => {
        setSelectedPage(e.target.value);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setUploadedImage(reader.result);
                setSettings(prev => ({ ...prev, background_image: reader.result }));
                alert(`Background image for ${selectedPage} updated successfully!`);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFontChange = (e) => {
        const font = e.target.value;
        setSelectedFont(font);
        setSettings(prev => ({ ...prev, font_family: font }));
        // Dynamically load Google Font if needed
        const fontObj = MODERN_FONTS.find(f => f.css === font);
        if (fontObj && fontObj.import) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fontObj.import;
            document.head.appendChild(link);
        }
        document.body.style.fontFamily = font;
        alert(`Font changed to ${font} successfully!`);
    };

    const handleThemeChange = (e) => {
        const theme = e.target.value;
        setSelectedTheme(theme);
        setSettings(prev => ({ ...prev, theme }));
        const themeObj = MODERN_THEMES.find(t => t.value === theme);
        if (themeObj) {
            document.body.style.background = themeObj.colors.background;
            document.body.style.color = themeObj.colors.text;
        }
        alert(`Theme changed to ${themeObj ? themeObj.label : theme}`);
    };

    const handleBackgroundChange = (e) => {
        const url = e.target.value;
        setSelectedBackground(url);
        setUploadedImage(url);
        setSettings(prev => ({ ...prev, background_image: url }));
        document.body.style.backgroundImage = `url('${url}')`;
        document.body.style.backgroundSize = 'cover';
        alert('Background image updated!');
    };

    const handleApplyChanges = async () => {
        if (!selectedPage) {
            alert('Please select a page to apply settings.');
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/api/v1/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page_name: selectedPage,
                    background_image: uploadedImage,
                    font_family: selectedFont,
                    theme: settings.theme || 'light',
                }),
            });
            const data = await response.json();
            alert('Settings applied successfully!');
            // Refresh settings after update
            const refreshed = await fetch('/api/v1/settings');
            if (refreshed.ok) {
                setAllSettings(await refreshed.json());
            }
        } catch (error) {
            alert('Error applying settings.');
        }
    };

    const handleGrantWarehouse = async (warehouseId, grant) => {
        await fetch('/api/v1/access/warehouse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: selectedUser, warehouse_id: warehouseId, grant })
        });
        // Refresh
        setUserWarehouseAccess(grant
            ? [...userWarehouseAccess, warehouseId]
            : userWarehouseAccess.filter(id => id !== warehouseId));
    };
    const handleGrantSection = async (section, grant) => {
        await fetch('/api/v1/access/section', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: selectedUser, section_name: section, grant })
        });
        setUserSectionAccess(grant
            ? [...userSectionAccess, section]
            : userSectionAccess.filter(s => s !== section));
    };

    return (
        <div className="settings-container">
            <h1>Settings</h1>
            {settingsError && (
                <div style={{ color: 'red', marginBottom: 16 }}>{settingsError}</div>
            )}
            <div className="settings-buttons">
                <div>
                    <label htmlFor="background-select">Select Hospital Background:</label>
                    <select id="background-select" value={selectedBackground} onChange={handleBackgroundChange}>
                        <option value="">--Select a Background--</option>
                        {HOSPITAL_BACKGROUNDS.map(bg => (
                            <option key={bg.url} value={bg.url}>{bg.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="font-select">Select Font:</label>
                    <select id="font-select" value={selectedFont} onChange={handleFontChange}>
                        <option value="">--Select a Font--</option>
                        {MODERN_FONTS.map(f => (
                            <option key={f.label} value={f.css}>{f.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="theme-select">Select Theme:</label>
                    <select id="theme-select" value={selectedTheme} onChange={handleThemeChange}>
                        <option value="">--Select a Theme--</option>
                        {MODERN_THEMES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="page-select">Select Page:</label>
                    <select id="page-select" value={selectedPage} onChange={handlePageChange}>
                        <option value="">--Select a Page--</option>
                        {pages.map((page) => (
                            <option key={page.path} value={page.path}>{page.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="image-upload">Upload Background Image:</label>
                    <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={!selectedPage}
                    />
                </div>
                {/* Removed duplicate font dropdown */}
                <button onClick={handleApplyChanges} style={{marginTop: 16, background: '#1976d2', color: 'white', padding: '8px 24px', border: 'none', borderRadius: 4, fontWeight: 'bold'}}>Apply Changes</button>
                <button onClick={() => setShowGrantAccess(true)} style={{marginTop: 16, background: '#388e3c', color: 'white', padding: '8px 24px', border: 'none', borderRadius: 4, fontWeight: 'bold'}}>Grant Access</button>
            </div>
            {showGrantAccess && (
                <div className="grant-access-modal">
                    <h2>Grant Access</h2>
                    <label>Select User:
                        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                            <option value="">--Select User--</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                        </select>
                    </label>
                    <h3>Warehouses</h3>
                    {warehouses.map(w => (
                        <div key={w.id}>
                            <input type="checkbox" checked={userWarehouseAccess.includes(w.id)} onChange={e => handleGrantWarehouse(w.id, e.target.checked)} />
                            {w.name}
                        </div>
                    ))}
                    <h3>Sections/Pages</h3>
                    {pages.map(p => (
                        <div key={p.path}>
                            <input type="checkbox" checked={userSectionAccess.includes(p.path)} onChange={e => handleGrantSection(p.path, e.target.checked)} />
                            {p.name}
                        </div>
                    ))}
                    <button onClick={() => setShowGrantAccess(false)} style={{marginTop: 16}}>Close</button>
                </div>
            )}
        </div>
    );
};

export default Settings;