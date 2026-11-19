// Auth Context
// Manages authentication state across the app with Firebase & Local/Guest fallback

import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
} from '../services/authService';
import { isFirebaseConfigured } from '../config/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aero_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    try {
      const configured = isFirebaseConfigured();
      setIsConfigured(configured);

      // Listen to auth state changes if Firebase is configured
      const unsubscribe = onAuthStateChange((authUser) => {
        if (authUser) {
          setUser(authUser);
          try {
            localStorage.setItem('aero_user', JSON.stringify({
              uid: authUser.uid,
              displayName: authUser.displayName,
              email: authUser.email,
              photoURL: authUser.photoURL,
            }));
          } catch (e) {
            console.warn('Could not save user to localStorage', e);
          }
        } else {
          // If no Firebase user, check if we have a locally stored guest/user
          const saved = localStorage.getItem('aero_user');
          if (saved) {
            try {
              setUser(JSON.parse(saved));
            } catch {
              setUser(null);
            }
          }
        }
        setLoading(false);
      });

      return () => unsubscribe && unsubscribe();
    } catch (error) {
      console.warn('Error in AuthProvider:', error);
      setLoading(false);
    }
  }, []);

  const loginLocalUser = (email, displayName = null) => {
    const localUser = {
      uid: 'user-' + Date.now(),
      email: email || 'guest@aerovelocity.com',
      displayName: displayName || (email ? email.split('@')[0] : 'F1 Guest Engineer'),
      photoURL: null,
      isLocal: true,
    };
    try {
      localStorage.setItem('aero_user', JSON.stringify(localUser));
    } catch (e) {
      console.warn('Could not save user to localStorage', e);
    }
    setUser(localUser);
    return localUser;
  };

  const signIn = async () => {
    try {
      const u = await signInWithGoogle();
      if (u) {
        setUser(u);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('aero_user');
      await signOutUser();
    } catch (error) {
      console.warn('Sign out error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isConfigured,
    signIn,
    signOut,
    loginLocalUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
