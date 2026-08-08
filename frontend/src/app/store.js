import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mentorsReducer from '../features/mentors/mentorsSlice';
import bookingsReducer from '../features/bookings/bookingsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    mentors: mentorsReducer,
    bookings: bookingsReducer,
  },
});

export default store;
