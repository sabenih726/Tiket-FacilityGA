
import { useState, useEffect } from "react";

interface AdminSession {
  id: string;
  username: string;
  full_name: string;
  loginTime: string;
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = () => {
    try {
      const stored = localStorage.getItem('adminSession');
      if (stored) {
        const session = JSON.parse(stored);
        // Check if session is not older than 24 hours
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setAdminSession(session);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (session: AdminSession) => {
    setAdminSession(session);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('adminSession');
    setAdminSession(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    adminSession,
    isLoading,
    login,
    logout,
  };
};
