import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchProfile,
  updateProfile,
  createSlot,
  deleteSlot,
  clearProfileError,
} from '../features/profile/profileSlice';
import api from '../api/axios';
import Layout from '../components/Layout';

// ─────────────────────────────────────────────────────────────────────────────
// TagChips — shared chip component used for both skills and expertiseTags
// ─────────────────────────────────────────────────────────────────────────────
const TagChips = ({ tags, onRemove, color = '#2F6FED' }) => {
  if (!tags || tags.length === 0) {
    return <span className="text-muted" style={{ fontSize: '0.85rem' }}>None added yet.</span>;
  }
  return (
    <div className="d-flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="badge d-inline-flex align-items-center gap-1 px-3 py-2"
          style={{
            background: `${color}18`,
            color,
            border: `1px solid ${color}40`,
            borderRadius: '50rem',
            fontSize: '0.82rem',
            fontWeight: 500,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            aria-label={`Remove ${tag}`}
            style={{
              background: 'none',
              border: 'none',
              color,
              cursor: 'pointer',
              padding: '0 2px',
              lineHeight: 1,
              fontSize: '1rem',
            }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SlotStatusBadge
// ─────────────────────────────────────────────────────────────────────────────
const SlotStatusBadge = ({ status }) => {
  const map = {
    open:    { bg: '#22C55E18', color: '#15803D', label: 'Open' },
    pending: { bg: '#F59E0B18', color: '#B45309', label: 'Pending' },
    booked:  { bg: '#2F6FED18', color: '#1D4ED8', label: 'Booked' },
  };
  const s = map[status] || { bg: '#6b728018', color: '#374151', label: status };
  return (
    <span
      className="badge"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40`, borderRadius: '50rem', fontSize: '0.78rem', fontWeight: 600, padding: '0.3em 0.7em' }}
    >
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

// Convert local date + time strings to ISO UTC string for the backend
const toISO = (date, time) => new Date(`${date}T${time}`).toISOString();

// ─────────────────────────────────────────────────────────────────────────────
// Main Profile Component
// ─────────────────────────────────────────────────────────────────────────────
const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: profile, status, error } = useSelector((state) => state.profile);

  // Local form state — bio editing
  const [bio, setBio] = useState('');
  const [bioSaved, setBioSaved] = useState(false);

  // Tag management
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState('');

  // Slot form state
  const [slotDate, setSlotDate] = useState('');
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');
  const [slotFormError, setSlotFormError] = useState('');
  const [slotSaving, setSlotSaving] = useState(false);

  // All slots (open + pending + booked) — fetched separately for mentors
  const [allSlots, setAllSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // ── Guard: must be logged in ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  // ── Fetch profile on mount ───────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // ── Sync bio local state when profile loads ──────────────────────────────
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
    }
  }, [profile]);

  // ── Fetch ALL mentor slots (open + pending + booked) ─────────────────────
  // The public GET /api/mentors/:id/slots only returns open slots.
  // We get all statuses by fetching the mentor's bookings (which include slot
  // refs) and supplementing with any open slots. Simplest approach: fetch
  // /api/mentors/:id/slots for open, then GET /api/bookings/mine to find
  // pending/booked ones, then merge.
  const loadMentorSlots = async () => {
    if (!user || user.role !== 'mentor') return;
    setSlotsLoading(true);
    try {
      // Open slots from public endpoint
      const { data: openSlots } = await api.get(`/mentors/${user.id}/slots`);
      // Bookings this mentor owns — contains pending/booked slot info
      const { data: bookings } = await api.get('/bookings/mine');
      // Build a map: slotId -> slot object from bookings
      const bookedSlotMap = {};
      bookings.forEach((b) => {
        if (b.slotId) {
          bookedSlotMap[b.slotId._id || b.slotId] = {
            _id: b.slotId._id || b.slotId,
            startTime: b.slotId.startTime,
            endTime: b.slotId.endTime,
            status: b.slotId.status,
            mentorId: user.id,
          };
        }
      });
      // Merge: start with open slots, add pending/booked that are not in openSlots
      const openIds = new Set(openSlots.map((s) => s._id));
      const nonOpen = Object.values(bookedSlotMap).filter((s) => !openIds.has(s._id));
      setAllSlots([...openSlots, ...nonOpen].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
    } catch {
      // If bookings endpoint fails (edge case), fall back to open slots only
      try {
        const { data: openSlots } = await api.get(`/mentors/${user.id}/slots`);
        setAllSlots(openSlots);
      } catch { /* silent */ }
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'mentor') loadMentorSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSaveBio = async () => {
    setBioSaved(false);
    await dispatch(updateProfile({ bio }));
    setBioSaved(true);
    setTimeout(() => setBioSaved(false), 2500);
  };

  const handleAddTag = async () => {
    const trimmed = newTag.trim();
    if (!trimmed) { setTagError('Tag cannot be empty.'); return; }

    const existing = user.role === 'candidate'
      ? (profile?.skills || [])
      : (profile?.expertiseTags || []);

    if (existing.map((t) => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      setTagError('Tag already exists.');
      return;
    }
    setTagError('');
    setNewTag('');

    if (user.role === 'candidate') {
      await dispatch(updateProfile({ addSkills: [trimmed] }));
    } else {
      await dispatch(updateProfile({ addTags: [trimmed] }));
    }
  };

  const handleRemoveTag = async (tag) => {
    if (user.role === 'candidate') {
      await dispatch(updateProfile({ removeSkills: [tag] }));
    } else {
      await dispatch(updateProfile({ removeTags: [tag] }));
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setSlotFormError('');

    if (!slotDate || !slotStart || !slotEnd) {
      setSlotFormError('Date, start time, and end time are all required.');
      return;
    }

    const startISO = toISO(slotDate, slotStart);
    const endISO   = toISO(slotDate, slotEnd);

    if (new Date(startISO) >= new Date(endISO)) {
      setSlotFormError('End time must be after start time.');
      return;
    }

    setSlotSaving(true);
    const result = await dispatch(createSlot({ startTime: startISO, endTime: endISO }));
    setSlotSaving(false);

    if (createSlot.fulfilled.match(result)) {
      setSlotDate('');
      setSlotStart('');
      setSlotEnd('');
      // Reload slots to get fresh data
      await loadMentorSlots();
    } else {
      setSlotFormError(result.payload || 'Failed to create slot.');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    const result = await dispatch(deleteSlot(slotId));
    if (deleteSlot.fulfilled.match(result)) {
      setAllSlots((prev) => prev.filter((s) => s._id !== slotId));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!user) return null;

  const isLoading = status === 'loading';
  const tags = user.role === 'candidate'
    ? (profile?.skills || [])
    : (profile?.expertiseTags || []);

  return (
    <Layout>
      <div className="container py-4" style={{ maxWidth: 760 }}>
        <h1 className="h3 fw-bold mb-4" style={{ color: '#12315C' }}>
          My Profile
        </h1>

        {/* ── Loading / Error ─────────────────────────────────────────────── */}
        {status === 'loading' && !profile && (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#12315C' }} role="status" />
            <p className="mt-2 text-muted">Loading profile…</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="alert alert-danger">{error}</div>
        )}

        {profile && (
          <>
            {/* ── Basic Info Card ─────────────────────────────────────────── */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '0.75rem' }}>
              <div className="card-body p-4">
                <h5 className="fw-semibold mb-3" style={{ color: '#12315C' }}>Basic Info</h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium text-muted" style={{ fontSize: '0.85rem' }}>NAME</label>
                    <p className="mb-0 fw-semibold">{profile.name}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium text-muted" style={{ fontSize: '0.85rem' }}>EMAIL</label>
                    <p className="mb-0">{profile.email}</p>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium text-muted" style={{ fontSize: '0.85rem' }}>ROLE</label>
                    <p className="mb-0">
                      <span
                        className="badge"
                        style={{
                          background: user.role === 'mentor' ? '#12315C18' : '#2F6FED18',
                          color: user.role === 'mentor' ? '#12315C' : '#2F6FED',
                          border: `1px solid ${user.role === 'mentor' ? '#12315C40' : '#2F6FED40'}`,
                          borderRadius: '50rem',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          padding: '0.3em 0.8em',
                        }}
                      >
                        {user.role === 'mentor' ? '💼 Mentor' : '🎓 Candidate'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <hr className="my-3" />
                <label className="form-label fw-medium" htmlFor="profile-bio">Bio</label>
                <textarea
                  id="profile-bio"
                  className="form-control mb-2"
                  rows={3}
                  placeholder="Tell mentors about yourself…"
                  value={bio}
                  onChange={(e) => { setBio(e.target.value); setBioSaved(false); }}
                  disabled={isLoading}
                />
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm fw-medium text-white"
                    style={{ background: '#12315C', borderRadius: '0.5rem' }}
                    onClick={handleSaveBio}
                    disabled={isLoading}
                  >
                    {isLoading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                    Save Bio
                  </button>
                  {bioSaved && (
                    <span className="text-success" style={{ fontSize: '0.85rem' }}>✓ Bio saved!</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Skills / ExpertiseTags Card ─────────────────────────────── */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '0.75rem' }}>
              <div className="card-body p-4">
                <h5 className="fw-semibold mb-3" style={{ color: '#12315C' }}>
                  {user.role === 'candidate' ? '🎓 Skills' : '💡 Expertise Tags'}
                </h5>

                <TagChips tags={tags} onRemove={handleRemoveTag} />

                {/* Add tag input */}
                <div className="d-flex gap-2 mt-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={user.role === 'candidate' ? 'Add a skill (e.g. Python)' : 'Add a tag (e.g. React)'}
                    value={newTag}
                    onChange={(e) => { setNewTag(e.target.value); setTagError(''); }}
                    onKeyDown={handleTagKeyDown}
                    disabled={isLoading}
                    style={{ maxWidth: 240 }}
                  />
                  <button
                    className="btn btn-sm fw-medium text-white"
                    style={{ background: '#2F6FED', borderRadius: '0.5rem' }}
                    onClick={handleAddTag}
                    disabled={isLoading || !newTag.trim()}
                  >
                    + Add
                  </button>
                </div>
                {tagError && <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{tagError}</div>}
                {error && status === 'failed' && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{error}</div>
                )}
              </div>
            </div>

            {/* ── Mentor Slot Management ───────────────────────────────────── */}
            {user.role === 'mentor' && (
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '0.75rem' }}>
                <div className="card-body p-4">
                  <h5 className="fw-semibold mb-4" style={{ color: '#12315C' }}>📅 My Availability Slots</h5>

                  {/* Add slot form */}
                  <div className="p-3 mb-4 rounded" style={{ background: '#F7F9FC', border: '1px solid rgba(18,49,92,0.08)' }}>
                    <p className="fw-medium mb-3" style={{ fontSize: '0.9rem', color: '#12315C' }}>Add a New Slot</p>
                    <form onSubmit={handleCreateSlot}>
                      <div className="row g-2 align-items-end">
                        <div className="col-sm-4">
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Date</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={slotDate}
                            onChange={(e) => setSlotDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="col-sm-3">
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Start Time</label>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={slotStart}
                            onChange={(e) => setSlotStart(e.target.value)}
                          />
                        </div>
                        <div className="col-sm-3">
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 500 }}>End Time</label>
                          <input
                            type="time"
                            className="form-control form-control-sm"
                            value={slotEnd}
                            onChange={(e) => setSlotEnd(e.target.value)}
                          />
                        </div>
                        <div className="col-sm-2">
                          <button
                            type="submit"
                            className="btn btn-sm w-100 text-white fw-medium"
                            style={{ background: '#12315C', borderRadius: '0.5rem' }}
                            disabled={slotSaving}
                          >
                            {slotSaving
                              ? <span className="spinner-border spinner-border-sm" />
                              : '+ Add'}
                          </button>
                        </div>
                      </div>
                      {slotFormError && (
                        <div className="text-danger mt-2" style={{ fontSize: '0.85rem' }}>{slotFormError}</div>
                      )}
                    </form>
                  </div>

                  {/* Slot list */}
                  {slotsLoading && (
                    <div className="text-center py-3">
                      <span className="spinner-border spinner-border-sm me-2" style={{ color: '#12315C' }} />
                      <span className="text-muted" style={{ fontSize: '0.9rem' }}>Loading slots…</span>
                    </div>
                  )}

                  {!slotsLoading && allSlots.length === 0 && (
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                      No slots yet. Add your first availability slot above.
                    </p>
                  )}

                  {!slotsLoading && allSlots.length > 0 && (
                    <div className="d-flex flex-column gap-2">
                      {allSlots.map((slot) => (
                        <div
                          key={slot._id}
                          className="d-flex align-items-center justify-content-between rounded px-3 py-2"
                          style={{ background: '#fff', border: '1px solid rgba(18,49,92,0.1)' }}
                        >
                          <div>
                            <div className="fw-medium" style={{ fontSize: '0.9rem' }}>
                              {formatDateTime(slot.startTime)}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                              → {formatDateTime(slot.endTime)}
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <SlotStatusBadge status={slot.status} />
                            {slot.status === 'open' && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                style={{ fontSize: '0.78rem', borderRadius: '0.4rem', padding: '0.2rem 0.5rem' }}
                                onClick={() => handleDeleteSlot(slot._id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
