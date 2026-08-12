import { useEffect, useState } from "react";

const COLORS = {
  maroonDark: "#4A1017",
  gold: "#B8862E",
  green: "#4F6B44",
  rust: "#A6462F",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2600);
    };
    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed z-[200] flex flex-col gap-2 items-center md:items-end"
      style={{ top: 12, left: 0, right: 0, paddingLeft: 12, paddingRight: 12 }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg"
          style={{
            background: COLORS.maroonDark,
            color: t.type === "error" ? "#F6C9BC" : "#F3EAD3",
            border: `1px solid ${t.type === "error" ? COLORS.rust : COLORS.gold}`,
            animation: "toastIn 0.25s ease-out",
            maxWidth: "90vw",
          }}
        >
          {t.type === "error" ? "⚠ " : "✓ "}
          {t.message}
        </div>
      ))}
    </div>
  );
}
