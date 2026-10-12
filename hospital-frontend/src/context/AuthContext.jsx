import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('hospital_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hospital_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (authData) => {
    localStorage.setItem('hospital_token', authData.token);
    const userData = {
      userId: authData.userId,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
      patientId: authData.patientId,
      doctorId: authData.doctorId,
    };
    localStorage.setItem('hospital_user', JSON.stringify(userData));
    setToken(authData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    role: user?.role,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
