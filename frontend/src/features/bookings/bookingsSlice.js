import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ── Async thunks ──────────────────────────────────────────────────────────────

/**
 * createBooking — POST /api/bookings
 * Body: { slotId }
 * Candidate-only. Backend locks the slot to "pending" immediately.
 */
export const createBooking = createAsyncThunk(
  'bookings/create',
  async (slotId, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/bookings', { slotId });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create booking');
    }
  }
);

/**
 * fetchMyBookings — GET /api/bookings/mine
 * Role-aware: candidates get their bookings, mentors get requests on their slots.
 * Backend populates slotId (startTime/endTime/status), mentorId, candidateId.
 */
export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/bookings/mine');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load bookings');
    }
  }
);

/**
 * approveBooking — PATCH /api/bookings/:id/approve
 * Mentor-only. Backend sets booking→approved, slot→booked, generates meetingLink.
 */
export const approveBooking = createAsyncThunk(
  'bookings/approve',
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/approve`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve booking');
    }
  }
);

/**
 * declineBooking — PATCH /api/bookings/:id/decline
 * Mentor-only. Backend sets booking→declined, slot→open (released back).
 */
export const declineBooking = createAsyncThunk(
  'bookings/decline',
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/decline`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to decline booking');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    list: [],
    status: 'idle',    // list fetch status
    error: null,
    actionStatus: {},  // per-bookingId action status: { [id]: 'loading'|'idle' }
    actionError: {},   // per-bookingId error
  },
  reducers: {
    clearBookingErrors: (state) => {
      state.error = null;
      state.actionError = {};
    },
  },
  extraReducers: (builder) => {
    // ── fetchMyBookings ────────────────────────────────────────────────────────
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── createBooking ─────────────────────────────────────────────────────────
    // Prepend the new booking to the list so it shows immediately
    builder
      .addCase(createBooking.pending, (state) => {
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── approveBooking ────────────────────────────────────────────────────────
    // Replace the booking in the list with the updated version from server
    builder
      .addCase(approveBooking.pending, (state, action) => {
        state.actionStatus[action.meta.arg] = 'loading';
        delete state.actionError[action.meta.arg];
      })
      .addCase(approveBooking.fulfilled, (state, action) => {
        const updated = action.payload;
        state.actionStatus[updated._id] = 'idle';
        state.list = state.list.map((b) => (b._id === updated._id ? updated : b));
      })
      .addCase(approveBooking.rejected, (state, action) => {
        state.actionStatus[action.meta.arg] = 'idle';
        state.actionError[action.meta.arg] = action.payload;
      });

    // ── declineBooking ────────────────────────────────────────────────────────
    builder
      .addCase(declineBooking.pending, (state, action) => {
        state.actionStatus[action.meta.arg] = 'loading';
        delete state.actionError[action.meta.arg];
      })
      .addCase(declineBooking.fulfilled, (state, action) => {
        const updated = action.payload;
        state.actionStatus[updated._id] = 'idle';
        state.list = state.list.map((b) => (b._id === updated._id ? updated : b));
      })
      .addCase(declineBooking.rejected, (state, action) => {
        state.actionStatus[action.meta.arg] = 'idle';
        state.actionError[action.meta.arg] = action.payload;
      });
  },
});

export const { clearBookingErrors } = bookingsSlice.actions;
export default bookingsSlice.reducer;
