import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings } from '../features/bookings/bookingsSlice';
import Layout from '../components/Layout';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { bg: '#F59E0B18', color: '#B45309', label: '⏳ Pending' },
    approved: { bg: '#22C55E18', color: '#15803D', label: '✅ Approved' },
    declined: { bg: '#EF444418', color: '#B91C1C', label: '❌ Declined' },
  };
  const s = map[status] || { bg: '#6b728018', color: '#374151', label: status };
  return (
    <span
      className="badge"
      style={{
        background: s.bg, color: s.color,
        border: `1px solid ${s.color}40`,
        borderRadius: '50rem', fontWeight: 600,
        fontSize: '0.8rem', padding: '0.35em 0.75em',
      }}
    >
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MyBookings Page — candidate view
// ─────────────────────────────────────────────────────────────────────────────
const MyBookings = () => {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const isLoading = status === 'loading';

  return (
    <Layout>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section
        style={{ background: 'linear-gradient(135deg,#12315C 0%,#2F6FED 100%)', padding: '2.5rem 0 2rem', color: '#fff' }}
      >
        <div className="container">
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.8rem' }}>My Bookings</h1>
          <p className="opacity-75 mb-0" style={{ fontSize: '0.9rem' }}>Track your mentorship session requests</p>
        </div>
      </section>

      <div className="container py-4" style={{ maxWidth: 760 }}>

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#12315C' }} role="status" />
            <p className="mt-2 text-muted">Loading your bookings…</p>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {status === 'failed' && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* ── Empty ───────────────────────────────────────────────────────── */}
        {status === 'succeeded' && list.length === 0 && (
          <div className="text-center py-5">
            <span style={{ fontSize: '2.8rem' }}>📭</span>
            <p className="text-muted mt-2 mb-3">You haven't booked any sessions yet.</p>
            <Link to="/mentors" className="btn fw-medium text-white" style={{ background: '#12315C', borderRadius: '0.5rem' }}>
              Browse Mentors
            </Link>
          </div>
        )}

        {/* ── Booking list ─────────────────────────────────────────────────── */}
        {status === 'succeeded' && list.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {list.map((booking) => {
              const slot = booking.slotId;
              const mentor = booking.mentorId;
              return (
                <div
                  key={booking._id}
                  className="card border-0 shadow-sm"
                  style={{ borderRadius: '0.75rem' }}
                >
                  {/* Left colour stripe by status */}
                  <div style={{
                    height: 4,
                    background: booking.status === 'approved' ? '#22C55E'
                      : booking.status === 'declined' ? '#EF4444'
                      : '#F59E0B',
                    borderRadius: '0.75rem 0.75rem 0 0',
                  }} />
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                      <div>
                        <h5 className="fw-semibold mb-0" style={{ color: '#12315C', fontSize: '1rem' }}>
                          {mentor?.name || 'Mentor'}
                        </h5>
                        <span className="text-muted" style={{ fontSize: '0.82rem' }}>{mentor?.email}</span>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    {slot && (
                      <div className="mb-2" style={{ fontSize: '0.88rem', color: '#374151' }}>
                        <span>📅 {formatDateTime(slot.startTime)}</span>
                        <span className="mx-1 text-muted">→</span>
                        <span>{formatDateTime(slot.endTime)}</span>
                      </div>
                    )}

                    {/* Meeting link — only shown on approved bookings */}
                    {booking.status === 'approved' && booking.meetingLink && (
                      <div
                        className="mt-3 p-3 rounded"
                        style={{ background: '#22C55E10', border: '1px solid #22C55E40', borderRadius: '0.5rem' }}
                      >
                        <p className="mb-1 fw-semibold" style={{ fontSize: '0.85rem', color: '#15803D' }}>
                          🎉 Session Confirmed — Your Meeting Link
                        </p>
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="fw-medium"
                          style={{ color: '#2F6FED', fontSize: '0.88rem', wordBreak: 'break-all' }}
                        >
                          {booking.meetingLink}
                        </a>
                      </div>
                    )}

                    {booking.status === 'declined' && (
                      <p className="mb-0 mt-2" style={{ fontSize: '0.85rem', color: '#B91C1C' }}>
                        This request was declined. You can book another slot with this mentor.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyBookings;
