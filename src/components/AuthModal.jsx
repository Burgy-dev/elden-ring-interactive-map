import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";

export function AuthModal({ mode, onClose, switchMode }) {
  const { login, signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "login") {
      await login(email, password);
    } else {
      await signup(email, password, passwordConfirm);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 5000,
      }}
    >
      <div
        style={{
          background: "#1e1e1e",
          padding: "20px",
          borderRadius: "8px",
          width: "300px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          color: "white",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* X button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "8px",
            right: "10px",
            background: "transparent",
            color: "white",
            fontSize: "18px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          {mode === "login" ? "Log In" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <button
            type="submit"
            style={{
              background: mode === "login" ? "purple" : "green",
              color: "white",
              padding: "8px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            fontSize: "0.85em",
            marginTop: "4px",
            cursor: "pointer",
            color: "#a5a5a5",
          }}
          onClick={switchMode}
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Log in"}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #555",
  background: "#2b2b2b",
  color: "white",
};
