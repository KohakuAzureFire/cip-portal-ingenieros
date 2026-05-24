import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, UserRole } from '../types';
import { db } from '../services/mockDb';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // Validar que tenga la estructura correcta
        if (parsed && parsed.id && parsed.email && parsed.rol) {
          setUser(parsed);
        } else {
          localStorage.removeItem('auth_user');
        }
      }
    } catch (err) {
      console.error('Error loading user from localStorage:', err);
      localStorage.removeItem('auth_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authenticatedUser = db.authenticateUser(email, password);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
      } else {
        throw new Error('Credenciales inválidas');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const register = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      const newUser = db.createUser(userData);
      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.rol as UserRole);
    }
    return user.rol === requiredRole;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    canAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
