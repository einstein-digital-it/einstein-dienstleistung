import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/api/backendClient";
import { clearStoredAuth, getStoredAuthUser, redirectToLogin } from "@/lib/backendAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ public_settings: {} });

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const storedUser = getStoredAuthUser();
      if (!storedUser?.email) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return null;
      }

      const currentUser = await authApi.getCurrentUser(storedUser.email);
      localStorage.setItem("einstein_auth_user", JSON.stringify(currentUser));
      localStorage.setItem("einstein_customer_email", currentUser.email);
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      return currentUser;
    } catch (error) {
      clearStoredAuth();
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: "auth_required", message: error.message || "Authentication required" });
      setIsLoadingAuth(false);
      return null;
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await authApi.logout();
    } catch {
      // Local cleanup still completes logout if the server token is already invalid.
    }
    clearStoredAuth();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) redirectToLogin();
  };

  const navigateToLogin = () => redirectToLogin();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState: checkUserAuth,
        checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
