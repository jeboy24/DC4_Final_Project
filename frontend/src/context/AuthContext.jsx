import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  // Only "loading" if there is a saved token to verify
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  // On page load, confirm the saved token is still valid
  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    api
      .get('/user')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const saveAuth = ({ user, token }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    saveAuth(res.data);
    return res.data.user;
  };

  const register = async (form) => {
    const res = await api.post('/register', form);
    saveAuth(res.data);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // ignore: we clear the token either way
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}