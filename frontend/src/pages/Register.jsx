import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../features/auth/authSlice';
import Layout from '../components/Layout';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [validationError, setValidationError] = useState('');

  // Already logged in — redirect away
  useEffect(() => {
    if (user) {
      navigate(user.role === 'mentor' ? '/dashboard' : '/mentors', { replace: true });
    }
  }, [user, navigate]);

  // Clear backend error on any input change
  useEffect(() => {
    if (error) dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, form.email, form.password, form.role]);

  const validate = () => {
    if (!form.name.trim()) {
      setValidationError('Name is required.');
      return false;
    }
    if (!form.email) {
      setValidationError('Email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    if (!form.password) {
      setValidationError('Password is required.');
      return false;
    }
    if (form.password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(registerUser({
      name: form.name.trim(),
      email: form.email,
      password: form.password,
      role: form.role,
    }));

    if (registerUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      navigate(role === 'mentor' ? '/dashboard' : '/mentors', { replace: true });
    }
  };

  const isLoading = status === 'loading';

  return (
    <Layout>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '0.75rem' }}>
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <span style={{ fontSize: '2.5rem' }}>🚀</span>
                  <h1 className="h3 fw-bold mt-2 mb-1" style={{ color: '#12315C' }}>
                    Create your account
                  </h1>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    Join Jobfam's mentor community
                  </p>
                </div>

                {/* Backend / validation error */}
                {(error || validationError) && (
                  <div className="alert alert-danger py-2" role="alert" style={{ fontSize: '0.9rem' }}>
                    {validationError || error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Role selector — first so users know what they're signing up as */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">I am joining as a…</label>
                    <div className="d-flex gap-2">
                      {['candidate', 'mentor'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`btn flex-fill fw-medium ${form.role === r ? 'text-white' : 'btn-outline-secondary'}`}
                          style={
                            form.role === r
                              ? { background: '#12315C', border: '1px solid #12315C', borderRadius: '0.5rem' }
                              : { borderRadius: '0.5rem' }
                          }
                          onClick={() => setForm({ ...form, role: r })}
                          disabled={isLoading}
                        >
                          {r === 'candidate' ? '🎓 Candidate' : '💼 Mentor'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="mb-3">
                    <label htmlFor="reg-name" className="form-label fw-medium">
                      Full name
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      className="form-control"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={isLoading}
                      autoComplete="name"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="reg-email" className="form-label fw-medium">
                      Email address
                    </label>
                    <input
                      id="reg-email"
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
                    <label htmlFor="reg-password" className="form-label fw-medium">
                      Password
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      className="form-control"
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    {form.password && form.password.length < 6 && (
                      <div className="form-text text-danger">
                        Password must be at least 6 characters.
                      </div>
                    )}
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
                        Creating account…
                      </>
                    ) : (
                      `Sign Up as ${form.role === 'mentor' ? 'Mentor' : 'Candidate'}`
                    )}
                  </button>
                </form>

                <p className="text-center mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#2F6FED', fontWeight: 500 }}>
                    Sign in
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

export default Register;
