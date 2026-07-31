import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const COLORS = {
  bg: "#FAF6EE",
  surface: "#FFFFFF",
  ink: "#2B211B",
  inkSoft: "#7A6C5D",
  maroon: "#6E1E2A",
  maroonDark: "#4A1017",
  gold: "#B8862E",
  goldFaint: "#F3EAD3",
  border: "#E7DCC9",
  green: "#4F6B44",
  rust: "#A6462F",
};

export default function AdminApprovals({ onClose }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (!error) setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await supabase.from("profiles").update({ approved: true }).eq("id", id);
    load();
  };
  const reject = async (id) => {
    if (!confirm("Reject and delete this signup request?")) return;
    await supabase.from("profiles").delete().eq("id", id);
    load();
  };
  const revoke = async (id) => {
    if (!confirm("Revoke this user's access?")) return;
    await supabase.from("profiles").update({ approved: false }).eq("id", id);
    load();
  };

  const pending = profiles.filter((p) => !p.approved);
  const approved = profiles.filter((p) => p.approved);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: COLORS.bg,
          borderRadius: 16,
          width: "100%",
          maxWidth: 560,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: 24,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div style={{ fontFamily: "Cormorant Garamond", fontWeight: 700, fontSize: 24, color: COLORS.maroonDark }}>
            Admin — Access Requests
          </div>
          <button onClick={onClose} style={{ color: COLORS.rust, fontSize: 20, fontWeight: 700 }}>
            ×
          </button>
        </div>

        {loading && <div style={{ fontSize: 13, color: COLORS.inkSoft }}>Loading…</div>}

        {!loading && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.maroon, marginBottom: 8 }}>
              PENDING APPROVAL ({pending.length})
            </div>
            {pending.length === 0 && <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 16 }}>No pending requests.</div>}
            {pending.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg mb-2"
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
              >
                <div>
                  <div style={{ fontSize: 14, color: COLORS.ink }}>{p.email}</div>
                  <div style={{ fontSize: 11, color: COLORS.inkSoft }}>
                    Requested {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(p.id)} className="px-3 py-1 rounded-md text-xs font-semibold" style={{ background: COLORS.green, color: "#fff" }}>
                    Approve
                  </button>
                  <button onClick={() => reject(p.id)} className="px-3 py-1 rounded-md text-xs font-semibold" style={{ background: COLORS.rust, color: "#fff" }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}

            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.maroon, margin: "20px 0 8px" }}>
              APPROVED USERS ({approved.length})
            </div>
            {approved.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg mb-2"
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
              >
                <div>
                  <div style={{ fontSize: 14, color: COLORS.ink }}>
                    {p.email} {p.role === "admin" && <span style={{ color: COLORS.gold, fontSize: 11 }}>(super admin)</span>}
                  </div>
                </div>
                {p.role !== "admin" && (
                  <button onClick={() => revoke(p.id)} className="px-3 py-1 rounded-md text-xs font-semibold" style={{ background: COLORS.goldFaint, color: COLORS.maroonDark, border: `1px solid ${COLORS.gold}` }}>
                    Revoke access
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
