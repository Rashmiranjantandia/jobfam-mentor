import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Mentors from './pages/Mentors';
import MentorDetail from './pages/MentorDetail';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentors/:id" element={<MentorDetail />} />

          {/* Protected — any logged-in user */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected — candidates only */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute role="candidate">
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Protected — mentors only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="mentor">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all — redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
