import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Login from "./Login";
import DashboardApp from "./DashboardApp";

export default function AppGate() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#7A6C5D" }}>
        Loading…
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div>
      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 50,
          fontSize: 12,
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid #E7DCC9",
          background: "#FFFFFF",
          color: "#A6462F",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
      <DashboardApp />
    </div>
  );
}
