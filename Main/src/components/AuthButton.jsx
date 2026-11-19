// Auth Button Component
// Displays sign-in/sign-out button based on auth state

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthButton.css';

const AuthButton = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-button">
        <div className="auth-loading">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-button">
        <div className="user-info">
          <img
            src={user.photoURL || '/vite.svg'}
            alt={user.displayName || 'User'}
            className="user-avatar"
          />
          <span className="user-name">{user.displayName || user.email?.split('@')[0] || 'Engineer'}</span>
        </div>
        <button className="sign-out-btn" onClick={signOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-button">
      <Link to="/auth" className="sign-in-btn">Sign In</Link>
    </div>
  );
};

export default AuthButton;
