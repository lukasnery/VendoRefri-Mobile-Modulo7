import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import api, { setAuthToken } from "../services/api";

const AuthContext = createContext(null);
const SESSION_KEY = "vendorefri.session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          if (session?.user && session?.token) {
            setUser(session.user);
            setToken(session.token);
            setAuthToken(session.token);
          }
        }
      } catch {
        await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
        setAuthToken(null);
      } finally {
        setLoadingSession(false);
      }
    })();
  }, []);

  async function persistSession(session) {
    setUser(session.user);
    setToken(session.token);
    setAuthToken(session.token);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  }

  async function login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });
    const session = response.data;
    await persistSession(session);
    return session;
  }

  async function register(payload) {
    await api.post("/users", payload);
    return login(payload.email, payload.senha);
  }

  async function logout() {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }

  const value = useMemo(
    () => ({ user, token, loadingSession, login, register, logout, isAdmin: user?.role === "ADMIN" }),
    [user, token, loadingSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
