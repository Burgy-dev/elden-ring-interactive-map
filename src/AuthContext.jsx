import { createContext, useContext, useState, useEffect } from "react";
import { api, setAuthToken } from "./api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      api.get("/me")
        .then(res => setUser(res.data))
        .catch(() => setAuthToken(null));
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    setAuthToken(res.data.token);
    setUser(res.data.user);
  };

  const signup = async (email, password, passwordConfirmation) => {
    const res = await api.post("/signup", { email, password, password_confirmation: passwordConfirmation });
    setAuthToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
