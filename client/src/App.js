import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import axios from 'axios';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Orders from './pages/Orders';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#6c63ff' },
      secondary: { main: '#ff6584' },
      background: {
        default: mode === 'dark' ? '#0f0f1a' : '#f5f5f5',
        paper: mode === 'dark' ? '#1a1a2e' : '#ffffff',
      },
    },
    typography: { fontFamily: 'Roboto, sans-serif' },
    shape: { borderRadius: 12 },
  });

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('vexo_token'));
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('vexo_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('vexo_theme') || 'dark');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('vexo_token', newToken);
    localStorage.setItem('vexo_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vexo_token');
    localStorage.removeItem('vexo_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('vexo_theme', next);
  };

  const theme = getTheme(themeMode);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
              <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
              <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard toggleTheme={toggleTheme} themeMode={themeMode} /></ProtectedRoute>}
              />
              <Route
                path="/packages"
                element={<ProtectedRoute><Packages toggleTheme={toggleTheme} themeMode={themeMode} /></ProtectedRoute>}
              />
              <Route
                path="/orders"
                element={<ProtectedRoute><Orders toggleTheme={toggleTheme} themeMode={themeMode} /></ProtectedRoute>}
              />
              <Route
                path="/wallet"
                element={<ProtectedRoute><Wallet toggleTheme={toggleTheme} themeMode={themeMode} /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute adminOnly><Admin toggleTheme={toggleTheme} themeMode={themeMode} /></ProtectedRoute>}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}
