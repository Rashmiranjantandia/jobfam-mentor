import { createSlice } from '@reduxjs/toolkit';

// Placeholder slice — async thunks (fetchMentors, fetchMentorById) added in Phase 7
const mentorsSlice = createSlice({
  name: 'mentors',
  initialState: {
    list: [],
    selected: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
});

export default mentorsSlice.reducer;
