import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import axios from "axios";

export function AuthModal({ mode, onClose, switchMode }) {
  const { login, signup } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Please enter a username";
    }

    if (mode === "signup" && password !== passwordConfirm) {
      newErrors.password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (mode === "login") {
        await login(username, password);
      } else {
        await signup(username, password, passwordConfirm);
      }
      onClose();
    } catch (err) {
      console.error(`${mode} error:`, err);
      const newErrors = {};

      if (axios.isAxiosError(err) && err.response) {
        const { status, data } = err.response;

        if (mode === "login") {
          if (status === 401 || data?.error?.includes("not found")) {
            newErrors.username = "Account not found";
          } else {
            newErrors.global = "Login failed. Please try again.";
          }
        } else {
          if (status === 422 || data?.error?.includes("taken")) {
            newErrors.username = "Username already taken";
          } else {
            newErrors.global = "Signup failed. Please try again.";
          }
        }
      } else {
        newErrors.global = "Network error. Please try again.";
      }

      setErrors(newErrors);
    } finally {
      setLoading(false);
    }
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Username */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: errors.username ? "#e63946" : "#555",
                background: errors.username ? "#3b1f1f" : "#2b2b2b",
              }}
            />
            {errors.username && (
              <span style={errorTextStyle}>{errors.username}</span>
            )}
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: errors.password ? "#e63946" : "#555",
                background: errors.password ? "#3b1f1f" : "#2b2b2b",
              }}
            />
            {errors.password && (
              <span style={errorTextStyle}>{errors.password}</span>
            )}
          </div>

          {/* Confirm password for signup */}
          {mode === "signup" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: errors.password ? "#e63946" : "#555",
                  background: errors.password ? "#3b1f1f" : "#2b2b2b",
                }}
              />
            </div>
          )}

          {/* Global errors */}
          {errors.global && (
            <span style={{ ...errorTextStyle, textAlign: "center" }}>
              {errors.global}
            </span>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: mode === "login" ? "purple" : "green",
              color: "white",
              padding: "8px",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "36px",
            }}
          >
            {loading ? <DotLoader /> : mode === "login" ? "Log In" : "Sign Up"}
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

const errorTextStyle = {
  color: "#e63946",
  fontSize: "0.75rem",
  marginTop: "2px",
};

/* Loader Component */
function DotLoader() {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "white",
            animation: `dot-flash 1s ease-in-out ${i * 0.2}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes dot-flash {
          0% { opacity: 0.3; transform: translateY(0px); }
          100% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
