import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  apiBaseUrl: string;
  updateServerIp: (ip: string) => Promise<string>;
  login: (username: string, pass: string) => Promise<any>;
  register: (username: string, email: string, pass: string, fullName: string, phone?: string) => Promise<any>;
  verifyOtp: (userId: string, code: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiBaseUrl, setApiBaseUrl] = useState(Config.apiBase);

  const fetchUserProfile = async (tokenVal: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`${apiBaseUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${tokenVal}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.username || data.email)) {
          setUser(data);
          await AsyncStorage.setItem('ciphereye_user', JSON.stringify(data));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch user profile', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem('server_url');
        if (savedUrl && savedUrl.includes(':5001')) {
          setApiBaseUrl(`${savedUrl}/api/v1`);
        } else if (savedUrl) {
          await AsyncStorage.removeItem('server_url');
          setApiBaseUrl(Config.apiBase);
        }

        const savedToken = await AsyncStorage.getItem('ciphereye_token');
        const savedUserJson = await AsyncStorage.getItem('ciphereye_user');
        
        if (savedToken && !savedToken.includes('jwt_session_token') && !savedToken.startsWith('jwt_token_')) {
          setToken(savedToken);
          if (savedUserJson) {
            setUser(JSON.parse(savedUserJson));
          }
          fetchUserProfile(savedToken);
        } else if (savedToken) {
          await AsyncStorage.multiRemove(['ciphereye_token', 'ciphereye_user']);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Failed to load auth cache', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [apiBaseUrl]);

  const updateServerIp = async (ipOrUrl: string) => {
    let formattedUrl = ipOrUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'http://' + formattedUrl;
    }
    if (!formattedUrl.includes(':5001') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `${formattedUrl}:5001`;
    }
    await AsyncStorage.setItem('server_url', formattedUrl);
    const newApiBase = `${formattedUrl}/api/v1`;
    setApiBaseUrl(newApiBase);
    return formattedUrl;
  };

  const executeWithFallback = async (endpoint: string, options: RequestInit) => {
    let targetBase = apiBaseUrl;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`${targetBase}${endpoint}`, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err: any) {
      if (targetBase !== Config.apiBase) {
        setApiBaseUrl(Config.apiBase);
        await AsyncStorage.removeItem('server_url');
        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 12000);
        const res = await fetch(`${Config.apiBase}${endpoint}`, {
          ...options,
          signal: fallbackController.signal
        });
        clearTimeout(fallbackTimeoutId);
        return res;
      }
      throw err;
    }
  };

  const login = async (usernameField: string, passwordField: string) => {
    console.log('LOGIN FUNCTION STARTED');
    console.log('SENDING REQUEST');
    try {
      const res = await executeWithFallback('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameField.trim(), password: passwordField })
      });
      console.log('RESPONSE RECEIVED');
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Invalid username or password');
      }
      
      const tokenVal = data.accessToken || data.token;
      const loggedUser = data.user;

      if (tokenVal) {
        await AsyncStorage.setItem('ciphereye_token', tokenVal);
        setToken(tokenVal);
        console.log('TOKEN SAVED');
      }
      if (loggedUser) {
        setUser(loggedUser);
        await AsyncStorage.setItem('ciphereye_user', JSON.stringify(loggedUser));
        console.log('USER SAVED');
      }
      console.log('NAVIGATING TO DASHBOARD');
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please check that backend server is running on port 5001.');
      }
      if (err.message === 'Network request failed' || err.message?.includes('Failed to fetch')) {
        throw new Error(`Unable to reach server at ${apiBaseUrl}. Please check backend server is running.`);
      }
      throw err;
    }
  };

  const register = async (usernameField: string, emailField: string, passwordField: string, fullNameField: string, phoneField?: string) => {
    try {
      const res = await executeWithFallback('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameField.trim(),
          email: emailField.trim(),
          password: passwordField,
          fullName: fullNameField.trim(),
          phone: phoneField
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }
      
      const registeredUser = data.user;
      const tokenVal = data.accessToken || data.token;

      if (tokenVal) {
        await AsyncStorage.setItem('ciphereye_token', tokenVal);
        setToken(tokenVal);
      }
      if (registeredUser) {
        setUser(registeredUser);
        await AsyncStorage.setItem('ciphereye_user', JSON.stringify(registeredUser));
      }

      return { success: true, ...data, user: registeredUser, token: tokenVal };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please check that backend server is running on port 5001.');
      }
      if (err.message === 'Network request failed' || err.message?.includes('Failed to fetch')) {
        throw new Error(`Unable to reach server at ${apiBaseUrl}. Please check backend server is running.`);
      }
      throw err;
    }
  };

  const verifyOtp = async (userId: string, code: string) => {
    try {
      const res = await executeWithFallback('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: code.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'OTP verification failed');
      }
      const tokenVal = data.accessToken || data.token;
      const verifiedUser = data.user;
      if (tokenVal) {
        await AsyncStorage.setItem('ciphereye_token', tokenVal);
        setToken(tokenVal);
      }
      if (verifiedUser) {
        setUser(verifiedUser);
        await AsyncStorage.setItem('ciphereye_user', JSON.stringify(verifiedUser));
      }
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please check that backend server is running on port 5001.');
      }
      if (err.message === 'Network request failed' || err.message?.includes('Failed to fetch')) {
        throw new Error(`Unable to reach server at ${apiBaseUrl}. Please check backend server is running.`);
      }
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await executeWithFallback('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Password reset request failed');
      }
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please check that mobile and computer are on the same hotspot/Wi-Fi network.');
      }
      if (err.message === 'Network request failed' || err.message?.includes('Failed to fetch')) {
        throw new Error(`Unable to reach server at ${apiBaseUrl}. Please check backend server is running.`);
      }
      throw err;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      const res = await executeWithFallback('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Password reset failed');
      }
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please check that mobile and computer are on the same hotspot/Wi-Fi network.');
      }
      if (err.message === 'Network request failed' || err.message?.includes('Failed to fetch')) {
        throw new Error(`Unable to reach server at ${apiBaseUrl}. Please check backend server is running.`);
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['ciphereye_token', 'ciphereye_user', 'ciphereye_remember_email']);
    } catch {}
    setToken(null);
    setUser(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      }).then(() => clearTimeout(timeoutId)).catch(() => {});
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        apiBaseUrl,
        updateServerIp,
        login,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
