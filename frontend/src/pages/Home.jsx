import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>
      {/* Hero section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #12315C 0%, #1a4a8a 60%, #2F6FED 100%)',
          color: '#fff',
          padding: '5rem 0 4rem',
        }}
      >
        <div className="container text-center">
          <span style={{ fontSize: '3.5rem' }}>🎯</span>
          <h1 className="display-5 fw-bold mt-3 mb-3">
            Find Your Perfect Mentor
          </h1>
          <p className="lead opacity-75 mb-4" style={{ maxWidth: 560, margin: '0 auto 2rem' }}>
            Book 1-on-1 sessions with industry experts. Get personalised guidance to accelerate your career.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/mentors" className="btn btn-light btn-lg px-4 fw-semibold" style={{ color: '#12315C' }}>
              Browse Mentors
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                Get Started Free
              </Link>
            )}
            {user && user.role === 'mentor' && (
              <Link to="/dashboard" className="btn btn-outline-light btn-lg px-4">
                My Dashboard
              </Link>
            )}
            {user && user.role === 'candidate' && (
              <Link to="/my-bookings" className="btn btn-outline-light btn-lg px-4">
                My Bookings
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="container py-5">
        <div className="row g-4 justify-content-center">
          {[
            { icon: '🔍', title: 'Browse by Skill', desc: 'Filter mentors by expertise to find the exact guidance you need.' },
            { icon: '📅', title: 'Book Open Slots', desc: 'See real-time availability and book sessions in seconds.' },
            { icon: '✅', title: 'Instant Confirmation', desc: 'Get a meeting link by email the moment your mentor approves.' },
          ].map((f) => (
            <div className="col-md-4" key={f.title}>
              <div className="card h-100 border-0 text-center p-4 card-hover" style={{ boxShadow: '0 2px 12px rgba(18,49,92,0.08)', borderRadius: '0.75rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h5 className="fw-semibold mb-2" style={{ color: '#12315C' }}>{f.title}</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Home;
