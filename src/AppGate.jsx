import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Login from "./Login";
import PendingApproval from "./PendingApproval";
import AdminApprovals from "./AdminApprovals";
import DashboardApp from "./DashboardApp";

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

export default function AppGate() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [profile, setProfile] = useState(undefined); // undefined = loading, null = none yet
  const [showAdmin, setShowAdmin] = useState(false);
  const [signedOutReason, setSignedOutReason] = useState("");

  const lastActivity = useRef(Date.now());

  // --- Auth session ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (!sess) setProfile(undefined);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // --- Load this user's profile (approval status) whenever session changes ---
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (!cancelled) setProfile(error ? null : data);
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  // --- 15-minute inactivity auto-logout (only while signed in) ---
  useEffect(() => {
    if (!session) return;

    lastActivity.current = Date.now();
    const markActive = () => {
      lastActivity.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, markActive, { passive: true }));

    const interval = setInterval(() => {
      if (Date.now() - lastActivity.current > INACTIVITY_LIMIT_MS) {
        setSignedOutReason("You were signed out after 15 minutes of inactivity.");
        supabase.auth.signOut();
      }
    }, 15000);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActive));
      clearInterval(interval);
    };
  }, [session]);

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#7A6C5D" }}>
        Loading…
      </div>
    );
  }

  if (!session) return <Login notice={signedOutReason} />;

  if (profile === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#7A6C5D" }}>
        Checking access…
      </div>
    );
  }

  const isSuperAdmin = profile?.role === "admin";
  const isApproved = profile?.approved === true;

  if (!isApproved) {
    return <PendingApproval email={session.user.email} />;
  }

  return (
    <div>
      <div className="fixed right-4 bottom-20 md:bottom-4 flex gap-2" style={{ zIndex: 50 }}>
        {isSuperAdmin && (
          <button
            onClick={() => setShowAdmin(true)}
            style={{
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #E7DCC9",
              background: "#FFFFFF",
              color: "#6E1E2A",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Admin
          </button>
        )}
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
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
      </div>

      {showAdmin && <AdminApprovals onClose={() => setShowAdmin(false)} />}

      <DashboardApp />
    </div>
  );
}
