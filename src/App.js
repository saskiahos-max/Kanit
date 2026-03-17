import { useState, useMemo, useEffect } from "react";

// ── palette ────────────────────────────────────────────────────────────────
const C = {
  coral:   "#D85A30",
  coralL:  "#F5CEC2",
  amber:   "#EF9F27",
  amberL:  "#FAEEDA",
  mint:    "#5DCAA5",
  mintL:   "#D4F0E6",
  yellow:  "#FCDE5A",
  red:     "#E24B4A",
  redL:    "#FCEBEB",
  redT:    "#A32D2D",
  green:   "#3B6D11",
  greenL:  "#EAF3DE",
  navy:    "#1a1a2e",
};

// ── shared styles ──────────────────────────────────────────────────────────
const s = {
  page: { fontFamily: "'Poppins', sans-serif", minHeight: "100vh", background: "var(--color-background-tertiary)" },

  // Home
  homeWrap: { padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: 24 },
  logoRow: { display: "flex", alignItems: "center", gap: 14 },
  logoIcon: { width: 56, height: 56, borderRadius: 16, background: C.coral, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logoName: { fontSize: 32, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: "-0.5px" },
  logoSub: { fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 },

  alertCard: { background: C.redL, border: `2px solid ${C.red}`, borderRadius: 16, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  alertText: { fontSize: 15, fontWeight: 500, color: C.redT },
  alertSub: { fontSize: 12, color: C.redT, opacity: 0.8, marginTop: 2 },
  alertBtn: { background: C.red, color: "#fff", border: "none", borderRadius: 12, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },

  allGoodCard: { background: C.greenL, border: `2px solid ${C.mint}`, borderRadius: 16, padding: "1.25rem 1.5rem" },
  allGoodText: { fontSize: 15, fontWeight: 500, color: C.green },

  navGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  navCard: (bg) => ({ background: bg, borderRadius: 20, padding: "1.5rem 1.25rem", cursor: "pointer", border: "none", textAlign: "center", transition: "transform 0.1s", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }),
  navIcon: { fontSize: 28, marginBottom: 10 },
  navLabel: { fontSize: 17, fontWeight: 500, color: "#fff", display: "block" },
  navSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4, display: "block" },

  // Top bar
  topBar: { display: "flex", alignItems: "center", gap: 12, padding: "1rem 1.5rem", borderBottom: `2px solid var(--color-border-tertiary)`, background: "var(--color-background-primary)" },
  backBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.coral, padding: 0, lineHeight: 1 },
  topTitle: { fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" },

  // Tabs
  tabRow: { display: "flex", gap: 8, padding: "1rem 1.5rem 0" },
  tabBtn: (a, color) => ({ border: `2px solid ${a ? color : "var(--color-border-tertiary)"}`, borderRadius: 20, padding: "6px 18px", fontSize: 13, fontWeight: a ? 500 : 400, cursor: "pointer", background: a ? color : "transparent", color: a ? "#fff" : "var(--color-text-secondary)", transition: "all 0.15s" }),

  // Summary chips
  chipRow: { display: "flex", gap: 8, padding: "1rem 1.5rem 0", flexWrap: "wrap" },
  chip: (bg, tc) => ({ background: bg, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500, color: tc }),

  // Toolbar
  toolbar: { display: "flex", gap: 10, padding: "0.75rem 1.5rem", alignItems: "center" },
  searchInput: { height: 38, border: "2px solid var(--color-border-secondary)", borderRadius: 20, padding: "0 14px", fontSize: 13, background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none", flex: 1 },
  addBtn: { border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", background: C.coral, color: "#fff", whiteSpace: "nowrap" },

  // Cards
  cardList: { display: "flex", flexDirection: "column", gap: 10, padding: "0.5rem 1.5rem 2rem" },
  itemCard: (st) => ({ background: "var(--color-background-primary)", borderRadius: 16, border: `2px solid ${st==="Critical"?"#F09595":st==="Low"?"#FAC775":"var(--color-border-tertiary)"}`, overflow: "hidden" }),
  cardTop: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, padding: "12px 14px 8px" },
  cardMid: { display: "flex", alignItems: "center", gap: 8, padding: "0 14px 12px" },
  itemName: { fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 },
  itemQty: { fontSize: 12, color: "var(--color-text-secondary)", margin: 0, whiteSpace: "nowrap" },
  minCircle: { width: 26, height: 26, borderRadius: "50%", background: "#EAF3DE", color: "#3B6D11", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  minLabel: { fontSize: 10, color: "var(--color-text-tertiary)" },
  cardDivider: { height: 1, background: "var(--color-border-tertiary)", margin: "0 14px" },
  odaBar: (st) => ({ display: "block", width: "100%", border: "none", padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "center", background: st==="Critical"?"#FCEBEB":"#E6F1FB", color: st==="Critical"?"#A32D2D":"#185FA5", fontFamily: "'Poppins', sans-serif" }),
  iconBtn: { background: "var(--color-background-secondary)", border: "2px solid var(--color-border-tertiary)", borderRadius: 10, width: 30, height: 30, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" },
  badge: (bg, tc) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color: tc, whiteSpace: "nowrap" }),

  // Reorder view
  reorderList: { display: "flex", flexDirection: "column", gap: 10, padding: "1rem 1.5rem 2rem" },
  reorderCard: { background: "var(--color-background-primary)", borderRadius: 16, padding: "12px 14px", border: "2px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 10 },

  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" },
  modal: { background: "var(--color-background-primary)", borderRadius: 20, padding: "1.5rem", width: "100%", maxWidth: 400, maxHeight: "85vh", overflowY: "auto" },
  mTitle: { fontSize: 17, fontWeight: 500, margin: "0 0 1.25rem" },
  label: { display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 },
  mInput: { width: "100%", height: 40, border: "2px solid var(--color-border-secondary)", borderRadius: 12, padding: "0 12px", fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", marginBottom: 14 },
  mSelect: { width: "100%", height: 40, border: "2px solid var(--color-border-secondary)", borderRadius: 12, padding: "0 12px", fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", marginBottom: 14 },
  mTextarea: { width: "100%", border: "2px solid var(--color-border-secondary)", borderRadius: 12, padding: "10px 12px", fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", marginBottom: 14, resize: "vertical", minHeight: 72, fontFamily: "var(--font-sans)" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  btnRow: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 },
  btn: p => ({ border: `2px solid ${p ? "transparent" : "var(--color-border-secondary)"}`, borderRadius: 12, padding: "8px 18px", fontSize: 14, cursor: "pointer", background: p ? C.coral : "transparent", color: p ? "#fff" : "var(--color-text-primary)", fontWeight: p ? 500 : 400 }),
  delBtn: { border: "none", background: "none", color: C.red, fontSize: 13, cursor: "pointer", marginRight: "auto", padding: "8px 0" },
};

// ── data & helpers ─────────────────────────────────────────────────────────
function invStatus(qty, min) {
  if (qty <= 0) return "Critical";
  if (qty <= min) return "Low";
  return "OK";
}
const STATUS = {
  OK:       { bg: C.greenL, text: C.green },
  Low:      { bg: C.amberL, text: "#854F0B" },
  Critical: { bg: C.redL,   text: C.redT },
};

function odaSearchUrl(name) {
  return `https://oda.com/no/products/?search=${encodeURIComponent(name)}`;
}

function useLocalStorage(key, def) {
  const [val, setVal] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

const INV_DEFAULT = [
  { id:1,  name:"Coca Cola",                             category:"Soda", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64771-coca-cola-coca-cola-original-taste-4-x-033l/" },
  { id:2,  name:"Coca Cola Zero",                        category:"Soda", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64772-coca-cola-coca-cola-zero-sugar-4-x-033l/" },
  { id:3,  name:"Sprite",                                category:"Soda", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64774-sprite-sprite-zero-sugar-4-x-033l/" },
  { id:4,  name:"Pepsi",                                 category:"Soda", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/41014-pepsi-pepsi-max-brett-20-x-033l/" },
  { id:5,  name:"Solo",                                  category:"Soda", qty:0, unit:"cans",    min:10, odaUrl:"" },
  { id:6,  name:"Frus Eple & Kiwi",                      category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/64850-farris-farris-frus-eple-kiwi-6x033l/" },
  { id:7,  name:"Frus Mandarin & Mango",                 category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/66542-farris-frus-mandarin-mango-6x033-l/" },
  { id:8,  name:"Fruktsmekke Rabarbra",                  category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/64170-safteriet-fruktsmekk-rabarbra-og-hylleblomstbrus/" },
  { id:9,  name:"Fruktsmekk Plomme & Ingefærbrus",       category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/64169-safteriet-fruktsmekk-plomme-og-ingefaerbrus/" },
  { id:10, name:"Tundra Ingefærøl",                      category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/64326-noisom-tundra-ingefaerol/" },
  { id:11, name:"Sparkling Limonade Eple & Hylleblomst", category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/65281-kolonihagen-sparkling-limonade-eple-hylleblomst/" },
  { id:12, name:"Sparkling Ingefær",                     category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/32810-kolonihagen-sparkling-ingefaer-okologisk/" },
  { id:13, name:"Sparkling Bringebær & Grapefrukt",      category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/61910-kolonihagen-sparkling-bringebaer-og-grapefruit/" },
  { id:14, name:"Sparkling Appelsin & Sitron",           category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/36556-kolonihagen-sparkling-appelsin-sitron-okologisk/" },
  { id:15, name:"Loka Jordbær & Granateple",             category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/66785-loka-loka-jordbaer-granateple-20-x-033l/" },
  { id:16, name:"Loka Sitron",                           category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/65335-loka-loka-sitron-20-x-033l/" },
  { id:17, name:"Mozell Light",                          category:"Soda", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64834-ringnes-mozell-light-10-x-033l/" },
  { id:18, name:"Rubicon Sparkling Mango",               category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/63231-rubicon-sparkling-mango/" },
  { id:19, name:"Villbrygg Flyt",                        category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/59787-villbrygg-villbrygg-flyt/" },
  { id:20, name:"Villbrygg Glimt",                       category:"Soda", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/59788-villbrygg-villbrygg-glimt/" },
  { id:21, name:"Carlsberg Pilsener",                    category:"Beer", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/12550-carlsberg-pilsner-boks-10x033l/" },
  { id:22, name:"Aass Pilsener",                         category:"Beer", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64684-aass-bryggeri-aass-pilsner-fridgepack-10-x-033l/" },
  { id:23, name:"Hansa Pilsener",                        category:"Beer", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/31921-hansa-hansa-pilsner-fridgepack-10-x-033l/" },
  { id:24, name:"Heineken",                              category:"Beer", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/22108-hansa-heineken-fridgepack-10-x-033l/" },
  { id:25, name:"Tuborg Grøn",                           category:"Beer", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/19984-tuborg-gron-12-x-033l/" },
  { id:26, name:"Frydenlund Fatøl",                      category:"Beer", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64685-aass-bryggeri-aass-fatol-fridgepack-10-x-033l/" },
  { id:27, name:"Ringnes Lite Glutenfri",                category:"Beer", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/8026-ringnes-lite-glutenfri-6-x-05l/" },
  { id:28, name:"Kronenbourg 1664 Blanc",                category:"Beer", qty:0, unit:"bottles", min:6,  odaUrl:"https://oda.com/no/products/22495-kronenbourg-kronenbourg-1664-blanc-6x033l/" },
];

const VENDOR_DEFAULT = [
  { id:1, name:"Nordic Supplies AS", category:"Supplies", contact:"Lars Eriksen", phone:"+47 22 11 22 33", email:"lars@nordicsupplies.no", notes:"Weekly delivery Tuesdays. Min order NOK 500." },
  { id:2, name:"Oslo Renhold", category:"Cleaning", contact:"Mette Andersen", phone:"+47 91 23 45 67", email:"mette@oslorenhold.no", notes:"Cleans Mon/Wed/Fri mornings." },
  { id:3, name:"TechFix Norge", category:"IT", contact:"Bjørn Haugen", phone:"+47 90 12 34 56", email:"support@techfixnorge.no", notes:"On-call IT support. SLA 4 hours." },
];

// ── Logo SVG ───────────────────────────────────────────────────────────────
function LogoIcon({ size = 56 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: C.coral, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 36 36">
        <rect x="2" y="6"  width="22" height="6" rx="3" fill="#fff" opacity="0.95"/>
        <rect x="2" y="15" width="17" height="6" rx="3" fill="#fff" opacity="0.75"/>
        <rect x="2" y="24" width="19" height="6" rx="3" fill="#fff" opacity="0.55"/>
        <circle cx="28" cy="9"  r="3.5" fill={C.yellow}/>
        <circle cx="23" cy="18" r="3.5" fill={C.mint}/>
        <circle cx="25" cy="27" r="3.5" fill={C.yellow} opacity="0.7"/>
      </svg>
    </div>
  );
}

// ── OdaLink ────────────────────────────────────────────────────────────────
function OdaLink({ item }) {
  const url = item.odaUrl || odaSearchUrl(item.name);
  return <a href={url} target="_blank" rel="noreferrer" style={s.odaBtn}>Oda ↗</a>;
}

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>{children}</div>
    </div>
  );
}

// ── Inventory ──────────────────────────────────────────────────────────────
function InventoryPage({ onBack }) {
  const [items, setItems] = useLocalStorage("kanit_items", INV_DEFAULT);
  const [tab, setTab] = useState("Soda"); // "Soda" | "Beer" | "Reorder"
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [adjDelta, setAdjDelta] = useState("");
  const [nextId, setNextId] = useLocalStorage("kanit_next_id", 29);

  const reorderItems = items.filter(i => invStatus(i.qty, i.min) !== "OK");
  const reorderCount = reorderItems.length;

  const filtered = useMemo(() => items.filter(i =>
    i.category === tab && i.name.toLowerCase().includes(search.toLowerCase())
  ), [items, tab, search]);

  const openAdd = () => { setForm({ name: "", category: tab === "Reorder" ? "Soda" : tab, qty: "", unit: "cans", min: "", odaUrl: "" }); setModal({ mode: "add" }); };
  const openEdit = item => { setForm({ ...item }); setModal({ mode: "edit", item }); };
  const openAdj = item => { setAdjDelta(""); setModal({ mode: "adj", item }); };
  const close = () => setModal(null);

  const save = () => {
    if (!form.name || form.qty === "" || !form.unit || form.min === "") return;
    const entry = { ...form, qty: Number(form.qty), min: Number(form.min), odaUrl: form.odaUrl || "" };
    if (modal.mode === "add") { setItems(p => [...p, { id: nextId, ...entry }]); setNextId(n => n + 1); }
    else setItems(p => p.map(i => i.id === modal.item.id ? { ...i, ...entry } : i));
    close();
  };
  const applyAdj = () => {
    const d = Number(adjDelta); if (isNaN(d) || adjDelta === "") return;
    setItems(p => p.map(i => i.id === modal.item.id ? { ...i, qty: Math.max(0, i.qty + d) } : i)); close();
  };
  const del = id => { setItems(p => p.filter(i => i.id !== id)); close(); };

  const displayItems = tab === "Reorder" ? reorderItems : filtered;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <span style={s.topTitle}>Inventory</span>
      </div>

      <div style={s.tabRow}>
        {[["Soda", C.coral], ["Beer", C.amber], ["Reorder", C.red]].map(([k, color]) => (
          <button key={k} style={s.tabBtn(tab === k, color)} onClick={() => setTab(k)}>
            {k === "Reorder" ? `Reorder${reorderCount > 0 ? ` (${reorderCount})` : ""}` : k}
          </button>
        ))}
      </div>

      {tab !== "Reorder" && (
        <div style={s.toolbar}>
          <input style={s.searchInput} placeholder={`Search ${tab.toLowerCase()}…`} value={search} onChange={e => setSearch(e.target.value)} />
          <button style={s.addBtn} onClick={openAdd}>+ Add</button>
        </div>
      )}

      {tab === "Reorder" && reorderCount === 0 && (
        <div style={{ padding: "2rem 1.5rem", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 14 }}>
          All stocked up — nothing to reorder!
        </div>
      )}

      {tab === "Reorder" && reorderCount > 0 && (
        <p style={{ padding: "1rem 1.5rem 0", fontSize: 13, color: "var(--color-text-secondary)" }}>
          {reorderCount} item{reorderCount > 1 ? "s" : ""} need restocking.
        </p>
      )}

      <div style={s.cardList}>
        {displayItems.length === 0 && tab !== "Reorder" && (
          <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 14, padding: "2rem 0" }}>No items found</p>
        )}
        {displayItems.map(item => {
          const st = invStatus(item.qty, item.min);
          return (
            <div key={item.id} style={s.itemCard}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={s.itemName}>{item.name}</p>
                <p style={s.itemMeta}>{item.qty} {item.unit} · min {item.min}</p>
              </div>
              <div style={s.itemActions}>
                <span style={s.badge(STATUS[st].bg, STATUS[st].text)}>{st}</span>
                {st !== "OK" && <OdaLink item={item} />}
                <button style={s.iconBtn} onClick={() => openAdj(item)}>±</button>
                <button style={s.iconBtn} onClick={() => openEdit(item)}>✎</button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal onClose={close}>
          {(modal.mode === "add" || modal.mode === "edit") && <>
            <p style={s.mTitle}>{modal.mode === "add" ? "Add item" : "Edit item"}</p>
            <label style={s.label}>Item name</label>
            <input style={s.mInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Coca Cola" />
            <label style={s.label}>Category</label>
            <select style={s.mSelect} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {["Soda", "Beer", "Snacks", "Dairy", "Other"].map(c => <option key={c}>{c}</option>)}
            </select>
            <div style={s.row2}>
              <div><label style={s.label}>Quantity</label><input style={{ ...s.mInput, marginBottom: 0 }} type="number" min="0" value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} placeholder="0" /></div>
              <div><label style={s.label}>Unit</label><input style={{ ...s.mInput, marginBottom: 0 }} value={form.unit || ""} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="cans" /></div>
            </div>
            <div style={{ height: 14 }} />
            <label style={s.label}>Reorder threshold</label>
            <input style={s.mInput} type="number" min="0" value={form.min} onChange={e => setForm(p => ({ ...p, min: e.target.value }))} placeholder="e.g. 10" />
            <label style={s.label}>Oda URL <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(optional)</span></label>
            <input style={s.mInput} value={form.odaUrl || ""} onChange={e => setForm(p => ({ ...p, odaUrl: e.target.value }))} placeholder="https://oda.com/no/products/…" />
            {form.odaUrl && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "-10px 0 14px" }}><a href={form.odaUrl} target="_blank" rel="noreferrer" style={{ color: "#185FA5" }}>Test link ↗</a></p>}
            <div style={s.btnRow}>
              {modal.mode === "edit" && <button style={s.delBtn} onClick={() => del(modal.item.id)}>Delete</button>}
              <button style={s.btn(false)} onClick={close}>Cancel</button>
              <button style={s.btn(true)} onClick={save}>Save</button>
            </div>
          </>}
          {modal.mode === "adj" && <>
            <p style={s.mTitle}>Adjust — {modal.item.name}</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 1rem" }}>Current: <strong>{modal.item.qty} {modal.item.unit}</strong></p>
            <label style={s.label}>Change amount</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button style={{ ...s.iconBtn, width: 40, height: 40, fontSize: 18, borderRadius: 12 }} onClick={() => setAdjDelta(v => String((Number(v) || 0) - 1))}>−</button>
              <input style={{ ...s.mInput, margin: 0, flex: 1, textAlign: "center" }} type="number" value={adjDelta} onChange={e => setAdjDelta(e.target.value)} placeholder="0" />
              <button style={{ ...s.iconBtn, width: 40, height: 40, fontSize: 18, borderRadius: 12 }} onClick={() => setAdjDelta(v => String((Number(v) || 0) + 1))}>+</button>
            </div>
            {adjDelta !== "" && !isNaN(Number(adjDelta)) && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "-4px 0 12px" }}>New quantity: {Math.max(0, modal.item.qty + Number(adjDelta))} {modal.item.unit}</p>}
            <div style={s.btnRow}>
              <button style={s.btn(false)} onClick={close}>Cancel</button>
              <button style={s.btn(true)} onClick={applyAdj}>Apply</button>
            </div>
          </>}
        </Modal>
      )}
    </div>
  );
}

// ── Vendors ────────────────────────────────────────────────────────────────
const VENDOR_CATS = ["All", "Supplies", "Maintenance", "Cleaning", "Catering", "IT", "Other"];
const EMPTY_V = { name: "", category: "Supplies", contact: "", phone: "", email: "", notes: "" };
const VCAT_COLORS = { Supplies: ["#E6F1FB", "#185FA5"], Maintenance: [C.amberL, "#854F0B"], Cleaning: [C.greenL, C.green], Catering: ["#FBEAF0", "#993556"], IT: ["#EEEDFE", "#3C3489"], Other: ["#F1EFE8", "#5F5E5A"] };

function VendorsPage({ onBack }) {
  const [vendors, setVendors] = useLocalStorage("kanit_vendors", VENDOR_DEFAULT);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_V);
  const [nextId, setNextId] = useLocalStorage("kanit_vendor_next_id", 4);
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => vendors.filter(v =>
    (filter === "All" || v.category === filter) &&
    (v.name + v.contact + v.email).toLowerCase().includes(search.toLowerCase())
  ), [vendors, filter, search]);

  const openAdd = () => { setForm(EMPTY_V); setModal({ mode: "add" }); };
  const openEdit = v => { setForm({ ...v }); setModal({ mode: "edit", vendor: v }); };
  const close = () => setModal(null);
  const save = () => {
    if (!form.name.trim()) return;
    if (modal.mode === "add") { setVendors(p => [...p, { id: nextId, ...form }]); setNextId(n => n + 1); }
    else setVendors(p => p.map(v => v.id === modal.vendor.id ? { ...v, ...form } : v));
    close();
  };
  const del = id => { setVendors(p => p.filter(v => v.id !== id)); close(); };

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <span style={s.topTitle}>Vendors</span>
      </div>
      <div style={s.toolbar}>
        <input style={s.searchInput} placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} />
        <button style={s.addBtn} onClick={openAdd}>+ Add</button>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "0 1.5rem 0.75rem", flexWrap: "wrap" }}>
        {VENDOR_CATS.map(c => <button key={c} style={{ ...s.tabBtn(filter === c, C.coral), padding: "4px 12px", fontSize: 12 }} onClick={() => setFilter(c)}>{c}</button>)}
      </div>
      <div style={s.cardList}>
        {filtered.length === 0 && <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 14, padding: "2rem 0" }}>No vendors found</p>}
        {filtered.map(v => {
          const [bg, tc] = VCAT_COLORS[v.category] || VCAT_COLORS.Other;
          const open = expanded === v.id;
          return (
            <div key={v.id} style={{ background: "var(--color-background-primary)", borderRadius: 16, border: "2px solid var(--color-border-tertiary)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}
                onClick={() => setExpanded(open ? null : v.id)}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: tc }}>{v.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{v.contact || "No contact set"}</p>
                </div>
                <span style={s.badge(bg, tc)}>{v.category}</span>
                <span style={{ color: "var(--color-text-tertiary)", fontSize: 12, marginLeft: 4 }}>{open ? "▲" : "▼"}</span>
              </div>
              {open && (
                <div style={{ borderTop: "2px solid var(--color-border-tertiary)", padding: "12px 16px", background: "var(--color-background-secondary)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                    {v.phone && <div><p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Phone</p><a href={`tel:${v.phone}`} style={{ fontSize: 13, color: "#185FA5", textDecoration: "none" }}>{v.phone}</a></div>}
                    {v.email && <div><p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Email</p><a href={`mailto:${v.email}`} style={{ fontSize: 13, color: "#185FA5", textDecoration: "none" }}>{v.email}</a></div>}
                  </div>
                  {v.notes && <div style={{ marginTop: 10 }}><p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Notes</p><p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{v.notes}</p></div>}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <button style={s.btn(false)} onClick={() => openEdit(v)}>Edit</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal onClose={close}>
          <p style={s.mTitle}>{modal.mode === "add" ? "Add vendor" : "Edit vendor"}</p>
          <label style={s.label}>Company name</label>
          <input style={s.mInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Oslo Renhold" />
          <label style={s.label}>Category</label>
          <select style={s.mSelect} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            {VENDOR_CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
          </select>
          <label style={s.label}>Contact person</label>
          <input style={s.mInput} value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder="Full name" />
          <div style={s.row2}>
            <div><label style={s.label}>Phone</label><input style={{ ...s.mInput, marginBottom: 0 }} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+47 …" /></div>
            <div><label style={s.label}>Email</label><input style={{ ...s.mInput, marginBottom: 0 }} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="name@company.no" /></div>
          </div>
          <div style={{ height: 14 }} />
          <label style={s.label}>Notes</label>
          <textarea style={s.mTextarea} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Delivery schedule, SLA…" />
          <div style={s.btnRow}>
            {modal.mode === "edit" && <button style={s.delBtn} onClick={() => del(modal.vendor.id)}>Delete</button>}
            <button style={s.btn(false)} onClick={close}>Cancel</button>
            <button style={s.btn(true)} onClick={save}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────────────────
function HomePage({ onNav, items }) {
  const reorderCount = items.filter(i => invStatus(i.qty, i.min) !== "OK").length;
  const criticalCount = items.filter(i => invStatus(i.qty, i.min) === "Critical").length;
  const allGood = reorderCount === 0;

  return (
    <div style={s.page}>
      <div style={s.homeWrap}>
        <div style={s.logoRow}>
          <LogoIcon size={56} />
          <div>
            <div style={s.logoName}>Kanit</div>
        
          </div>
        </div>

        {allGood ? (
          <div style={s.allGoodCard}>
            <p style={s.allGoodText}>All stocked up — nothing to reorder!</p>
          </div>
        ) : (
          <div style={s.alertCard}>
            <div>
              <p style={s.alertText}>{criticalCount > 0 ? `${criticalCount} item${criticalCount > 1 ? "s" : ""} out of stock` : `${reorderCount} item${reorderCount > 1 ? "s" : ""} running low`}</p>
              <p style={s.alertSub}>{reorderCount} total need restocking</p>
            </div>
            <button style={s.alertBtn} onClick={() => onNav("reorder")}>Reorder →</button>
          </div>
        )}

        <div style={s.navGrid}>
          <button style={s.navCard(C.coral)} onClick={() => onNav("inventory")}>
            <div style={s.navIcon}>🥤</div>
            <span style={s.navLabel}>Inventory</span>
            <span style={s.navSub}>Soda &amp; beer</span>
          </button>
          <button style={s.navCard(C.mint)} onClick={() => onNav("vendors")}>
            <div style={s.navIcon}>📋</div>
            <span style={s.navLabel}>Vendors</span>
            <span style={s.navSub}>Suppliers &amp; contacts</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App shell ──────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [items] = useLocalStorage("kanit_items", INV_DEFAULT);

  return (
    <>
      {page === "home"      && <HomePage onNav={p => setPage(p === "reorder" ? "inventory-reorder" : p)} items={items} />}
      {(page === "inventory" || page === "inventory-reorder") && <InventoryPage onBack={() => setPage("home")} startTab={page === "inventory-reorder" ? "Reorder" : "Soda"} />}
      {page === "vendors"   && <VendorsPage onBack={() => setPage("home")} />}
    </>
  );
}
