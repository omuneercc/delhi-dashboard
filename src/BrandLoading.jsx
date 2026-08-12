export default function BrandLoading({ label = "Loading…" }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: "#FAF6EE" }}>
      <svg className="arch-loading" width="44" height="44" viewBox="0 0 40 40" fill="none">
        <path d="M6 34V20C6 11 12 5 20 5C28 5 34 11 34 20V34" stroke="#B8862E" strokeWidth="2.2" />
        <path d="M6 34H34" stroke="#B8862E" strokeWidth="2.2" />
        <circle cx="20" cy="18" r="2.3" fill="#B8862E" />
      </svg>
      <div style={{ marginTop: 12, fontSize: 13, color: "#7A6C5D" }}>{label}</div>
    </div>
  );
}
