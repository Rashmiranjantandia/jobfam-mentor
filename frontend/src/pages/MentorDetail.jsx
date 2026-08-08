import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMentorById, fetchMentorSlots, clearSelected } from '../features/mentors/mentorsSlice';
import Layout from '../components/Layout';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

// ─────────────────────────────────────────────────────────────────────────────
// MentorDetail Page
// ─────────────────────────────────────────────────────────────────────────────
const MentorDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { selected: mentor, selectedStatus, selectedError, slots, slotsStatus, slotsError } = useSelector((state) => state.mentors);

  // ── Fetch mentor + slots on mount (clear on unmount) ─────────────────────
  useEffect(() => {
    dispatch(fetchMentorById(id));
    dispatch(fetchMentorSlots(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  // ── Who can book? ─────────────────────────────────────────────────────────
  // Candidates can book. Mentors cannot (even if it's not their own profile).
  // Unauthenticated users see a "Login to Book" link.
  const isCandidate = user?.role === 'candidate';
  const isMentor = user?.role === 'mentor';
  const isOwnProfile = isMentor && mentor && user?.id === mentor._id;

  const handleBook = (slotId) => {
    if (!user) {
      // Unauthenticated — redirect to login, store intended destination
      navigate('/login');
      return;
    }
    // Phase 8 will implement the actual dispatch(createBooking(slotId)) call.
    // For now we navigate to a stable anchor point — Phase 8 wires this up.
    navigate(`/mentors/${id}?book=${slotId}`);
  };

  // ── Render states ─────────────────────────────────────────────────────────
  if (selectedStatus === 'loading') {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <div className="spinner-border" style={{ color: '#12315C' }} role="status" />
          <p className="mt-2 text-muted">Loading mentor profile…</p>
        </div>
      </Layout>
    );
  }

  if (selectedStatus === 'failed') {
    return (
      <Layout>
        <div className="container py-5">
          <div className="alert alert-danger">{selectedError}</div>
          <Link to="/mentors" className="btn btn-outline-secondary btn-sm">← Back to Mentors</Link>
        </div>
      </Layout>
    );
  }

  if (!mentor) return null;

  return (
    <Layout>
      {/* ── Back link ──────────────────────────────────────────────────── */}
      <div className="container pt-4">
        <Link to="/mentors" style={{ color: '#2F6FED', fontSize: '0.88rem', fontWeight: 500 }}>
          ← Back to Browse
        </Link>
      </div>

      <div className="container py-3 pb-5" style={{ maxWidth: 780 }}>

        {/* ── Mentor Info Card ──────────────────────────────────────────── */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '0.75rem' }}>
          {/* Gradient stripe */}
          <div style={{ height: 6, background: 'linear-gradient(90deg,#12315C,#2F6FED)', borderRadius: '0.75rem 0.75rem 0 0' }} />
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              {/* Avatar */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 64, height: 64, background: '#12315C18', color: '#12315C', fontWeight: 700, fontSize: '1.6rem' }}
              >
                {mentor.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="h4 fw-bold mb-0" style={{ color: '#12315C' }}>{mentor.name}</h1>
                <span
                  style={{
                    background: '#2F6FED12', color: '#2F6FED', border: '1px solid #2F6FED30',
                    borderRadius: '50rem', padding: '0.15rem 0.65rem', fontSize: '0.8rem', fontWeight: 600,
                  }}
                >
                  💼 Mentor
                </span>
              </div>
            </div>

            {/* Bio */}
            {mentor.bio ? (
              <p className="mb-4" style={{ lineHeight: 1.7, color: '#374151' }}>{mentor.bio}</p>
            ) : (
              <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>No bio provided.</p>
            )}

            {/* Expertise Tags */}
            <div>
              <h6 className="fw-semibold mb-2" style={{ fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Expertise
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {(mentor.expertiseTags || []).length > 0
                  ? mentor.expertiseTags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: '#2F6FED12', color: '#2F6FED',
                          border: '1px solid #2F6FED30', borderRadius: '50rem',
                          padding: '0.2rem 0.75rem', fontSize: '0.82rem', fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))
                  : <span className="text-muted" style={{ fontSize: '0.85rem' }}>No expertise tags listed.</span>
                }
              </div>
            </div>
          </div>
        </div>

        {/* ── Available Slots ───────────────────────────────────────────── */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '0.75rem' }}>
          <div className="card-body p-4">
            <h2 className="h5 fw-semibold mb-3" style={{ color: '#12315C' }}>📅 Available Slots</h2>

            {/* Slots loading */}
            {slotsStatus === 'loading' && (
              <div className="text-center py-3">
                <span className="spinner-border spinner-border-sm me-2" style={{ color: '#12315C' }} />
                <span className="text-muted">Loading available slots…</span>
              </div>
            )}

            {slotsStatus === 'failed' && (
              <div className="alert alert-warning py-2" style={{ fontSize: '0.9rem' }}>{slotsError}</div>
            )}

            {slotsStatus === 'succeeded' && slots.length === 0 && (
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                No open slots available right now. Check back later!
              </p>
            )}

            {/* Info banner for mentors / unauthenticated */}
            {slotsStatus === 'succeeded' && slots.length > 0 && !isCandidate && (
              <div
                className="alert py-2 mb-3"
                style={{ background: '#F7F9FC', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.88rem', color: '#64748B' }}
              >
                {!user
                  ? <>
                      <Link to="/login" style={{ color: '#2F6FED', fontWeight: 600 }}>Sign in as a candidate</Link>
                      {' '}to book a session with this mentor.
                    </>
                  : isMentor
                    ? 'You are viewing this as a mentor. Only candidates can book sessions.'
                    : null
                }
              </div>
            )}

            {/* Slot list */}
            {slotsStatus === 'succeeded' && slots.length > 0 && (
              <div className="d-flex flex-column gap-2">
                {slots.map((slot) => (
                  <div
                    key={slot._id}
                    className="d-flex align-items-center justify-content-between rounded px-3 py-2"
                    style={{ background: '#F7F9FC', border: '1px solid rgba(18,49,92,0.09)' }}
                  >
                    <div>
                      <div className="fw-medium" style={{ fontSize: '0.9rem', color: '#1E293B' }}>
                        {formatDate(slot.startTime)}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </div>
                    </div>

                    {/* Book button — shown based on auth/role */}
                    <div>
                      {isCandidate && (
                        // Phase 8 will replace this with dispatch(createBooking(slot._id))
                        <button
                          className="btn btn-sm fw-medium text-white"
                          style={{ background: '#22C55E', borderRadius: '0.45rem', minWidth: 80 }}
                          onClick={() => handleBook(slot._id)}
                        >
                          Book
                        </button>
                      )}
                      {!user && (
                        <Link
                          to="/login"
                          className="btn btn-sm fw-medium"
                          style={{ background: '#2F6FED12', color: '#2F6FED', border: '1px solid #2F6FED30', borderRadius: '0.45rem' }}
                        >
                          Login to Book
                        </Link>
                      )}
                      {isMentor && (
                        <span className="badge" style={{ background: '#12315C18', color: '#12315C', borderRadius: '50rem', fontSize: '0.75rem' }}>
                          Open
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default MentorDetail;
