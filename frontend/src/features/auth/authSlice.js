import { createSlice } from '@reduxjs/toolkit';

// Rehydrate token + user from localStorage on app load so the session
// survives a page refresh without needing to log in again.
const token = localStorage.getItem('token');
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,       // { id, name, email, role }
    token,
    status: 'idle',   // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // Called after a successful login/register from Phase 5 thunks
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.status = 'succeeded';
      state.error = null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  // Async thunks for register/login will be added in Phase 5
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
