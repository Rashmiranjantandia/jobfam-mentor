import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ── Async thunks ──────────────────────────────────────────────────────────────

/**
 * fetchMentors — GET /api/mentors?skill=<skill>
 * skill is optional; omitting it returns all mentors.
 */
export const fetchMentors = createAsyncThunk(
  'mentors/fetchAll',
  async (skill = '', { rejectWithValue }) => {
    try {
      const params = skill ? { skill } : {};
      const { data } = await api.get('/mentors', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load mentors');
    }
  }
);

/**
 * fetchMentorById — GET /api/mentors/:id
 */
export const fetchMentorById = createAsyncThunk(
  'mentors/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/mentors/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Mentor not found');
    }
  }
);

/**
 * fetchMentorSlots — GET /api/mentors/:id/slots
 * Returns only open slots (public endpoint).
 */
export const fetchMentorSlots = createAsyncThunk(
  'mentors/fetchSlots',
  async (mentorId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/mentors/${mentorId}/slots`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load slots');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const mentorsSlice = createSlice({
  name: 'mentors',
  initialState: {
    list: [],          // mentor list from GET /api/mentors
    selected: null,    // single mentor from GET /api/mentors/:id
    slots: [],         // open slots for the selected mentor
    status: 'idle',    // 'idle' | 'loading' | 'succeeded' | 'failed'
    selectedStatus: 'idle',
    slotsStatus: 'idle',
    error: null,
    selectedError: null,
    slotsError: null,
  },
  reducers: {
    clearSelected: (state) => {
      state.selected = null;
      state.slots = [];
      state.selectedStatus = 'idle';
      state.slotsStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    // ── fetchMentors ───────────────────────────────────────────────────────────
    builder
      .addCase(fetchMentors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── fetchMentorById ────────────────────────────────────────────────────────
    builder
      .addCase(fetchMentorById.pending, (state) => {
        state.selectedStatus = 'loading';
        state.selectedError = null;
      })
      .addCase(fetchMentorById.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchMentorById.rejected, (state, action) => {
        state.selectedStatus = 'failed';
        state.selectedError = action.payload;
      });

    // ── fetchMentorSlots ───────────────────────────────────────────────────────
    builder
      .addCase(fetchMentorSlots.pending, (state) => {
        state.slotsStatus = 'loading';
        state.slotsError = null;
      })
      .addCase(fetchMentorSlots.fulfilled, (state, action) => {
        state.slotsStatus = 'succeeded';
        state.slots = action.payload;
      })
      .addCase(fetchMentorSlots.rejected, (state, action) => {
        state.slotsStatus = 'failed';
        state.slotsError = action.payload;
      });
  },
});

export const { clearSelected } = mentorsSlice.actions;
export default mentorsSlice.reducer;
