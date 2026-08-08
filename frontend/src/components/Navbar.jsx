import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [navOpen, setNavOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: '#12315C' }}>
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '1.4rem' }}>🎯</span>
          <strong>Jobfam</strong>
          <span className="fw-light opacity-75" style={{ fontSize: '0.9rem' }}>Mentor Booking</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Links */}
        <div className={`collapse navbar-collapse ${navOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            {/* Always visible */}
            <li className="nav-item">
              <NavLink className="nav-link" to="/mentors" onClick={() => setNavOpen(false)}>
                Browse Mentors
              </NavLink>
            </li>

            {/* Logged in — role-specific links */}
            {user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile" onClick={() => setNavOpen(false)}>
                    Profile
                  </NavLink>
                </li>

                {user.role === 'candidate' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/my-bookings" onClick={() => setNavOpen(false)}>
                      My Bookings
                    </NavLink>
                  </li>
                )}

                {user.role === 'mentor' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/dashboard" onClick={() => setNavOpen(false)}>
                      Dashboard
                    </NavLink>
                  </li>
                )}

                <li className="nav-item ms-lg-2">
                  <span className="navbar-text me-2 opacity-75 d-none d-lg-inline" style={{ fontSize: '0.85rem' }}>
                    {user.name}
                  </span>
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

            {/* Not logged in */}
            {!user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login" onClick={() => setNavOpen(false)}>
                    Login
                  </NavLink>
                </li>
                <li className="nav-item ms-lg-1">
                  <NavLink
                    className="btn btn-secondary btn-sm text-white"
                    to="/register"
                    onClick={() => setNavOpen(false)}
                    style={{ background: '#2F6FED', border: 'none' }}
                  >
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
