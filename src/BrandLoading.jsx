import logoIcon from "./assets/logo-icon.png";

export default function BrandLoading({ label = "Loading…" }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: "#FAF6EE" }}>
      <img src={logoIcon} alt="Delhi k Zaiqay" className="arch-loading" style={{ height: 56, width: "auto" }} />
      <div style={{ marginTop: 12, fontSize: 13, color: "#7A6C5D" }}>{label}</div>
    </div>
  );
}
