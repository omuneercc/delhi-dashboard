import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

const COLORS = {
  bg: "#FAF6EE",
  surface: "#FFFFFF",
  ink: "#2B211B",
  inkSoft: "#7A6C5D",
  maroon: "#6E1E2A",
  maroonDark: "#4A1017",
  gold: "#B8862E",
  border: "#E7DCC9",
  rust: "#A6462F",
};

export default function Login({ notice }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Account created. An admin needs to approve your access before you can sign in — you'll be notified once approved.");
        setMode("signin");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.bg,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 32,
          width: 340,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.maroonDark, marginBottom: 2 }}>
          Delhi k Zaiqay
        </div>
        <div style={{ fontSize: 12, color: COLORS.gold, letterSpacing: 1.5, marginBottom: 20 }}>
          ADMIN DASHBOARD
        </div>

        <label style={{ fontSize: 12, color: COLORS.inkSoft }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            marginTop: 4,
            marginBottom: 12,
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
          }}
        />

        <label style={{ fontSize: 12, color: COLORS.inkSoft }}>Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            marginTop: 4,
            marginBottom: 16,
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
          }}
        />

        {error && <div style={{ color: COLORS.rust, fontSize: 12, marginBottom: 10 }}>{error}</div>}
        {info && <div style={{ color: COLORS.maroon, fontSize: 12, marginBottom: 10 }}>{info}</div>}
        {notice && !error && !info && <div style={{ color: COLORS.gold, fontSize: 12, marginBottom: 10 }}>{notice}</div>}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 8,
            border: "none",
            background: COLORS.maroon,
            color: "#F3EAD3",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: COLORS.inkSoft }}>
          {mode === "signin" ? (
            <>
              First time here?{" "}
              <button type="button" onClick={() => setMode("signup")} style={{ color: COLORS.maroon, fontWeight: 600 }}>
                Create your admin account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("signin")} style={{ color: COLORS.maroon, fontWeight: 600 }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
