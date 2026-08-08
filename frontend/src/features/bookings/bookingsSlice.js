import { createSlice } from '@reduxjs/toolkit';

// Placeholder slice — async thunks (createBooking, getMyBookings, approve, decline) added in Phase 8
const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
});

export default bookingsSlice.reducer;
