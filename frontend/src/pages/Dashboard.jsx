import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings, approveBooking, declineBooking } from '../features/bookings/bookingsSlice';
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
// BookingCard — used for pending requests
// ─────────────────────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onApprove, onDecline, actionStatus, actionError }) => {
  const slot = booking.slotId;
  const candidate = booking.candidateId;
  const isActing = actionStatus === 'loading';

  return (
    <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '0.75rem' }}>
      <div style={{ height: 4, background: '#F59E0B', borderRadius: '0.75rem 0.75rem 0 0' }} />
      <div className="card-body p-4">
        <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
          <div>
            <h6 className="fw-semibold mb-0" style={{ color: '#12315C' }}>
              {candidate?.name || 'Candidate'}
            </h6>
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>{candidate?.email}</span>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {slot && (
          <p className="mb-3" style={{ fontSize: '0.88rem', color: '#374151' }}>
            📅 {formatDateTime(slot.startTime)} → {formatDateTime(slot.endTime)}
          </p>
        )}

        {actionError && (
          <div className="alert alert-danger py-1 mb-2" style={{ fontSize: '0.85rem' }}>{actionError}</div>
        )}

        <div className="d-flex gap-2">
          <button
            className="btn btn-sm fw-medium text-white"
            style={{ background: '#22C55E', borderRadius: '0.45rem', minWidth: 90 }}
            onClick={() => onApprove(booking._id)}
            disabled={isActing}
          >
            {isActing ? <span className="spinner-border spinner-border-sm" /> : '✓ Approve'}
          </button>
          <button
            className="btn btn-sm fw-medium text-white"
            style={{ background: '#EF4444', borderRadius: '0.45rem', minWidth: 90 }}
            onClick={() => onDecline(booking._id)}
            disabled={isActing}
          >
            {isActing ? <span className="spinner-border spinner-border-sm" /> : '✕ Decline'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Page — mentor only
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const dispatch = useDispatch();
  const { list, status, error, actionStatus, actionError } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleApprove = (id) => dispatch(approveBooking(id));
  const handleDecline = (id) => dispatch(declineBooking(id));

  const pendingBookings  = list.filter((b) => b.status === 'pending');
  const approvedBookings = list.filter((b) => b.status === 'approved');
  const declinedBookings = list.filter((b) => b.status === 'declined');

  const isLoading = status === 'loading';

  return (
    <Layout>
      {/* ── Header banner ─────────────────────────────────────────────── */}
      <section
        style={{ background: 'linear-gradient(135deg,#12315C 0%,#2F6FED 100%)', padding: '2.5rem 0 2rem', color: '#fff' }}
      >
        <div className="container">
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.8rem' }}>Mentor Dashboard</h1>
          <p className="opacity-75 mb-0" style={{ fontSize: '0.9rem' }}>Review and manage your booking requests</p>
        </div>
      </section>

      <div className="container py-4" style={{ maxWidth: 820 }}>

        {/* ── Loading / Error ─────────────────────────────────────────── */}
        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#12315C' }} role="status" />
            <p className="mt-2 text-muted">Loading bookings…</p>
          </div>
        )}
        {status === 'failed' && (
          <div className="alert alert-danger">{error}</div>
        )}

        {status === 'succeeded' && (
          <>
            {/* ── Pending Requests ──────────────────────────────────────── */}
            <section className="mb-5">
              <h2 className="h5 fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#12315C' }}>
                <span>⏳ Pending Requests</span>
                {pendingBookings.length > 0 && (
                  <span
                    className="badge rounded-pill"
                    style={{ background: '#F59E0B', color: '#fff', fontSize: '0.75rem' }}
                  >
                    {pendingBookings.length}
                  </span>
                )}
              </h2>

              {pendingBookings.length === 0 ? (
                <div
                  className="rounded p-4 text-center"
                  style={{ background: '#F7F9FC', border: '1px solid rgba(18,49,92,0.08)' }}
                >
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    No pending booking requests right now.
                  </p>
                </div>
              ) : (
                pendingBookings.map((b) => (
                  <BookingCard
                    key={b._id}
                    booking={b}
                    onApprove={handleApprove}
                    onDecline={handleDecline}
                    actionStatus={actionStatus[b._id]}
                    actionError={actionError[b._id]}
                  />
                ))
              )}
            </section>

            {/* ── Upcoming Approved Sessions ─────────────────────────── */}
            <section className="mb-5">
              <h2 className="h5 fw-semibold mb-3" style={{ color: '#12315C' }}>
                ✅ Upcoming Approved Sessions
              </h2>

              {approvedBookings.length === 0 ? (
                <div
                  className="rounded p-4 text-center"
                  style={{ background: '#F7F9FC', border: '1px solid rgba(18,49,92,0.08)' }}
                >
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>No approved sessions yet.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {approvedBookings.map((b) => {
                    const slot = b.slotId;
                    const candidate = b.candidateId;
                    return (
                      <div
                        key={b._id}
                        className="card border-0 shadow-sm"
                        style={{ borderRadius: '0.75rem' }}
                      >
                        <div style={{ height: 4, background: '#22C55E', borderRadius: '0.75rem 0.75rem 0 0' }} />
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-semibold mb-0" style={{ color: '#12315C' }}>
                                {candidate?.name || 'Candidate'}
                              </h6>
                              <span className="text-muted" style={{ fontSize: '0.82rem' }}>{candidate?.email}</span>
                            </div>
                            <StatusBadge status="approved" />
                          </div>
                          {slot && (
                            <p className="mb-2" style={{ fontSize: '0.88rem', color: '#374151' }}>
                              📅 {formatDateTime(slot.startTime)} → {formatDateTime(slot.endTime)}
                            </p>
                          )}
                          {b.meetingLink && (
                            <div
                              className="mt-2 p-2 rounded"
                              style={{ background: '#22C55E10', border: '1px solid #22C55E40' }}
                            >
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#15803D' }}>🔗 Meeting: </span>
                              <a
                                href={b.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#2F6FED', fontSize: '0.83rem', wordBreak: 'break-all' }}
                              >
                                {b.meetingLink}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Declined (history) ────────────────────────────────────── */}
            {declinedBookings.length > 0 && (
              <section>
                <h2 className="h5 fw-semibold mb-3" style={{ color: '#94a3b8' }}>
                  ❌ Declined Requests
                </h2>
                <div className="d-flex flex-column gap-2">
                  {declinedBookings.map((b) => {
                    const slot = b.slotId;
                    const candidate = b.candidateId;
                    return (
                      <div
                        key={b._id}
                        className="d-flex align-items-center justify-content-between rounded px-3 py-2"
                        style={{ background: '#F7F9FC', border: '1px solid rgba(239,68,68,0.15)' }}
                      >
                        <div>
                          <span className="fw-medium" style={{ fontSize: '0.88rem', color: '#374151' }}>
                            {candidate?.name}
                          </span>
                          {slot && (
                            <span className="text-muted ms-2" style={{ fontSize: '0.82rem' }}>
                              — {formatDateTime(slot.startTime)}
                            </span>
                          )}
                        </div>
                        <StatusBadge status="declined" />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
