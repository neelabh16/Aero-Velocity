import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Auth = () => {
  const [loading, setLoading] = useState(null); // null | 'email' | 'forgot' | 'guest'
  const [toast, setToast] = useState(null);

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin'); // signin | signup

  const isStrongPassword = useMemo(() => password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password), [password]);

  const navigate = useNavigate();
  const { loginLocalUser } = useAuth();

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    window.clearTimeout(window._authToastTimer);
    window._authToastTimer = window.setTimeout(() => setToast(null), 3500);
  };

  const handleEmail = async () => {
    if (!emailRegex.test(email)) return showToast('Enter a valid email.');
    if (mode === 'signup' && !isStrongPassword) return showToast('Password must have 8+ chars, a number and an uppercase letter.');
    
    try {
      setLoading('email');
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (e) {
      // If Firebase Auth is not enabled in Firebase Console, fallback to local session
      if (
        e?.code === 'auth/configuration-not-found' ||
        e?.code === 'auth/operation-not-allowed' ||
        e?.message?.includes('configuration-not-found') ||
        e?.message?.includes('operation-not-allowed')
      ) {
        loginLocalUser(email);
        showToast('Access granted! Continuing with local session.', 'success');
        setTimeout(() => navigate('/dashboard'), 500);
        return;
      }
      showToast(e?.message || 'Authentication failed');
    } finally {
      setLoading(null);
    }
  };

  const handleGuestAccess = () => {
    setLoading('guest');
    loginLocalUser(email || 'engineer@aerovelocity.f1', 'F1 Aero Engineer');
    showToast('Welcome, F1 Engineer! Launching dashboard...', 'success');
    setTimeout(() => {
      navigate('/dashboard');
    }, 400);
  };

  const handleForgotPassword = async () => {
    if (!emailRegex.test(email)) return showToast('Enter your email to reset password.');
    try {
      setLoading('forgot');
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset link sent to your email.', 'success');
    } catch (e) {
      showToast(e?.message || 'Failed to send reset email');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="auth-container glass"
      >
        <div className="auth-header">
          <h1>Aero Velocity</h1>
          <p>Secure access to your F1 analytics</p>
        </div>

        <div className="toggle">
          <span className={mode === 'signin' ? 'on' : ''} onClick={() => setMode('signin')}>Sign In</span>
          <span>/</span>
          <span className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')}>Sign Up</span>
        </div>

        <div className="panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="section">
                <h4 className="section-title">Email {mode === 'signup' ? 'Sign Up' : 'Sign In'}</h4>
                <div className="form">
                  <label>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  <label>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters, 1 number, 1 uppercase" />
                  <div className="row">
                    <button className="secondary-btn" onClick={handleForgotPassword} disabled={loading === 'forgot' || loading === 'email'}>
                      {loading === 'forgot' ? <span className="spinner" /> : 'Forgot Password'}
                    </button>
                    <div style={{ flex: 1 }} />
                    <button className="primary-btn" onClick={handleEmail} disabled={loading === 'email'}>
                      {loading === 'email' ? <span className="spinner" /> : (mode === 'signup' ? 'Create Account' : 'Sign In')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="divider"><span>or</span></div>

              <div className="section" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  className="primary-btn"
                  onClick={handleGuestAccess}
                  disabled={loading === 'guest'}
                  style={{
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)',
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
                    color: '#000',
                    fontWeight: 700
                  }}
                >
                  {loading === 'guest' ? <span className="spinner" /> : '⚡ Continue as Guest (Instant Access)'}
                </button>

                {mode === 'signin' ? (
                  <button className="secondary-btn" onClick={() => setMode('signup')} style={{ width: '100%', marginTop: '6px' }}>
                    New here? Register Account
                  </button>
                ) : (
                  <button className="secondary-btn" onClick={() => setMode('signin')} style={{ width: '100%', marginTop: '6px' }}>
                    Already have an account? Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {toast && (
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
