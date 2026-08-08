import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mentorsReducer from '../features/mentors/mentorsSlice';
import bookingsReducer from '../features/bookings/bookingsSlice';
import profileReducer from '../features/profile/profileSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    mentors: mentorsReducer,
    bookings: bookingsReducer,
    profile: profileReducer,
  },
});

export default store;
