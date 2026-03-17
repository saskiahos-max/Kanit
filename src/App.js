import { useState, useMemo, useEffect } from "react";

const f = {
  wrap: { fontFamily: "var(--font-sans)", paddingBottom: "2rem" },
  header: { padding: "1.25rem 1.5rem 0", borderBottom: "0.5px solid var(--color-border-tertiary)" },
  title: { fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 2px" },
  sub: { fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 1rem" },
  toolbar: { display: "flex", gap: 10, padding: "1rem 1.5rem 0.75rem", alignItems: "center", flexWrap: "wrap" },
  input: { height: 34, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "0 10px", fontSize: 13, background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none", flex: 1, minWidth: 140 },
  catBtn: a => ({ border: `0.5px solid ${a?"var(--color-border-primary)":"var(--color-border-tertiary)"}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", background: a?"var(--color-background-secondary)":"transparent", color: a?"var(--color-text-primary)":"var(--color-text-secondary)", fontWeight: a?500:400 }),
  addBtn: { border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", marginLeft: "auto", whiteSpace: "nowrap" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: (center) => ({ padding: "8px 1.5rem", textAlign: center?"center":"left", fontSize: 11, color: "var(--color-text-tertiary)", fontWeight: 500, letterSpacing: "0.04em", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", textTransform: "uppercase" }),
  td: (center) => ({ padding: "10px 1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-primary)", verticalAlign: "middle", textAlign: center?"center":"left" }),
  rowAction: { border: "none", background: "none", cursor: "pointer", color: "var(--color-text-tertiary)", fontSize: 12, padding: "4px 6px", borderRadius: 6 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modalBox: { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 12, padding: "1.5rem", width: 400, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto" },
  mTitle: { fontSize: 16, fontWeight: 500, margin: "0 0 1.25rem" },
  label: { display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 },
  mInput: { width: "100%", height: 36, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "0 10px", fontSize: 13, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", marginBottom: 12 },
  mSelect: { width: "100%", height: 36, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "0 10px", fontSize: 13, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", marginBottom: 12 },
  mTextarea: { width: "100%", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", marginBottom: 12, resize: "vertical", minHeight: 60, fontFamily: "var(--font-sans)" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  btnRow: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 },
  btn: p => ({ border: `0.5px solid ${p?"transparent":"var(--color-border-secondary)"}`, borderRadius: 8, padding: "7px 16px", fontSize: 13, cursor: "pointer", background: p?"var(--color-text-primary)":"transparent", color: p?"var(--color-background-primary)":"var(--color-text-primary)", fontWeight: p?500:400 }),
  delBtn: { border: "none", background: "none", color: "#A32D2D", fontSize: 12, cursor: "pointer", marginRight: "auto", padding: "7px 0" },
  summaryRow: { display: "flex", gap: 10, margin: "0 0 1rem", flexWrap: "wrap" },
  chip: (bg, tc) => ({ background: bg, borderRadius: 8, padding: "6px 14px", fontSize: 13, color: tc, fontWeight: 500 }),
  badge: (bg, tc) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: bg, color: tc }),
  tabBar: { display: "flex", gap: 0, borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 1.5rem", marginBottom: 0 },
  tab: a => ({ padding: "10px 16px", fontSize: 13, cursor: "pointer", background: "none", border: "none", borderBottom: a?"2px solid var(--color-text-primary)":"2px solid transparent", color: a?"var(--color-text-primary)":"var(--color-text-secondary)", fontWeight: a?500:400, marginBottom: -1 }),
  odaBtn: { display: "inline-flex", alignItems: "center", gap: 5, border: "0.5px solid #b3d9f7", borderRadius: 7, padding: "3px 9px", fontSize: 11, fontWeight: 500, cursor: "pointer", background: "#E6F1FB", color: "#185FA5", textDecoration: "none", whiteSpace: "nowrap" },
};

const STATUS = {
  OK:       { bg:"#eaf3de", text:"#3B6D11" },
  Low:      { bg:"#FAEEDA", text:"#854F0B" },
  Critical: { bg:"#FCEBEB", text:"#A32D2D" },
};

function invStatus(qty, min) {
  if (qty <= 0) return "Critical";
  if (qty <= min) return "Low";
  return "OK";
}

function odaSearchUrl(name) {
  return `https://oda.com/no/products/?search=${encodeURIComponent(name)}`;
}

const INV_CATS = ["All","Drinks","Beer","Snacks","Dairy","Other"];

const INV_DEFAULT = [
  { id:1,  name:"Coca Cola",                             category:"Drinks", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64771-coca-cola-coca-cola-original-taste-4-x-033l/" },
  { id:2,  name:"Coca Cola Zero",                        category:"Drinks", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64772-coca-cola-coca-cola-zero-sugar-4-x-033l/" },
  { id:3,  name:"Sprite",                                category:"Drinks", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64774-sprite-sprite-zero-sugar-4-x-033l/" },
  { id:4,  name:"Pepsi",                                 category:"Drinks", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/41014-pepsi-pepsi-max-brett-20-x-033l/" },
  { id:5,  name:"Solo",                                  category:"Drinks", qty:0, unit:"cans",    min:10, odaUrl:"" },
  { id:6,  name:"Frus Eple & Kiwi",                      category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/64850-farris-farris-frus-eple-kiwi-6x033l/" },
  { id:7,  name:"Frus Mandarin & Mango",                 category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/66542-farris-frus-mandarin-mango-6x033-l/" },
  { id:8,  name:"Fruktsmekke Rabarbra",                  category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/64170-safteriet-fruktsmekk-rabarbra-og-hylleblomstbrus/" },
  { id:9,  name:"Fruktsmekk Plomme & Ingefærbrus",       category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/64169-safteriet-fruktsmekk-plomme-og-ingefaerbrus/" },
  { id:10, name:"Tundra Ingefærøl",                      category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/64326-noisom-tundra-ingefaerol/" },
  { id:11, name:"Sparkling Limonade Eple & Hylleblomst", category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/65281-kolonihagen-sparkling-limonade-eple-hylleblomst/" },
  { id:12, name:"Sparkling Ingefær",                     category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/32810-kolonihagen-sparkling-ingefaer-okologisk/" },
  { id:13, name:"Sparkling Bringebær & Grapefrukt",      category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/61910-kolonihagen-sparkling-bringebaer-og-grapefruit/" },
  { id:14, name:"Sparkling Appelsin & Sitron",           category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/36556-kolonihagen-sparkling-appelsin-sitron-okologisk/" },
  { id:15, name:"Loka Jordbær & Granateple",             category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/66785-loka-loka-jordbaer-granateple-20-x-033l/" },
  { id:16, name:"Loka Sitron",                           category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/65335-loka-loka-sitron-20-x-033l/" },
  { id:17, name:"Mozell Light",                          category:"Drinks", qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64834-ringnes-mozell-light-10-x-033l/" },
  { id:18, name:"Rubicon Sparkling Mango",               category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/63231-rubicon-sparkling-mango/" },
  { id:19, name:"Villbrygg Flyt",                        category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/59787-villbrygg-villbrygg-flyt/" },
  { id:20, name:"Villbrygg Glimt",                       category:"Drinks", qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/59788-villbrygg-villbrygg-glimt/" },
  { id:21, name:"Carlsberg Pilsener",                    category:"Beer",   qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/12550-carlsberg-pilsner-boks-10x033l/" },
  { id:22, name:"Aass Pilsener",                         category:"Beer",   qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64684-aass-bryggeri-aass-pilsner-fridgepack-10-x-033l/" },
  { id:23, name:"Hansa Pilsener",                        category:"Beer",   qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/31921-hansa-hansa-pilsner-fridgepack-10-x-033l/" },
  { id:24, name:"Heineken",                              category:"Beer",   qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/22108-hansa-heineken-fridgepack-10-x-033l/" },
  { id:25, name:"Tuborg Grøn",                           category:"Beer",   qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/19984-tuborg-gron-12-x-033l/" },
  { id:26, name:"Frydenlund Fatøl",                      category:"Beer",   qty:0, unit:"cans",    min:10, odaUrl:"https://oda.com/no/products/64685-aass-bryggeri-aass-fatol-fridgepack-10-x-033l/" },
  { id:27, name:"Ringnes Lite Glutenfri",                category:"Beer",   qty:0, unit:"cans",    min:6,  odaUrl:"https://oda.com/no/products/8026-ringnes-lite-glutenfri-6-x-05l/" },
  { id:28, name:"Kronenbourg 1664 Blanc",                category:"Beer",   qty:0, unit:"bottles", min:6,  odaUrl:"https://oda.com/no/products/22495-kronenbourg-kronenbourg-1664-blanc-6x033l/" },
];

const VENDOR_DEFAULT = [
  { id:1, name:"Nordic Supplies AS", category:"Supplies", contact:"Lars Eriksen", phone:"+47 22 11 22 33", email:"lars@nordicsupplies.no", notes:"Weekly delivery Tuesdays. Min order NOK 500." },
  { id:2, name:"Oslo Renhold", category:"Cleaning", contact:"Mette Andersen", phone:"+47 91 23 45 67", email:"mette@oslorenhold.no", notes:"Cleans Mon/Wed/Fri mornings." },
  { id:3, name:"TechFix Norge", category:"IT", contact:"Bjørn Haugen", phone:"+47 90 12 34 56", email:"support@techfixnorge.no", notes:"On-call IT support. SLA 4 hours." },
];

function useLocalStorage(key, defaultValue) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

function OdaLink({ item, label = "Oda ↗" }) {
  const url = item.odaUrl || odaSearchUrl(item.name);
  return <a href={url} target="_blank" rel="noreferrer" style={f.odaBtn}>{label}</a>;
}

function ReorderView({ items }) {
  const needs = items.filter(i => invStatus(i.qty, i.min) !== "OK");
  if (!needs.length) return (
    <div style={{ padding: "2rem 1.5rem", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 13 }}>
      All items are at or above minimum levels — nothing to reorder right now.
    </div>
  );
  return (
    <div style={{ padding: "1rem 1.5rem" }}>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 1rem" }}>
        {needs.length} item{needs.length > 1 ? "s" : ""} need restocking.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {needs.map(item => {
          const st = invStatus(item.qty, item.min);
          return (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, background: "var(--color-background-primary)" }}>
              <span style={f.badge(STATUS[st].bg, STATUS[st].text)}>{st}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{item.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{item.qty} {item.unit} remaining · min {item.min}</p>
              </div>
              <OdaLink item={item} label={item.odaUrl ? "Open on Oda ↗" : "Search on Oda ↗"} />
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
        Tip: Save the exact Oda product URL on each item (via Edit) to skip searching next time.
      </div>
    </div>
  );
}

function InventoryTab() {
  const [items, setItems] = useLocalStorage("kanit_items", INV_DEFAULT);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [adjDelta, setAdjDelta] = useState("");
  const [nextId, setNextId] = useLocalStorage("kanit_next_id", 29);

  const filtered = useMemo(() => items.filter(i =>
    (filter === "All" || i.category === filter) && i.name.toLowerCase().includes(search.toLowerCase())
  ), [items, filter, search]);

  const critical = items.filter(i => invStatus(i.qty, i.min) === "Critical").length;
  const low = items.filter(i => invStatus(i.qty, i.min) === "Low").length;
  const reorderCount = critical + low;

  const openAdd = () => { setForm({ name: "", category: "Drinks", qty: "", unit: "", min: "", odaUrl: "" }); setModal({ mode: "add" }); };
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

  return (
    <>
      <div style={f.header}>
        <p style={f.title}>Kanit</p>
        <p style={f.sub}>Drinks, snacks &amp; supplies</p>
        <div style={f.summaryRow}>
          <div style={f.chip("#EAF3DE", "#3B6D11")}>{items.filter(i => invStatus(i.qty, i.min) === "OK").length} items OK</div>
          {low > 0 && <div style={f.chip("#FAEEDA", "#854F0B")}>{low} low</div>}
          {critical > 0 && <div style={f.chip("#FCEBEB", "#A32D2D")}>{critical} critical</div>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        {[["all", "All items"], ["reorder", reorderCount > 0 ? `Reorder list (${reorderCount})` : "Reorder list"]].map(([k, label]) => (
          <button key={k} style={f.tab(view === k)} onClick={() => setView(k)}>{label}</button>
        ))}
      </div>

      {view === "reorder" ? <ReorderView items={items} /> : (<>
        <div style={f.toolbar}>
          <input style={f.input} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          {INV_CATS.map(c => <button key={c} style={f.catBtn(filter === c)} onClick={() => setFilter(c)}>{c}</button>)}
          <button style={f.addBtn} onClick={openAdd}>+ Add item</button>
        </div>
        <table style={f.table}>
          <thead><tr>
            <th style={f.th()}>Item</th>
            <th style={f.th()}>Category</th>
            <th style={f.th(true)}>Qty</th>
            <th style={f.th(true)}>Min</th>
            <th style={f.th(true)}>Status</th>
            <th style={f.th()}></th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} style={{ ...f.td(true), padding: "2rem", color: "var(--color-text-tertiary)" }}>No items found</td></tr>}
            {filtered.map(item => {
              const st = invStatus(item.qty, item.min);
              return (
                <tr key={item.id} onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ ...f.td(), fontWeight: 500 }}>{item.name}</td>
                  <td style={{ ...f.td(), color: "var(--color-text-secondary)" }}>{item.category}</td>
                  <td style={f.td(true)}>{item.qty} <span style={{ color: "var(--color-text-tertiary)", fontSize: 12 }}>{item.unit}</span></td>
                  <td style={{ ...f.td(true), color: "var(--color-text-tertiary)" }}>{item.min}</td>
                  <td style={f.td(true)}><span style={f.badge(STATUS[st].bg, STATUS[st].text)}>{st}</span></td>
                  <td style={{ ...f.td(), textAlign: "right" }}>
                    {st !== "OK" && <OdaLink item={item} />}
                    <button style={{ ...f.rowAction, marginLeft: 4 }} onClick={() => openAdj(item)}>±</button>
                    <button style={f.rowAction} onClick={() => openEdit(item)}>✎</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>)}

      {modal && (
        <div style={f.overlay} onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div style={f.modalBox}>
            {(modal.mode === "add" || modal.mode === "edit") && <>
              <p style={f.mTitle}>{modal.mode === "add" ? "Add item" : "Edit item"}</p>
              <label style={f.label}>Item name</label>
              <input style={f.mInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Sparkling Water" />
              <label style={f.label}>Category</label>
              <select style={f.mSelect} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {INV_CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
              <div style={f.row2}>
                <div><label style={f.label}>Quantity</label><input style={{ ...f.mInput, marginBottom: 0 }} type="number" min="0" value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} placeholder="0" /></div>
                <div><label style={f.label}>Unit</label><input style={{ ...f.mInput, marginBottom: 0 }} value={form.unit || ""} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} placeholder="cans, bags…" /></div>
              </div>
              <div style={{ height: 12 }} />
              <label style={f.label}>Reorder threshold</label>
              <input style={f.mInput} type="number" min="0" value={form.min} onChange={e => setForm(p => ({ ...p, min: e.target.value }))} placeholder="e.g. 10" />
              <label style={f.label}>Oda product URL <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(optional)</span></label>
              <input style={f.mInput} value={form.odaUrl || ""} onChange={e => setForm(p => ({ ...p, odaUrl: e.target.value }))} placeholder="https://oda.com/no/products/…" />
              {form.odaUrl && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "-8px 0 12px" }}><a href={form.odaUrl} target="_blank" rel="noreferrer" style={{ color: "#185FA5" }}>Test link ↗</a></p>}
              <div style={f.btnRow}>
                {modal.mode === "edit" && <button style={f.delBtn} onClick={() => del(modal.item.id)}>Delete</button>}
                <button style={f.btn(false)} onClick={close}>Cancel</button>
                <button style={f.btn(true)} onClick={save}>Save</button>
              </div>
            </>}
            {modal.mode === "adj" && <>
              <p style={f.mTitle}>Adjust — {modal.item.name}</p>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 1rem" }}>Current: <strong>{modal.item.qty} {modal.item.unit}</strong></p>
              <label style={f.label}>Change (use − for removal)</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button style={{ width: 34, height: 34, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-secondary)", cursor: "pointer", fontSize: 18 }} onClick={() => setAdjDelta(v => String((Number(v) || 0) - 1))}>−</button>
                <input style={{ ...f.mInput, margin: 0, flex: 1, textAlign: "center" }} type="number" value={adjDelta} onChange={e => setAdjDelta(e.target.value)} placeholder="0" />
                <button style={{ width: 34, height: 34, border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, background: "var(--color-background-secondary)", cursor: "pointer", fontSize: 18 }} onClick={() => setAdjDelta(v => String((Number(v) || 0) + 1))}>+</button>
              </div>
              {adjDelta !== "" && !isNaN(Number(adjDelta)) && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "-4px 0 12px" }}>New quantity: {Math.max(0, modal.item.qty + Number(adjDelta))} {modal.item.unit}</p>}
              <div style={f.btnRow}>
                <button style={f.btn(false)} onClick={close}>Cancel</button>
                <button style={f.btn(true)} onClick={applyAdj}>Apply</button>
              </div>
            </>}
          </div>
        </div>
      )}
    </>
  );
}

const VENDOR_CATS = ["All", "Supplies", "Maintenance", "Cleaning", "Catering", "IT", "Other"];
const EMPTY_V = { name: "", category: "Supplies", contact: "", phone: "", email: "", notes: "" };
const CAT_COLORS = { Supplies: ["#E6F1FB", "#185FA5"], Maintenance: ["#FAEEDA", "#854F0B"], Cleaning: ["#EAF3DE", "#3B6D11"], Catering: ["#FBEAF0", "#993556"], IT: ["#EEEDFE", "#3C3489"], Other: ["#F1EFE8", "#5F5E5A"] };

function VendorsTab() {
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
    <>
      <div style={f.header}>
        <p style={f.title}>Kanit</p>
        <p style={f.sub}>Suppliers, service providers &amp; contractors</p>
      </div>
      <div style={f.toolbar}>
        <input style={f.input} placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} />
        {VENDOR_CATS.map(c => <button key={c} style={f.catBtn(filter === c)} onClick={() => setFilter(c)}>{c}</button>)}
        <button style={f.addBtn} onClick={openAdd}>+ Add vendor</button>
      </div>
      <div style={{ padding: "0 1.5rem" }}>
        {filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", padding: "2rem 0", textAlign: "center" }}>No vendors found</p>}
        {filtered.map(v => {
          const [bg, tc] = CAT_COLORS[v.category] || CAT_COLORS.Other;
          const open = expanded === v.id;
          return (
            <div key={v.id} style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer", background: "var(--color-background-primary)" }}
                onClick={() => setExpanded(open ? null : v.id)}
                onMouseEnter={e => e.currentTarget.style.background = "var(--color-background-secondary)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--color-background-primary)"}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: tc }}>{v.name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{v.contact || "No contact set"}</p>
                </div>
                <span style={f.badge(bg, tc)}>{v.category}</span>
                <span style={{ color: "var(--color-text-tertiary)", fontSize: 13, marginLeft: 4 }}>{open ? "▲" : "▼"}</span>
              </div>
              {open && (
                <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", padding: "12px 16px", background: "var(--color-background-secondary)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: v.notes ? 10 : 0 }}>
                    {v.phone && <div><p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Phone</p><a href={`tel:${v.phone}`} style={{ fontSize: 13, color: "#185FA5", textDecoration: "none" }}>{v.phone}</a></div>}
                    {v.email && <div><p style={{ margin: "0 0 2px", fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Email</p><a href={`mailto:${v.email}`} style={{ fontSize: 13, color: "#185FA5", textDecoration: "none" }}>{v.email}</a></div>}
                  </div>
                  {v.notes && <div style={{ marginTop: 8 }}><p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Notes</p><p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{v.notes}</p></div>}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <button style={f.btn(false)} onClick={() => openEdit(v)}>Edit</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {modal && (
        <div style={f.overlay} onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div style={f.modalBox}>
            <p style={f.mTitle}>{modal.mode === "add" ? "Add vendor" : "Edit vendor"}</p>
            <label style={f.label}>Company / vendor name</label>
            <input style={f.mInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Oslo Renhold" />
            <label style={f.label}>Category</label>
            <select style={f.mSelect} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {VENDOR_CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
            <label style={f.label}>Contact person</label>
            <input style={f.mInput} value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder="Full name" />
            <div style={f.row2}>
              <div><label style={f.label}>Phone</label><input style={{ ...f.mInput, marginBottom: 0 }} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+47 …" /></div>
              <div><label style={f.label}>Email</label><input style={{ ...f.mInput, marginBottom: 0 }} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="name@company.no" /></div>
            </div>
            <div style={{ height: 12 }} />
            <label style={f.label}>Notes</label>
            <textarea style={f.mTextarea} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Delivery schedule, contract details, SLA…" />
            <div style={f.btnRow}>
              {modal.mode === "edit" && <button style={f.delBtn} onClick={() => del(modal.vendor.id)}>Delete</button>}
              <button style={f.btn(false)} onClick={close}>Cancel</button>
              <button style={f.btn(true)} onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("inventory");
  return (
    <div style={f.wrap}>
      <div style={f.tabBar}>
        {[["inventory", "Inventory"], ["vendors", "Vendors"]].map(([k, label]) => (
          <button key={k} style={f.tab(tab === k)} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      {tab === "inventory" ? <InventoryTab /> : <VendorsTab />}
    </div>
  );
}
