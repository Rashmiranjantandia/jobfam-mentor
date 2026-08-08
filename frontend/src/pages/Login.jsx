import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../features/auth/authSlice';
import Layout from '../components/Layout';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [validationError, setValidationError] = useState('');

  // If already logged in, redirect away from login page
  useEffect(() => {
    if (user) {
      navigate(user.role === 'mentor' ? '/dashboard' : '/mentors', { replace: true });
    }
  }, [user, navigate]);

  // Clear backend error when the user starts typing again
  useEffect(() => {
    if (error) dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.email, form.password]);

  const validate = () => {
    if (!form.email || !form.password) {
      setValidationError('Email and password are required.');
      return false;
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(loginUser({ email: form.email, password: form.password }));

    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      navigate(role === 'mentor' ? '/dashboard' : '/mentors', { replace: true });
    }
    // If rejected, the error is in Redux state and displayed below
  };

  const isLoading = status === 'loading';

  return (
    <Layout>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5">
            {/* Card */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '0.75rem' }}>
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <span style={{ fontSize: '2.5rem' }}>🔑</span>
                  <h1 className="h3 fw-bold mt-2 mb-1" style={{ color: '#12315C' }}>
                    Welcome back
                  </h1>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    Sign in to your Jobfam account
                  </p>
                </div>

                {/* Backend / validation error */}
                {(error || validationError) && (
                  <div className="alert alert-danger py-2" role="alert" style={{ fontSize: '0.9rem' }}>
                    {validationError || error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="login-email" className="form-label fw-medium">
                      Email address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label htmlFor="login-password" className="form-label fw-medium">
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      className="form-control"
                      placeholder="Your password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn w-100 fw-semibold text-white"
                    style={{ background: '#12315C', borderRadius: '0.5rem', padding: '0.65rem' }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Signing in…
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <p className="text-center mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: '#2F6FED', fontWeight: 500 }}>
                    Sign up free
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
