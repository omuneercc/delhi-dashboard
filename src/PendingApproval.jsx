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
};

export default function PendingApproval({ email }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.bg,
        fontFamily: "Inter, sans-serif",
        padding: 16,
      }}
    >
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: 32,
          width: 360,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.maroonDark, marginBottom: 4 }}>
          Waiting for approval
        </div>
        <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 20, lineHeight: 1.5 }}>
          Your account (<strong>{email}</strong>) has been created, but an admin needs to approve access before
          you can use the dashboard. You'll be able to sign in as soon as that happens.
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
            background: "transparent",
            color: COLORS.maroon,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
