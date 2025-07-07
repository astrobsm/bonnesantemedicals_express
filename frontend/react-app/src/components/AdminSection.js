import React from 'react';
import './AdminSection.css';

const AdminSection = ({ title, children }) => (
  <section className="admin-section">
    <h2>{title}</h2>
    <div className="admin-section-content">{children}</div>
  </section>
);

export default AdminSection;
