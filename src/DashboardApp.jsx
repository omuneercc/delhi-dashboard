import { useState, useEffect, useRef } from "react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
`;

const COLORS = {
  bg: "#FAF6EE",
  surface: "#FFFFFF",
  ink: "#2B211B",
  inkSoft: "#7A6C5D",
  maroon: "#6E1E2A",
  maroonDark: "#4A1017",
  gold: "#B8862E",
  goldSoft: "#E9D8B0",
  goldFaint: "#F3EAD3",
  green: "#4F6B44",
  greenBg: "#EEF1E8",
  rust: "#A6462F",
  rustBg: "#F6E9E4",
  border: "#E7DCC9",
};

function blankVariant(label, portionGrams) {
  return { id: "v" + Math.random().toString(36).slice(2, 9), label, portionGrams, price: "" };
}
const DEFAULT_VARIANTS = () => [
  blankVariant("Per Plate", 300),
  blankVariant("Half KG", 500),
  blankVariant("Per KG", 1000),
];

const DEFAULT_DISHES = [
  { name: "Chicken/Beef Biryani", category: "Biryani & Rice" },
  { name: "Beef/Chicken Pulao", category: "Biryani & Rice" },
  { name: "Chana Pulao", category: "Biryani & Rice" },
  { name: "White Spicy Biryani", category: "Biryani & Rice" },
  { name: "Qeema Masoor Biryani", category: "Biryani & Rice" },
  { name: "Chicken Egg Fried Rice/Gravy of Choice", category: "Biryani & Rice" },
  { name: "Chicken Jalfrezi with Rice", category: "Biryani & Rice" },
  { name: "Paneer Reshmi Handi", category: "Karahi & Handi" },
  { name: "Kali Mirch Karahi", category: "Karahi & Handi" },
  { name: "Peshawari Karahi", category: "Karahi & Handi" },
  { name: "Daighi Qorma", category: "Karahi & Handi" },
  { name: "Daighi Alu Gosht", category: "Karahi & Handi" },
  { name: "Pasinday", category: "Karahi & Handi" },
  { name: "Alu Qeema", category: "Qeema Specialties" },
  { name: "Piyaz Qeema", category: "Qeema Specialties" },
  { name: "Shimla Mirch Qeema", category: "Qeema Specialties" },
  { name: "Hari Mirch Qeema", category: "Qeema Specialties" },
  { name: "Special Delhi Kachri Qeema", category: "Qeema Specialties" },
  { name: "Koftay", category: "Kebabs & Koftay" },
  { name: "Galawti Fry Kebab", category: "Kebabs & Koftay" },
  { name: "Frozen Shami Kebab", category: "Kebabs & Koftay" },
  { name: "Karhi", category: "Daal & Curry" },
  { name: "Maash Daal", category: "Daal & Curry" },
  { name: "Mong/Masoor Daal", category: "Daal & Curry" },
  { name: "Zeera Bhagar Alu Bhujia", category: "Daal & Curry" },
].map((d, i) => ({ id: "d" + i, ingredients: [], makingCharge: "", batchWeight: 1000, variants: DEFAULT_VARIANTS(), ...d }));

const DEFAULT_ZONES = [
  { id: "z0", label: "Nearby", minKm: 0, maxKm: 3, rate: 300 },
  { id: "z1", label: "Mid-range", minKm: 3, maxKm: 6, rate: 350 },
  { id: "z2", label: "Far", minKm: 6, maxKm: 10, rate: 400 },
  { id: "z3", label: "Extended", minKm: 10, maxKm: 15, rate: 450 },
];

const CATEGORY_ORDER = ["Biryani & Rice", "Karahi & Handi", "Qeema Specialties", "Kebabs & Koftay", "Daal & Curry"];

function ArchIcon({ size = 28, color = COLORS.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M6 34V20C6 11 12 5 20 5C28 5 34 11 34 20V34" stroke={color} strokeWidth="2.2" />
      <path d="M6 34H34" stroke={color} strokeWidth="2.2" />
      <circle cx="20" cy="18" r="2.3" fill={color} />
      <path d="M13 27H27" stroke={color} strokeWidth="1.2" opacity="0.6" />
    </svg>
  );
}

function Flourish({ color = COLORS.gold }) {
  return (
    <svg width="70" height="14" viewBox="0 0 70 14" fill="none">
      <line x1="0" y1="7" x2="27" y2="7" stroke={color} strokeWidth="1" opacity="0.5" />
      <path d="M35 2L38 7L35 12L32 7Z" fill={color} />
      <line x1="43" y1="7" x2="70" y2="7" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function fmt(n) {
  if (n === "" || n === null || n === undefined || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("en-PK");
}
function fmt2(n) {
  if (n === "" || n === null || n === undefined || isNaN(n)) return "—";
  return n.toFixed(2);
}

function marginTone(margin) {
  if (margin === null) return { color: COLORS.inkSoft, bg: COLORS.bg };
  if (margin >= 50) return { color: COLORS.green, bg: COLORS.greenBg };
  if (margin >= 30) return { color: COLORS.maroon, bg: COLORS.goldFaint };
  return { color: COLORS.rust, bg: COLORS.rustBg };
}

function ingredientCost(d) {
  return (d.ingredients || []).reduce((s, i) => s + (Number(i.cost) || 0), 0);
}
function batchCost(d) {
  return ingredientCost(d) + (Number(d.makingCharge) || 0);
}
function costPerGram(d) {
  const bw = Number(d.batchWeight) || 0;
  return bw > 0 ? batchCost(d) / bw : 0;
}
function variantStats(d, v) {
  const cpg = costPerGram(d);
  const grams = Number(v.portionGrams) || 0;
  const cost = cpg * grams;
  const price = Number(v.price) || 0;
  const has = v.price !== "" && price > 0 && cost > 0;
  return { cost, price, has, profit: has ? price - cost : null, margin: has ? (100 * (price - cost)) / price : null };
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function App() {
  const [dishes, setDishes] = useState(DEFAULT_DISHES);
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tab, setTab] = useState("dashboard");
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const saveTimer = useRef(null);
  const [newDishName, setNewDishName] = useState("");
  const [newDishCat, setNewDishCat] = useState(CATEGORY_ORDER[0]);

  useEffect(() => {
    (async () => {
      try {
        const d = await window.storage.get("menu-dishes-v4", false);
        if (d && d.value) setDishes(JSON.parse(d.value));
      } catch (e) {}
      try {
        const z = await window.storage.get("delivery-zones", false);
        if (z && z.value) setZones(JSON.parse(z.value));
      } catch (e) {}
      try {
        const s = await window.storage.get("sales-log", false);
        if (s && s.value) setSales(JSON.parse(s.value));
      } catch (e) {}
      try {
        const ex = await window.storage.get("expenses-log", false);
        if (ex && ex.value) setExpenses(JSON.parse(ex.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set("menu-dishes-v4", JSON.stringify(dishes), false);
        await window.storage.set("delivery-zones", JSON.stringify(zones), false);
        await window.storage.set("sales-log", JSON.stringify(sales), false);
        await window.storage.set("expenses-log", JSON.stringify(expenses), false);
        setSaveState("saved");
      } catch (e) {
        setSaveState("error");
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [dishes, zones, sales, expenses, loaded]);

  const updateDish = (id, field, value) => setDishes((ds) => ds.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  const deleteDish = (id) => setDishes((ds) => ds.filter((d) => d.id !== id));
  const addDish = () => {
    if (!newDishName.trim()) return;
    setDishes((ds) => [
      ...ds,
      { id: "d" + Date.now(), name: newDishName.trim(), category: newDishCat, ingredients: [], makingCharge: "", batchWeight: 1000, variants: DEFAULT_VARIANTS() },
    ]);
    setNewDishName("");
  };

  const addIngredient = (dishId) =>
    setDishes((ds) =>
      ds.map((d) => (d.id === dishId ? { ...d, ingredients: [...(d.ingredients || []), { id: "i" + Date.now() + Math.random(), name: "", amount: "", cost: "" }] } : d))
    );
  const updateIngredient = (dishId, ingId, field, value) =>
    setDishes((ds) =>
      ds.map((d) => (d.id === dishId ? { ...d, ingredients: d.ingredients.map((i) => (i.id === ingId ? { ...i, [field]: value } : i)) } : d))
    );
  const deleteIngredient = (dishId, ingId) =>
    setDishes((ds) => ds.map((d) => (d.id === dishId ? { ...d, ingredients: d.ingredients.filter((i) => i.id !== ingId) } : d)));

  const updateVariant = (dishId, variantId, field, value) =>
    setDishes((ds) => ds.map((d) => (d.id === dishId ? { ...d, variants: d.variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)) } : d)));
  const addVariant = (dishId) => setDishes((ds) => ds.map((d) => (d.id === dishId ? { ...d, variants: [...d.variants, blankVariant("New option", 0)] } : d)));
  const deleteVariant = (dishId, variantId) => setDishes((ds) => ds.map((d) => (d.id === dishId ? { ...d, variants: d.variants.filter((v) => v.id !== variantId) } : d)));

  const updateZone = (id, field, value) => setZones((zs) => zs.map((z) => (z.id === id ? { ...z, [field]: value } : z)));
  const deleteZone = (id) => setZones((zs) => zs.filter((z) => z.id !== id));
  const addZone = () => setZones((zs) => [...zs, { id: "z" + Date.now(), label: "New zone", minKm: 0, maxKm: 0, rate: 300 }]);

  const addSale = (entry) => setSales((ss) => [{ id: "s" + Date.now() + Math.random(), ...entry }, ...ss]);
  const deleteSale = (id) => setSales((ss) => ss.filter((s) => s.id !== id));

  const addExpense = (entry) => setExpenses((es) => [{ id: "e" + Date.now() + Math.random(), ...entry }, ...es]);
  const deleteExpense = (id) => setExpenses((es) => es.filter((e) => e.id !== id));

  const priced = [];
  dishes.forEach((d) => (d.variants || []).forEach((v) => {
    const s = variantStats(d, v);
    if (s.has) priced.push({ dish: d.name, category: d.category, variant: v.label, ...s });
  }));
  const avgMargin = priced.length ? priced.reduce((a, b) => a + b.margin, 0) / priced.length : null;
  const best = priced.length ? priced.reduce((a, b) => (b.margin > a.margin ? b : a)) : null;
  const worst = priced.length ? priced.reduce((a, b) => (b.margin < a.margin ? b : a)) : null;
  const totalOptions = dishes.reduce((s, d) => s + (d.variants || []).length, 0);
  const unpriced = totalOptions - priced.length;

  const catAvg = CATEGORY_ORDER.map((cat) => {
    const items = priced.filter((m) => m.category === cat);
    const avg = items.length ? items.reduce((a, b) => a + b.margin, 0) / items.length : null;
    return { cat, avg, count: items.length };
  });

  const sidebarItem = (key, label) => (
    <button
      onClick={() => setTab(key)}
      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-colors"
      style={{ background: tab === key ? COLORS.maroon : "transparent", color: tab === key ? "#F3EAD3" : COLORS.goldSoft, fontFamily: "Inter", fontWeight: 600, fontSize: 14, letterSpacing: 0.2 }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ background: COLORS.bg, minHeight: "100%", fontFamily: "Inter" }}>
      <style>{FONTS}</style>
      <div className="flex min-h-screen">
        <div className="flex flex-col gap-1 p-5" style={{ width: 230, background: COLORS.maroonDark, flexShrink: 0 }}>
          <div className="flex items-center gap-2 mb-1 px-1">
            <ArchIcon size={30} color={COLORS.gold} />
            <div>
              <div style={{ fontFamily: "Cormorant Garamond", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: "#FBF3E1", lineHeight: 1.1 }}>Delhi k Zaiqay</div>
              <div style={{ fontSize: 10, color: COLORS.gold, letterSpacing: 1.5 }}>ADMIN DASHBOARD</div>
            </div>
          </div>
          <div className="my-3 px-1">
            <Flourish color={COLORS.gold} />
          </div>
          {sidebarItem("dashboard", "Dashboard")}
          {sidebarItem("menu", "Menu & Costing")}
          {sidebarItem("sales", "Daily Sales")}
          {sidebarItem("expenses", "Expenses")}
          {sidebarItem("delivery", "Delivery Rates")}
          <div className="flex-1" />
          <div style={{ fontSize: 11, color: "#9C8A78", padding: "0 4px" }}>
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && "All changes saved"}
            {saveState === "error" && "Save failed — retrying"}
          </div>
        </div>

        <div className="flex-1 p-8" style={{ maxWidth: 1120 }}>
          {tab === "dashboard" && <Dashboard totalDishes={dishes.length} priced={priced} avgMargin={avgMargin} best={best} worst={worst} unpriced={unpriced} catAvg={catAvg} zones={zones} />}
          {tab === "menu" && (
            <MenuCosting
              dishes={dishes}
              updateDish={updateDish}
              deleteDish={deleteDish}
              addDish={addDish}
              newDishName={newDishName}
              setNewDishName={setNewDishName}
              newDishCat={newDishCat}
              setNewDishCat={setNewDishCat}
              addIngredient={addIngredient}
              updateIngredient={updateIngredient}
              deleteIngredient={deleteIngredient}
              updateVariant={updateVariant}
              addVariant={addVariant}
              deleteVariant={deleteVariant}
            />
          )}
          {tab === "sales" && <DailySales dishes={dishes} sales={sales} addSale={addSale} deleteSale={deleteSale} expenses={expenses} />}
          {tab === "expenses" && <Expenses expenses={expenses} addExpense={addExpense} deleteExpense={deleteExpense} />}
          {tab === "delivery" && <Delivery zones={zones} updateZone={updateZone} deleteZone={deleteZone} addZone={addZone} />}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-6">
      <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.gold, fontWeight: 700 }}>{eyebrow}</div>
      <div style={{ fontFamily: "Cormorant Garamond", fontWeight: 700, fontSize: 34, color: COLORS.ink }}>{title}</div>
      <Flourish color={COLORS.gold} />
    </div>
  );
}

function Card({ label, value, sub, tone }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 11, color: COLORS.inkSoft, fontWeight: 600, letterSpacing: 0.5 }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 600, color: tone || COLORS.ink, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Dashboard({ totalDishes, priced, avgMargin, best, worst, unpriced, catAvg, zones }) {
  return (
    <div>
      <SectionHeader eyebrow="Overview" title="Business at a glance" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card label="Total dishes" value={totalDishes} />
        <Card label="Priced options" value={priced.length} sub={unpriced > 0 ? `${unpriced} options still need pricing` : "All options priced"} tone={unpriced > 0 ? COLORS.rust : COLORS.green} />
        <Card label="Avg profit margin" value={avgMargin !== null ? `${avgMargin.toFixed(0)}%` : "—"} tone={avgMargin !== null ? marginTone(avgMargin).color : undefined} />
        <Card
          label="Delivery range"
          value={zones.length ? `Rs ${Math.min(...zones.map((z) => Number(z.rate) || 0))}–${Math.max(...zones.map((z) => Number(z.rate) || 0))}` : "—"}
          sub="per order, by distance"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-5 rounded-xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.maroon, marginBottom: 10 }}>Best margin</div>
          {best ? (
            <div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 700 }}>
                {best.dish} <span style={{ fontSize: 14, color: COLORS.inkSoft }}>· {best.variant}</span>
              </div>
              <div style={{ fontSize: 13, color: COLORS.inkSoft }}>Rs {fmt(best.profit)} profit · {best.margin.toFixed(0)}% margin</div>
            </div>
          ) : (
            <div style={{ color: COLORS.inkSoft, fontSize: 13 }}>Add ingredients & price to see this</div>
          )}
        </div>
        <div className="p-5 rounded-xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.rust, marginBottom: 10 }}>Needs attention</div>
          {worst ? (
            <div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 22, fontWeight: 700 }}>
                {worst.dish} <span style={{ fontSize: 14, color: COLORS.inkSoft }}>· {worst.variant}</span>
              </div>
              <div style={{ fontSize: 13, color: COLORS.inkSoft }}>Rs {fmt(worst.profit)} profit · {worst.margin.toFixed(0)}% margin</div>
            </div>
          ) : (
            <div style={{ color: COLORS.inkSoft, fontSize: 13 }}>Add ingredients & price to see this</div>
          )}
        </div>
      </div>

      <div className="p-5 rounded-xl" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 14 }}>Average margin by category</div>
        <div className="flex flex-col gap-3">
          {catAvg.map((c) => (
            <div key={c.cat} className="flex items-center gap-3">
              <div style={{ width: 150, fontSize: 13, color: COLORS.inkSoft }}>{c.cat}</div>
              <div className="flex-1 rounded-full overflow-hidden" style={{ background: COLORS.bg, height: 10 }}>
                <div style={{ width: c.avg !== null ? `${Math.min(100, Math.max(4, c.avg))}%` : "0%", background: c.avg !== null ? marginTone(c.avg).color : "transparent", height: "100%", borderRadius: 999 }} />
              </div>
              <div style={{ width: 50, fontSize: 12, fontFamily: "IBM Plex Mono", color: COLORS.inkSoft, textAlign: "right" }}>{c.avg !== null ? `${c.avg.toFixed(0)}%` : `${c.count}/0`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IngredientRow({ dishId, ing, updateIngredient, deleteIngredient }) {
  return (
    <div className="grid items-center px-3 py-1.5" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 28px", borderTop: `1px solid ${COLORS.border}` }}>
      <input
        value={ing.name}
        onChange={(e) => updateIngredient(dishId, ing.id, "name", e.target.value)}
        placeholder="Ingredient"
        className="px-2 py-1 rounded text-sm"
        style={{ border: `1px solid ${COLORS.border}`, fontFamily: "Inter", background: COLORS.surface }}
      />
      <input
        value={ing.amount}
        onChange={(e) => updateIngredient(dishId, ing.id, "amount", e.target.value)}
        placeholder="e.g. 500g"
        className="px-2 py-1 rounded text-sm"
        style={{ border: `1px solid ${COLORS.border}`, fontFamily: "Inter", background: COLORS.surface }}
      />
      <input
        type="number"
        value={ing.cost}
        onChange={(e) => updateIngredient(dishId, ing.id, "cost", e.target.value)}
        placeholder="Rs"
        className="px-2 py-1 rounded text-sm"
        style={{ border: `1px solid ${COLORS.border}`, fontFamily: "IBM Plex Mono", background: COLORS.surface }}
      />
      <button onClick={() => deleteIngredient(dishId, ing.id)} style={{ color: COLORS.rust, fontSize: 15, fontWeight: 700 }}>
        ×
      </button>
    </div>
  );
}

function MenuCosting({
  dishes,
  updateDish,
  deleteDish,
  addDish,
  newDishName,
  setNewDishName,
  newDishCat,
  setNewDishCat,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  updateVariant,
  addVariant,
  deleteVariant,
}) {
  const [expanded, setExpanded] = useState(new Set());
  const toggle = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div>
      <SectionHeader eyebrow="Menu & Costing" title="Ingredients once, priced by portion" />

      <div className="flex gap-2 mb-6 items-center">
        <input
          value={newDishName}
          onChange={(e) => setNewDishName(e.target.value)}
          placeholder="New dish name"
          className="px-3 py-2 rounded-lg text-sm"
          style={{ border: `1px solid ${COLORS.border}`, flex: 1, fontFamily: "Inter" }}
        />
        <select value={newDishCat} onChange={(e) => setNewDishCat(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={{ border: `1px solid ${COLORS.border}`, fontFamily: "Inter" }}>
          {CATEGORY_ORDER.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button onClick={addDish} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: COLORS.maroon, color: "#F3EAD3" }}>
          + Add dish
        </button>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const items = dishes.filter((d) => d.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="mb-7">
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.maroon, marginBottom: 8, letterSpacing: 0.3 }}>{cat.toUpperCase()}</div>
            <div className="flex flex-col gap-2">
              {items.map((d) => {
                const isOpen = expanded.has(d.id);
                const iCost = ingredientCost(d);
                const bCost = batchCost(d);
                const cpg = costPerGram(d);
                return (
                  <div key={d.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ background: COLORS.surface }}>
                      <button onClick={() => toggle(d.id)} className="flex items-center gap-2 text-left" style={{ fontSize: 14, color: COLORS.ink }}>
                        <span style={{ color: COLORS.gold, fontSize: 11, transform: isOpen ? "rotate(90deg)" : "none", display: "inline-block" }}>▶</span>
                        <span style={{ fontWeight: 600 }}>{d.name}</span>
                      </button>
                      <div className="flex items-center gap-2">
                        {(d.variants || []).map((v) => {
                          const s = variantStats(d, v);
                          const tone = marginTone(s.margin);
                          return (
                            <span key={v.id} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.has ? tone.bg : COLORS.bg, color: s.has ? tone.color : COLORS.inkSoft }} title={v.label}>
                              {v.label}: {s.has ? `${s.margin.toFixed(0)}%` : "—"}
                            </span>
                          );
                        })}
                        <button onClick={() => deleteDish(d.id)} title="Remove dish" style={{ color: COLORS.rust, fontSize: 16, fontWeight: 700, marginLeft: 6 }}>
                          ×
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ background: COLORS.bg, padding: "14px 16px" }}>
                        <div className="flex flex-col gap-4">
                          {/* Ingredients — entered once */}
                          <div className="rounded-lg" style={{ border: `1px solid ${COLORS.border}`, background: COLORS.surface, maxWidth: 560 }}>
                            <div className="px-3 py-2 text-xs font-semibold" style={{ background: COLORS.goldFaint, color: COLORS.maroonDark, borderBottom: `1px solid ${COLORS.border}` }}>
                              INGREDIENTS (entered once for this recipe)
                            </div>
                            <div className="px-3 pt-2">
                              {(d.ingredients || []).length === 0 && <div style={{ fontSize: 12, color: COLORS.inkSoft, padding: "6px 2px" }}>No ingredients yet.</div>}
                              <div className="rounded-md overflow-hidden" style={{ border: (d.ingredients || []).length ? `1px solid ${COLORS.border}` : "none" }}>
                                {(d.ingredients || []).map((ing) => (
                                  <IngredientRow key={ing.id} dishId={d.id} ing={ing} updateIngredient={updateIngredient} deleteIngredient={deleteIngredient} />
                                ))}
                              </div>
                              <button onClick={() => addIngredient(d.id)} className="my-2 px-2.5 py-1 rounded-md text-xs font-semibold" style={{ background: COLORS.goldFaint, color: COLORS.maroonDark, border: `1px solid ${COLORS.gold}` }}>
                                + Add ingredient
                              </button>
                            </div>
                            <div className="px-3 pb-3 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span style={{ fontSize: 12, color: COLORS.inkSoft }}>Ingredient cost (total)</span>
                                <span style={{ fontFamily: "IBM Plex Mono", fontSize: 13, color: COLORS.ink }}>Rs {fmt(iCost)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span style={{ fontSize: 12, color: COLORS.inkSoft }}>Making charges (total)</span>
                                <input
                                  type="number"
                                  value={d.makingCharge}
                                  onChange={(e) => updateDish(d.id, "makingCharge", e.target.value)}
                                  placeholder="0"
                                  className="px-2 py-1 rounded text-sm text-right"
                                  style={{ border: `1px solid ${COLORS.border}`, width: 90, fontFamily: "IBM Plex Mono" }}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span style={{ fontSize: 12, color: COLORS.inkSoft }}>This recipe makes (grams)</span>
                                <input
                                  type="number"
                                  value={d.batchWeight}
                                  onChange={(e) => updateDish(d.id, "batchWeight", e.target.value)}
                                  placeholder="1000"
                                  className="px-2 py-1 rounded text-sm text-right"
                                  style={{ border: `1.5px solid ${COLORS.gold}`, width: 90, fontFamily: "IBM Plex Mono" }}
                                />
                              </div>
                              <div className="flex items-center justify-between pt-1" style={{ borderTop: `1px dashed ${COLORS.border}` }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.ink }}>Cost per KG</span>
                                <span style={{ fontFamily: "IBM Plex Mono", fontSize: 13, fontWeight: 700, color: COLORS.ink }}>Rs {fmt(cpg * 1000)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Pricing options */}
                          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${COLORS.border}`, overflowX: "auto" }}>
                            <div style={{ minWidth: 680 }}>
                              <div
                                className="grid text-xs font-semibold px-3 py-2 items-center"
                                style={{ gridTemplateColumns: "1.1fr 1fr 0.9fr 1fr 1.3fr 26px", gap: 10, background: COLORS.goldFaint, color: COLORS.maroonDark }}
                              >
                                <div>Option</div>
                                <div>Portion (g)</div>
                                <div>Cost (Rs)</div>
                                <div style={{ color: COLORS.maroon }}>Your price (Rs)</div>
                                <div>Profit / Margin</div>
                                <div></div>
                              </div>
                              {(d.variants || []).map((v) => {
                                const s = variantStats(d, v);
                                const tone = marginTone(s.margin);
                                return (
                                  <div
                                    key={v.id}
                                    className="grid items-center px-3 py-2.5"
                                    style={{ gridTemplateColumns: "1.1fr 1fr 0.9fr 1fr 1.3fr 26px", gap: 10, borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface }}
                                  >
                                    <input
                                      value={v.label}
                                      onChange={(e) => updateVariant(d.id, v.id, "label", e.target.value)}
                                      className="px-2 py-1.5 rounded text-sm w-full"
                                      style={{ border: `1px solid ${COLORS.border}`, fontFamily: "Inter" }}
                                    />
                                    <input
                                      type="number"
                                      value={v.portionGrams}
                                      onChange={(e) => updateVariant(d.id, v.id, "portionGrams", e.target.value)}
                                      className="px-2 py-1.5 rounded text-sm w-full"
                                      style={{ border: `1px solid ${COLORS.border}`, fontFamily: "IBM Plex Mono" }}
                                    />
                                    <div style={{ fontFamily: "IBM Plex Mono", fontSize: 13, color: COLORS.inkSoft }}>Rs {fmt(s.cost)}</div>
                                    <input
                                      type="number"
                                      value={v.price}
                                      onChange={(e) => updateVariant(d.id, v.id, "price", e.target.value)}
                                      placeholder="e.g. 900"
                                      className="px-2 py-1.5 rounded text-sm w-full font-semibold"
                                      style={{ border: `2px solid ${COLORS.gold}`, fontFamily: "IBM Plex Mono", background: COLORS.goldFaint }}
                                    />
                                    <span
                                      className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap text-center"
                                      style={{ background: s.has ? tone.bg : COLORS.bg, color: s.has ? tone.color : COLORS.inkSoft }}
                                    >
                                      {s.has ? `Rs ${fmt(s.profit)} · ${s.margin.toFixed(0)}%` : "Enter a price"}
                                    </span>
                                    <button onClick={() => deleteVariant(d.id, v.id)} style={{ color: COLORS.rust, fontSize: 15, fontWeight: 700 }}>
                                      ×
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                            <div style={{ padding: 8, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}` }}>
                              <button onClick={() => addVariant(d.id)} className="px-2.5 py-1 rounded-md text-xs font-semibold" style={{ background: COLORS.maroon, color: "#F3EAD3" }}>
                                + Add pricing option
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Delivery({ zones, updateZone, deleteZone, addZone }) {
  return (
    <div>
      <SectionHeader eyebrow="Delivery" title="Rates by distance" />
      <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 16 }}>
        Charged per order based on delivery distance. Adjust the ranges and rates below.
      </div>
      <div className="rounded-xl overflow-hidden mb-4" style={{ border: `1px solid ${COLORS.border}` }}>
        <div className="grid text-xs font-semibold px-4 py-2" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 40px", background: COLORS.goldFaint, color: COLORS.maroonDark }}>
          <div>Zone label</div>
          <div>Min km</div>
          <div>Max km</div>
          <div>Rate (Rs)</div>
          <div></div>
        </div>
        {zones.map((z) => (
          <div key={z.id} className="grid items-center px-4 py-2" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 40px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
            <input value={z.label} onChange={(e) => updateZone(z.id, "label", e.target.value)} className="px-2 py-1 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, fontFamily: "Inter" }} />
            <input type="number" value={z.minKm} onChange={(e) => updateZone(z.id, "minKm", e.target.value)} className="px-2 py-1 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, width: 70, fontFamily: "IBM Plex Mono" }} />
            <input type="number" value={z.maxKm} onChange={(e) => updateZone(z.id, "maxKm", e.target.value)} className="px-2 py-1 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, width: 70, fontFamily: "IBM Plex Mono" }} />
            <input type="number" value={z.rate} onChange={(e) => updateZone(z.id, "rate", e.target.value)} className="px-2 py-1 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, width: 80, fontFamily: "IBM Plex Mono" }} />
            <button onClick={() => deleteZone(z.id)} style={{ color: COLORS.rust, fontSize: 16, fontWeight: 700 }}>×</button>
          </div>
        ))}
      </div>
      <button onClick={addZone} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: COLORS.maroon, color: "#F3EAD3" }}>
        + Add zone
      </button>
    </div>
  );
}

function DailySales({ dishes, sales, addSale, deleteSale, expenses }) {
  const [date, setDate] = useState(todayStr());
  const [dishId, setDishId] = useState(dishes[0]?.id || "");
  const selectedDish = dishes.find((d) => d.id === dishId) || dishes[0];
  const [variantId, setVariantId] = useState(selectedDish?.variants?.[0]?.id || "");
  const [qty, setQty] = useState(1);

  const currentDish = dishes.find((d) => d.id === dishId);
  const variantOptions = currentDish?.variants || [];
  const currentVariant = variantOptions.find((v) => v.id === variantId) || variantOptions[0];

  const handleDishChange = (id) => {
    setDishId(id);
    const nd = dishes.find((d) => d.id === id);
    setVariantId(nd?.variants?.[0]?.id || "");
  };

  const handleAdd = () => {
    if (!currentDish || !currentVariant || !qty || Number(qty) <= 0) return;
    const s = variantStats(currentDish, currentVariant);
    addSale({
      date,
      dishName: currentDish.name,
      variantLabel: currentVariant.label,
      qty: Number(qty),
      unitPrice: Number(currentVariant.price) || 0,
      unitCost: s.cost || 0,
    });
    setQty(1);
  };

  // group sales by date, descending
  const byDate = {};
  sales.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  // group expenses by date too, so days with only expenses still show
  const expByDate = {};
  (expenses || []).forEach((e) => {
    if (!expByDate[e.date]) expByDate[e.date] = [];
    expByDate[e.date].push(e);
  });

  const sortedDates = Array.from(new Set([...Object.keys(byDate), ...Object.keys(expByDate)])).sort((a, b) => (a < b ? 1 : -1));

  const allTime = sales.reduce(
    (acc, s) => {
      acc.items += s.qty;
      acc.revenue += s.qty * s.unitPrice;
      acc.profit += s.qty * (s.unitPrice - s.unitCost);
      return acc;
    },
    { items: 0, revenue: 0, profit: 0 }
  );
  const todayTotal = (byDate[todayStr()] || []).reduce(
    (acc, s) => {
      acc.items += s.qty;
      acc.revenue += s.qty * s.unitPrice;
      acc.profit += s.qty * (s.unitPrice - s.unitCost);
      return acc;
    },
    { items: 0, revenue: 0, profit: 0 }
  );
  const todayExpenses = (expByDate[todayStr()] || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const totalExpenses = (expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netProfit = allTime.profit - totalExpenses;

  return (
    <div>
      <SectionHeader eyebrow="Daily Sales" title="Log what you sold" />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card label="Today's items sold" value={todayTotal.items} />
        <Card label="Today's revenue" value={`Rs ${fmt(todayTotal.revenue)}`} />
        <Card label="Today's expenses" value={`Rs ${fmt(todayExpenses)}`} tone={COLORS.rust} />
        <Card label="Today's net profit" value={`Rs ${fmt(todayTotal.profit - todayExpenses)}`} tone={todayTotal.profit - todayExpenses >= 0 ? COLORS.green : COLORS.rust} />
      </div>

      <div className="p-4 rounded-xl mb-8" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.maroon, marginBottom: 12 }}>Record a sale</div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>Date</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-2 py-1.5 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, fontFamily: "IBM Plex Mono" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>Dish</div>
            <select value={dishId} onChange={(e) => handleDishChange(e.target.value)} className="px-2 py-1.5 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, minWidth: 200 }}>
              {CATEGORY_ORDER.map((cat) => (
                <optgroup key={cat} label={cat}>
                  {dishes.filter((d) => d.category === cat).map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>Option</div>
            <select value={variantId} onChange={(e) => setVariantId(e.target.value)} className="px-2 py-1.5 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, minWidth: 130 }}>
              {variantOptions.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>Quantity</div>
            <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="px-2 py-1.5 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, width: 80, fontFamily: "IBM Plex Mono" }} />
          </div>
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: COLORS.maroon, color: "#F3EAD3" }}>
            + Add sale
          </button>
        </div>
        {currentVariant && (!currentVariant.price || Number(currentVariant.price) <= 0) && (
          <div style={{ fontSize: 12, color: COLORS.rust, marginTop: 8 }}>
            This option doesn't have a selling price set yet — set it in Menu & Costing first for accurate profit tracking.
          </div>
        )}
      </div>

      {sortedDates.length === 0 && <div style={{ fontSize: 13, color: COLORS.inkSoft }}>No sales logged yet. Add your first one above.</div>}

      {sortedDates.map((d) => {
        const entries = byDate[d] || [];
        const dayExpenses = expByDate[d] || [];
        const totals = entries.reduce(
          (acc, s) => {
            acc.items += s.qty;
            acc.revenue += s.qty * s.unitPrice;
            acc.profit += s.qty * (s.unitPrice - s.unitCost);
            return acc;
          },
          { items: 0, revenue: 0, profit: 0 }
        );
        const dayExpenseTotal = dayExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
        const dayNet = totals.profit - dayExpenseTotal;
        return (
          <div key={d} className="mb-6 rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center justify-between px-4 py-2" style={{ background: COLORS.goldFaint }}>
              <div style={{ fontFamily: "Cormorant Garamond", fontWeight: 700, fontSize: 18, color: COLORS.maroonDark }}>
                {new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: COLORS.maroonDark }}>
                {totals.items} items · Rs {fmt(totals.revenue)} revenue · Rs {fmt(totals.profit)} sales profit
              </div>
            </div>
            {entries.length > 0 && (
              <div>
                <div className="grid text-xs font-semibold px-4 py-2" style={{ gridTemplateColumns: "2fr 1fr 0.7fr 1fr 1fr 1fr 26px", background: COLORS.bg, color: COLORS.inkSoft }}>
                  <div>Dish</div>
                  <div>Option</div>
                  <div>Qty</div>
                  <div>Unit price</div>
                  <div>Revenue</div>
                  <div>Profit</div>
                  <div></div>
                </div>
                {entries.map((s) => (
                  <div key={s.id} className="grid items-center px-4 py-2" style={{ gridTemplateColumns: "2fr 1fr 0.7fr 1fr 1fr 1fr 26px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface, fontSize: 13 }}>
                    <div>{s.dishName}</div>
                    <div style={{ color: COLORS.inkSoft }}>{s.variantLabel}</div>
                    <div style={{ fontFamily: "IBM Plex Mono" }}>{s.qty}</div>
                    <div style={{ fontFamily: "IBM Plex Mono" }}>Rs {fmt(s.unitPrice)}</div>
                    <div style={{ fontFamily: "IBM Plex Mono" }}>Rs {fmt(s.qty * s.unitPrice)}</div>
                    <div style={{ fontFamily: "IBM Plex Mono", color: COLORS.green }}>Rs {fmt(s.qty * (s.unitPrice - s.unitCost))}</div>
                    <button onClick={() => deleteSale(s.id)} style={{ color: COLORS.rust, fontSize: 15, fontWeight: 700 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            {dayExpenses.length > 0 && (
              <div>
                <div className="grid text-xs font-semibold px-4 py-2" style={{ gridTemplateColumns: "1.3fr 1.6fr 1fr 26px", background: COLORS.rustBg, color: COLORS.rust }}>
                  <div>Expense category</div>
                  <div>Note</div>
                  <div>Amount</div>
                  <div></div>
                </div>
                {dayExpenses.map((e) => (
                  <div key={e.id} className="grid items-center px-4 py-2" style={{ gridTemplateColumns: "1.3fr 1.6fr 1fr 26px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface, fontSize: 13 }}>
                    <div>{e.category}</div>
                    <div style={{ color: COLORS.inkSoft }}>{e.note || "—"}</div>
                    <div style={{ fontFamily: "IBM Plex Mono", color: COLORS.rust }}>Rs {fmt(e.amount)}</div>
                    <div></div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-2" style={{ background: COLORS.goldFaint, borderTop: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.maroonDark }}>
                Day expenses: Rs {fmt(dayExpenseTotal)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: dayNet >= 0 ? COLORS.green : COLORS.rust }}>
                Net profit for the day: Rs {fmt(dayNet)}
              </span>
            </div>
          </div>
        );
      })}

      {sortedDates.length > 0 && (
        <div className="p-4 rounded-xl mb-4" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink }}>
            All-time: {allTime.items} items sold · Rs {fmt(allTime.revenue)} revenue · Rs {fmt(allTime.profit)} profit from sales
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Card label="Profit from sales" value={`Rs ${fmt(allTime.profit)}`} tone={COLORS.green} />
        <Card label="Total expenses" value={`Rs ${fmt(totalExpenses)}`} tone={COLORS.rust} />
        <Card label="Net profit" value={`Rs ${fmt(netProfit)}`} tone={netProfit >= 0 ? COLORS.green : COLORS.rust} sub="Sales profit minus expenses" />
      </div>
    </div>
  );
}

const EXPENSE_CATEGORIES = ["Ingredients (bulk)", "Gas & Fuel", "Packaging", "Staff & Labor", "Rent & Utilities", "Delivery / Transport", "Equipment", "Other"];

function Expenses({ expenses, addExpense, deleteExpense }) {
  const [date, setDate] = useState(todayStr());
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    if (!amount || Number(amount) <= 0) return;
    addExpense({ date, category, note: note.trim(), amount: Number(amount) });
    setNote("");
    setAmount("");
  };

  const byDate = {};
  expenses.forEach((e) => {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });
  const sortedDates = Object.keys(byDate).sort((a, b) => (a < b ? 1 : -1));

  const totalAll = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalToday = (byDate[todayStr()] || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const byCategory = EXPENSE_CATEGORIES.map((cat) => ({
    cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + (Number(e.amount) || 0), 0),
  })).filter((c) => c.total > 0);

  return (
    <div>
      <SectionHeader eyebrow="Expenses" title="Track your running costs" />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card label="Today's expenses" value={`Rs ${fmt(totalToday)}`} tone={COLORS.rust} />
        <Card label="All-time expenses" value={`Rs ${fmt(totalAll)}`} tone={COLORS.rust} />
      </div>

      <div className="p-4 rounded-xl mb-8" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.maroon, marginBottom: 12 }}>Record an expense</div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>Date</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-2 py-1.5 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, fontFamily: "IBM Plex Mono" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>Category</div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-2 py-1.5 rounded text-sm" style={{ border: `1px solid ${COLORS.border}`, minWidth: 170 }}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>Note (optional)</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. gas cylinder refill" className="px-2 py-1.5 rounded text-sm w-full" style={{ border: `1px solid ${COLORS.border}` }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 4 }}>Amount (Rs)</div>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="px-2 py-1.5 rounded text-sm" style={{ border: `2px solid ${COLORS.gold}`, width: 100, fontFamily: "IBM Plex Mono" }} />
          </div>
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: COLORS.maroon, color: "#F3EAD3" }}>
            + Add expense
          </button>
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="p-4 rounded-xl mb-8" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, marginBottom: 10 }}>By category</div>
          <div className="flex flex-col gap-2">
            {byCategory.map((c) => (
              <div key={c.cat} className="flex items-center justify-between">
                <span style={{ fontSize: 13, color: COLORS.inkSoft }}>{c.cat}</span>
                <span style={{ fontFamily: "IBM Plex Mono", fontSize: 13, color: COLORS.ink }}>Rs {fmt(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedDates.length === 0 && <div style={{ fontSize: 13, color: COLORS.inkSoft }}>No expenses logged yet. Add your first one above.</div>}

      {sortedDates.map((d) => {
        const entries = byDate[d];
        const dayTotal = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0);
        return (
          <div key={d} className="mb-6 rounded-xl overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center justify-between px-4 py-2" style={{ background: COLORS.goldFaint }}>
              <div style={{ fontFamily: "Cormorant Garamond", fontWeight: 700, fontSize: 18, color: COLORS.maroonDark }}>
                {new Date(d + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: COLORS.maroonDark }}>Rs {fmt(dayTotal)} spent</div>
            </div>
            <div>
              <div className="grid text-xs font-semibold px-4 py-2" style={{ gridTemplateColumns: "1.3fr 1.6fr 1fr 26px", background: COLORS.bg, color: COLORS.inkSoft }}>
                <div>Category</div>
                <div>Note</div>
                <div>Amount</div>
                <div></div>
              </div>
              {entries.map((e) => (
                <div key={e.id} className="grid items-center px-4 py-2" style={{ gridTemplateColumns: "1.3fr 1.6fr 1fr 26px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface, fontSize: 13 }}>
                  <div>{e.category}</div>
                  <div style={{ color: COLORS.inkSoft }}>{e.note || "—"}</div>
                  <div style={{ fontFamily: "IBM Plex Mono", color: COLORS.rust }}>Rs {fmt(e.amount)}</div>
                  <button onClick={() => deleteExpense(e.id)} style={{ color: COLORS.rust, fontSize: 15, fontWeight: 700 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
