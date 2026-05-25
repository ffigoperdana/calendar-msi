import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import app from "../firebase";
import { gapi } from "gapi-script";

export const AuthContext = createContext();

/**
 * Checks if the token has expired by comparing current time against stored expiry.
 * @param {number|null} tokenExpiry - The token expiry timestamp (in milliseconds)
 * @returns {boolean} true if the token is expired or missing
 */
export function checkTokenExpiry(tokenExpiry) {
  if (!tokenExpiry) return true;
  // Consider expired if less than 60 seconds remain
  return Date.now() >= tokenExpiry - 60000;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const navigateRef = useRef(null);

  // Allow components to register a navigate function for redirect
  const setNavigate = useCallback((nav) => {
    navigateRef.current = nav;
  }, []);

  const logOut = useCallback(() => {
    return signOut(auth).then(() => {
      if (gapi.auth2 && gapi.auth2.getAuthInstance()) {
        gapi.auth2.getAuthInstance().signOut();
      }
      setUser(null);
      setToken(null);
      setTokenExpiry(null);
    });
  }, [auth]);

  const handleTokenExpired = useCallback(() => {
    setSessionExpired(true);
    logOut().then(() => {
      if (navigateRef.current) {
        navigateRef.current("/login?expired=true");
      } else {
        // Fallback: redirect via window.location if navigate not available
        window.location.href = "/login?expired=true";
      }
    });
  }, [logOut]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await gapi.auth2.getAuthInstance().signIn();
        const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
        const authResponse = googleUser.getAuthResponse();
        const oauthToken = authResponse.access_token;
        const expires_at = authResponse.expires_at;
        setToken(oauthToken);
        setTokenExpiry(expires_at);
        setSessionExpired(false);
      } else {
        setUser(null);
        setToken(null);
        setTokenExpiry(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Periodic token expiry check (every 60 seconds)
  useEffect(() => {
    if (!tokenExpiry || !token) return;

    const intervalId = setInterval(() => {
      if (checkTokenExpiry(tokenExpiry)) {
        handleTokenExpired();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [tokenExpiry, token, handleTokenExpired]);

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider).then(async () => {
      await gapi.auth2.getAuthInstance().signIn();
      const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
      const authResponse = googleUser.getAuthResponse();
      const oauthToken = authResponse.access_token;
      const expires_at = authResponse.expires_at;
      setToken(oauthToken);
      setTokenExpiry(expires_at);
      setSessionExpired(false);
    });
  };

  /**
   * Centralized authenticated request wrapper.
   * - Checks token validity before making the call
   * - Catches 401/403 responses from gapi.client.request
   * - On expiry detection: calls logOut(), sets sessionExpired flag, navigates to /login?expired=true
   *
   * @param {object} requestConfig - Configuration object for gapi.client.request
   * @returns {Promise} - The API response
   */
  const authenticatedRequest = useCallback(async (requestConfig) => {
    // Check token expiry before making the request
    if (checkTokenExpiry(tokenExpiry)) {
      handleTokenExpired();
      throw new Error("Token expired. Session has been cleared.");
    }

    try {
      const response = await gapi.client.request(requestConfig);
      return response;
    } catch (error) {
      const status = error?.status || error?.result?.error?.code;
      if (status === 401 || status === 403) {
        // Token is expired or invalid - handle expiry
        handleTokenExpired();
        throw new Error("Token expired. Session has been cleared.");
      }
      throw error;
    }
  }, [tokenExpiry, handleTokenExpired]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      tokenExpiry,
      sessionExpired,
      signInWithGoogle,
      logOut,
      authenticatedRequest,
      setNavigate,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
