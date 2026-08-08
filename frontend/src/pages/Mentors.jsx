import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Slider from 'react-slick';
import AOS from 'aos';
import { fetchMentors } from '../features/mentors/mentorsSlice';
import Layout from '../components/Layout';

// Import Slick + AOS styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'aos/dist/aos.css';

// ─────────────────────────────────────────────────────────────────────────────
// Mentor Card — used in both the carousel and the grid
// ─────────────────────────────────────────────────────────────────────────────
const MentorCard = ({ mentor, aosDelay = 0, featured = false }) => (
  <div
    className={`card h-100 border-0 ${featured ? '' : 'card-hover'}`}
    data-aos="fade-up"
    data-aos-delay={aosDelay}
    style={{
      boxShadow: '0 2px 12px rgba(18,49,92,0.09)',
      borderRadius: '0.75rem',
      margin: featured ? '0 8px' : 0,
    }}
  >
    {/* Coloured top stripe */}
    <div style={{ height: 5, background: 'linear-gradient(90deg,#12315C,#2F6FED)', borderRadius: '0.75rem 0.75rem 0 0' }} />
    <div className="card-body p-3">
      {/* Avatar placeholder */}
      <div
        className="rounded-circle d-flex align-items-center justify-content-center mb-3"
        style={{ width: 52, height: 52, background: '#12315C18', color: '#12315C', fontWeight: 700, fontSize: '1.2rem' }}
      >
        {mentor.name?.charAt(0).toUpperCase()}
      </div>

      <h5 className="fw-semibold mb-1" style={{ fontSize: '1rem', color: '#12315C' }}>{mentor.name}</h5>

      <p className="text-muted mb-2" style={{ fontSize: '0.83rem', lineHeight: 1.5, minHeight: 38, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {mentor.bio || 'Expert mentor ready to guide your career journey.'}
      </p>

      {/* Expertise tags */}
      <div className="d-flex flex-wrap gap-1 mb-3">
        {(mentor.expertiseTags || []).slice(0, 4).map((tag) => (
          <span
            key={tag}
            style={{
              background: '#2F6FED12',
              color: '#2F6FED',
              border: '1px solid #2F6FED30',
              borderRadius: '50rem',
              padding: '0.15rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {tag}
          </span>
        ))}
        {(mentor.expertiseTags || []).length === 0 && (
          <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>No tags yet</span>
        )}
      </div>

      <Link
        to={`/mentors/${mentor._id}`}
        className="btn btn-sm w-100 fw-medium text-white"
        style={{ background: '#12315C', borderRadius: '0.45rem' }}
      >
        View Profile →
      </Link>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Mentors Page
// ─────────────────────────────────────────────────────────────────────────────
const Mentors = () => {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((state) => state.mentors);

  const [skillInput, setSkillInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const filterInputRef = useRef(null);

  // ── Fetch mentors on mount and when filter changes ────────────────────────
  useEffect(() => {
    dispatch(fetchMentors(activeFilter));
  }, [dispatch, activeFilter]);

  // ── Init + refresh AOS when mentor list updates ───────────────────────────
  useEffect(() => {
    AOS.init({ duration: 600, once: true, offset: 60 });
  }, []);

  useEffect(() => {
    if (status === 'succeeded') AOS.refresh();
  }, [status, list]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFilter = (e) => {
    e.preventDefault();
    setActiveFilter(skillInput.trim());
  };

  const handleClear = () => {
    setSkillInput('');
    setActiveFilter('');
    filterInputRef.current?.focus();
  };

  // ── Slick carousel settings ───────────────────────────────────────────────
  const slickSettings = {
    dots: true,
    infinite: list.length > 3,
    speed: 500,
    slidesToShow: Math.min(list.length, 3),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: Math.min(list.length, 2) } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  const featuredMentors = list.slice(0, 6); // Show up to 6 in carousel

  return (
    <Layout>
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg,#12315C 0%,#2F6FED 100%)',
          padding: '3rem 0 2.5rem',
          color: '#fff',
        }}
      >
        <div className="container text-center">
          <h1 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>Browse Mentors</h1>
          <p className="opacity-75 mb-0" style={{ fontSize: '0.95rem' }}>
            Find expert guidance tailored to your goals
          </p>
        </div>
      </section>

      <div className="container py-4">

        {/* ── Skill Filter ──────────────────────────────────────────────── */}
        <div className="mb-4">
          <form onSubmit={handleFilter} className="d-flex gap-2 flex-wrap align-items-center">
            <input
              ref={filterInputRef}
              type="text"
              className="form-control"
              placeholder="Filter by skill (e.g. React, Python…)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              style={{ maxWidth: 320, borderRadius: '0.5rem' }}
            />
            <button
              type="submit"
              className="btn fw-medium text-white"
              style={{ background: '#12315C', borderRadius: '0.5rem' }}
            >
              Search
            </button>
            {activeFilter && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                style={{ borderRadius: '0.5rem' }}
                onClick={handleClear}
              >
                ✕ Clear "{activeFilter}"
              </button>
            )}
          </form>
          {activeFilter && status === 'succeeded' && (
            <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.85rem' }}>
              {list.length} mentor{list.length !== 1 ? 's' : ''} match "{activeFilter}"
            </p>
          )}
        </div>

        {/* ── Loading / Error ───────────────────────────────────────────── */}
        {status === 'loading' && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#12315C' }} role="status" />
            <p className="text-muted mt-2">Loading mentors…</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="alert alert-danger">{error}</div>
        )}

        {status === 'succeeded' && list.length === 0 && (
          <div className="text-center py-5">
            <span style={{ fontSize: '2.5rem' }}>🔍</span>
            <p className="text-muted mt-2">No mentors found{activeFilter ? ` for "${activeFilter}"` : ''}.</p>
            {activeFilter && (
              <button className="btn btn-outline-secondary btn-sm" onClick={handleClear}>
                Clear filter
              </button>
            )}
          </div>
        )}

        {/* ── Featured Mentors carousel (React Slick) ───────────────────── */}
        {status === 'succeeded' && featuredMentors.length > 0 && (
          <section className="mb-5">
            <h2 className="fw-semibold mb-3" style={{ fontSize: '1.15rem', color: '#12315C' }}>
              ⭐ Featured Mentors
            </h2>
            <Slider {...slickSettings}>
              {featuredMentors.map((m) => (
                <div key={m._id} style={{ padding: '0 8px' }}>
                  <MentorCard mentor={m} featured />
                </div>
              ))}
            </Slider>
          </section>
        )}

        {/* ── All Mentors grid (AOS fade-up) ───────────────────────────── */}
        {status === 'succeeded' && list.length > 0 && (
          <section>
            <h2 className="fw-semibold mb-3" style={{ fontSize: '1.15rem', color: '#12315C' }}>
              {activeFilter ? `Results for "${activeFilter}"` : 'All Mentors'}
            </h2>
            <div className="row g-3">
              {list.map((m, idx) => (
                <div className="col-12 col-sm-6 col-lg-4" key={m._id}>
                  <MentorCard mentor={m} aosDelay={(idx % 6) * 60} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Mentors;
