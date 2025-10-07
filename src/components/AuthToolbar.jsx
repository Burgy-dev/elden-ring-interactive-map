import { useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { AuthModal } from "./AuthModal.jsx";

export function AuthToolbar() {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("login"); // or "signup"

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "rgba(0,0,0,0.6)",
          padding: "8px 12px",
          borderRadius: "8px",
          color: "white",
          fontFamily: "sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        {user ? (
          <>
            <div style={{ fontSize: "0.9em", opacity: 0.85 }}>{user.email}</div>
            <button
              onClick={logout}
              style={{
                background: "darkred",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setMode("login"); setShowModal(true); }}
              style={buttonStyle}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode("signup"); setShowModal(true); }}
              style={{ ...buttonStyle, background: "green" }}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      {showModal && (
        <AuthModal
          mode={mode}
          onClose={() => setShowModal(false)}
          switchMode={() => setMode(mode === "login" ? "signup" : "login")}
        />
      )}
    </>
  );
}

const buttonStyle = {
  background: "purple",
  color: "white",
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
