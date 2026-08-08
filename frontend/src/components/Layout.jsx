import React from 'react';
import Navbar from './Navbar';

// Shared page wrapper — ensures every page gets the navbar + consistent body padding.
// Pages slot in as children; no need to repeat the navbar in each page component.
const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        {children}
      </main>
      <footer className="py-3 text-center" style={{ background: '#12315C', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} Jobfam Mentor Booking Platform
      </footer>
    </div>
  );
};

export default Layout;
