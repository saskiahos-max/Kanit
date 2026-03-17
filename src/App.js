import { useState, useMemo, useEffect } from "react";

const CORAL = "#D85A30";
const AMBER = "#EF9F27";
const MINT  = "#5DCAA5";
const RED   = "#E24B4A";

function useLocalStorage(key, def) {
  const [val, setVal] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      if (!v) return def;
      const parsed = JSON.parse(v);
      if (key === "kanit_items" && Array.isArray(parsed)) {
        return parsed.map(i => ({ ...i, category: i.category === "Drinks" ? "Soda" : i.category }));
      }
      return parsed;
    } catch { return def; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

function invStatus(qty, min) {
  if (qty <= 0) return "Critical";
  if (qty <= min) return "Low";
  return "OK";
}

function odaSearchUrl(name) {
  return "https://oda.com/no/products/?search=" + encodeURIComponent(name);
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
  { id:1, name:"Nordic Supplies AS", category:"Supplies", contact:"Lars Eriksen", phone:"+47 22 11 22 33", email:"lars@nordicsupplies.no", notes:"Weekly delivery Tuesdays." },
  { id:2, name:"Oslo Renhold", category:"Cleaning", contact:"Mette Andersen", phone:"+47 91 23 45 67", email:"mette@oslorenhold.no", notes:"Cleans Mon/Wed/Fri mornings." },
  { id:3, name:"TechFix Norge", category:"IT", contact:"Bjørn Haugen", phone:"+47 90 12 34 56", email:"support@techfixnorge.no", notes:"On-call IT support. SLA 4 hours." },
];

const font = "'Poppins', sans-serif";

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:"1rem" }}>
      <div style={{ background:"var(--color-background-primary)", borderRadius:20, padding:"1.5rem", width:"100%", maxWidth:400, maxHeight:"85vh", overflowY:"auto", fontFamily:font }}>
        {children}
      </div>
    </div>
  );
}

// ── Logo icon ──────────────────────────────────────────────────────────────
function LogoIcon({ size = 52 }) {
  const r = size * 0.28;
  return (
    <div style={{ width:size, height:size, borderRadius:r, background:CORAL, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*0.65} height={size*0.65} viewBox="0 0 36 36">
        <rect x="2" y="6"  width="22" height="6" rx="3" fill="#fff" opacity="0.95"/>
        <rect x="2" y="15" width="17" height="6" rx="3" fill="#fff" opacity="0.75"/>
        <rect x="2" y="24" width="19" height="6" rx="3" fill="#fff" opacity="0.55"/>
        <circle cx="28" cy="9"  r="3.5" fill="#FCDE5A"/>
        <circle cx="23" cy="18" r="3.5" fill="#5DCAA5"/>
        <circle cx="25" cy="27" r="3.5" fill="#FCDE5A" opacity="0.7"/>
      </svg>
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────────────────
function HomePage({ onNav, items }) {
  const reorderCount = items.filter(i => invStatus(i.qty, i.min) !== "OK").length;
  const criticalCount = items.filter(i => invStatus(i.qty, i.min) === "Critical").length;

  return (
    <div style={{ fontFamily:font, minHeight:"100vh", background:"var(--color-background-tertiary)", padding:"2rem 1.5rem", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <LogoIcon size={56} />
        <div style={{ fontSize:32, fontWeight:700, color:"var(--color-text-primary)", letterSpacing:"-0.5px" }}>Kanit</div>
      </div>

      {reorderCount === 0 ? (
        <div style={{ background:"#EAF3DE", border:"2px solid #5DCAA5", borderRadius:16, padding:"1.25rem 1.5rem" }}>
          <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#3B6D11", fontFamily:font }}>All stocked up!</p>
        </div>
      ) : (
        <div style={{ background:"#FCEBEB", border:"2px solid "+RED, borderRadius:16, padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div>
            <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#A32D2D", fontFamily:font }}>
              {criticalCount > 0 ? criticalCount+" item"+(criticalCount>1?"s":"")+" out of stock" : reorderCount+" item"+(reorderCount>1?"s":"")+" running low"}
            </p>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#A32D2D", opacity:0.8, fontFamily:font }}>{reorderCount} total need restocking</p>
          </div>
          <button onClick={() => onNav("reorder")}
            style={{ background:RED, color:"#fff", border:"none", borderRadius:12, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:font }}>
            Reorder →
          </button>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <button onClick={() => onNav("inventory")}
          style={{ background:CORAL, borderRadius:20, padding:"1.5rem 1rem", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:28 }}>🥤</span>
          <span style={{ fontSize:17, fontWeight:600, color:"#fff", fontFamily:font }}>Inventory</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)", fontFamily:font }}>Soda &amp; beer</span>
        </button>
        <button onClick={() => onNav("vendors")}
          style={{ background:MINT, borderRadius:20, padding:"1.5rem 1rem", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:28 }}>📋</span>
          <span style={{ fontSize:17, fontWeight:600, color:"#fff", fontFamily:font }}>Vendors</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)", fontFamily:font }}>Suppliers &amp; contacts</span>
        </button>
      </div>
    </div>
  );
}

// ── Item card ──────────────────────────────────────────────────────────────
function ItemCard({ item, onAdj, onEdit }) {
  const st = invStatus(item.qty, item.min);
  const url = item.odaUrl || odaSearchUrl(item.name);
  const borderColor = st === "Critical" ? "#F09595" : st === "Low" ? "#FAC775" : "var(--color-border-tertiary)";
  const badgeBg   = st === "Critical" ? "#FCEBEB" : st === "Low" ? "#FAEEDA" : "#EAF3DE";
  const badgeTxt  = st === "Critical" ? "#A32D2D" : st === "Low" ? "#854F0B" : "#3B6D11";
  const odaBg     = st === "Critical" ? "#FCEBEB" : "#E6F1FB";
  const odaTxt    = st === "Critical" ? "#A32D2D" : "#185FA5";

  return (
    <div style={{ background:"var(--color-background-primary)", borderRadius:14, border:"2px solid "+borderColor, overflow:"hidden", fontFamily:font }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", padding:"12px 14px 8px", gap:8 }}>
        <p style={{ margin:0, fontSize:14, fontWeight:600, color:"var(--color-text-primary)" }}>{item.name}</p>
        <p style={{ margin:0, fontSize:12, color:"var(--color-text-secondary)", whiteSpace:"nowrap" }}>{item.qty} {item.unit}</p>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 14px 12px" }}>
        <div style={{ width:26, height:26, borderRadius:"50%", background:"#EAF3DE", color:"#3B6D11", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{item.min}</div>
        <span style={{ fontSize:10, color:"var(--color-text-tertiary)" }}>min</span>
        <div style={{ flex:1 }}/>
        <span style={{ background:badgeBg, color:badgeTxt, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600 }}>{st}</span>
        <button onClick={() => onAdj(item)} style={{ background:"var(--color-background-secondary)", border:"2px solid var(--color-border-tertiary)", borderRadius:10, width:30, height:30, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--color-text-secondary)", fontFamily:font }}>±</button>
        <button onClick={() => onEdit(item)} style={{ background:"var(--color-background-secondary)", border:"2px solid var(--color-border-tertiary)", borderRadius:10, width:30, height:30, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--color-text-secondary)", fontFamily:font }}>✎</button>
      </div>
      {st !== "OK" && (
        <>
          <div style={{ height:1, background:"var(--color-border-tertiary)" }}/>
          <a href={url} target="_blank" rel="noreferrer"
            style={{ display:"block", width:"100%", background:odaBg, color:odaTxt, border:"none", padding:"8px 0", fontSize:12, fontWeight:600, textAlign:"center", textDecoration:"none", fontFamily:font, boxSizing:"border-box" }}>
            Order on Oda ↗
          </a>
        </>
      )}
    </div>
  );
}

// ── Inventory ──────────────────────────────────────────────────────────────
function InventoryPage({ onBack, startTab }) {
  const [items, setItems] = useLocalStorage("kanit_items", INV_DEFAULT);
  const [tab, setTab] = useState(startTab || "Soda");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [adjDelta, setAdjDelta] = useState("");
  const [nextId, setNextId] = useLocalStorage("kanit_next_id", 29);

  const reorderItems = items.filter(i => invStatus(i.qty, i.min) !== "OK");

  const displayItems = useMemo(() => {
    if (tab === "Reorder") return reorderItems;
    return items.filter(i => i.category === tab && i.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, tab, search]);

  const openAdd  = () => { setForm({ name:"", category:tab==="Reorder"?"Soda":tab, qty:"", unit:"cans", min:"", odaUrl:"" }); setModal("add"); };
  const openEdit = item => { setForm({...item}); setModal({type:"edit", item}); };
  const openAdj  = item => { setAdjDelta(""); setModal({type:"adj", item}); };
  const close    = () => setModal(null);

  const save = () => {
    if (!form.name || form.qty==="" || !form.unit || form.min==="") return;
    const entry = {...form, qty:Number(form.qty), min:Number(form.min), odaUrl:form.odaUrl||""};
    if (modal === "add") { setItems(p => [...p, {id:nextId, ...entry}]); setNextId(n=>n+1); }
    else setItems(p => p.map(i => i.id===modal.item.id ? {...i,...entry} : i));
    close();
  };
  const applyAdj = () => {
    const d = Number(adjDelta); if (isNaN(d)||adjDelta==="") return;
    setItems(p => p.map(i => i.id===modal.item.id ? {...i, qty:Math.max(0,i.qty+d)} : i)); close();
  };
  const del = id => { setItems(p => p.filter(i => i.id!==id)); close(); };

  const inp = { height:40, border:"2px solid var(--color-border-secondary)", borderRadius:12, padding:"0 12px", fontSize:14, background:"var(--color-background-primary)", color:"var(--color-text-primary)", boxSizing:"border-box", marginBottom:14, width:"100%", fontFamily:font };
  const btn = (p) => ({ border:`2px solid ${p?"transparent":"var(--color-border-secondary)"}`, borderRadius:12, padding:"8px 18px", fontSize:14, cursor:"pointer", background:p?CORAL:"transparent", color:p?"#fff":"var(--color-text-primary)", fontWeight:p?600:400, fontFamily:font });

  return (
    <div style={{ fontFamily:font, minHeight:"100vh", background:"var(--color-background-tertiary)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 1.5rem 12px", borderBottom:"2px solid var(--color-border-tertiary)", background:"var(--color-background-primary)" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:CORAL, padding:0, lineHeight:1, fontFamily:font }}>←</button>
        <span style={{ fontSize:18, fontWeight:600, color:"var(--color-text-primary)" }}>Inventory</span>
      </div>

      <div style={{ display:"flex", gap:8, padding:"12px 1.5rem 0" }}>
        {[["Soda",CORAL],["Beer",AMBER],["Reorder",RED]].map(([k,color]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ border:`2px solid ${tab===k?color:"var(--color-border-tertiary)"}`, borderRadius:20, padding:"6px 0", fontSize:12, fontWeight:tab===k?600:400, cursor:"pointer", background:tab===k?color:"transparent", color:tab===k?"#fff":"var(--color-text-secondary)", flex:k!=="Reorder"?1:"unset", padding:k==="Reorder"?"6px 14px":"6px 0", whiteSpace:"nowrap", fontFamily:font }}>
            {k==="Reorder" ? "Reorder"+(reorderItems.length>0?" ("+reorderItems.length+")":"") : k}
          </button>
        ))}
      </div>

      {tab !== "Reorder" && (
        <div style={{ display:"flex", gap:10, padding:"0.75rem 1.5rem", alignItems:"center" }}>
          <input style={{...inp, marginBottom:0, flex:1}} placeholder={"Search "+tab.toLowerCase()+"…"} value={search} onChange={e=>setSearch(e.target.value)}/>
          <button onClick={openAdd} style={{ background:CORAL, color:"#fff", border:"none", borderRadius:20, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:font }}>+ Add</button>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"0.5rem 1.5rem 2rem" }}>
        {displayItems.length === 0 && (
          <p style={{ textAlign:"center", color:"var(--color-text-tertiary)", fontSize:14, padding:"2rem 0", fontFamily:font }}>
            {tab==="Reorder" ? "All stocked up — nothing to reorder!" : "No items found"}
          </p>
        )}
        {displayItems.map(item => (
          <ItemCard key={item.id} item={item} onAdj={openAdj} onEdit={openEdit} />
        ))}
      </div>

      {modal && (
        <Modal onClose={close}>
          {(modal==="add"||modal.type==="edit") && (
            <>
              <p style={{ fontSize:17, fontWeight:600, margin:"0 0 1.25rem", fontFamily:font }}>{modal==="add"?"Add item":"Edit item"}</p>
              <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Item name</label>
              <input style={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Coca Cola"/>
              <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Category</label>
              <select style={inp} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                {["Soda","Beer","Snacks","Dairy","Other"].map(c=><option key={c}>{c}</option>)}
              </select>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Quantity</label>
                  <input style={{...inp,marginBottom:0}} type="number" min="0" value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} placeholder="0"/>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Unit</label>
                  <input style={{...inp,marginBottom:0}} value={form.unit||""} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} placeholder="cans"/>
                </div>
              </div>
              <div style={{height:14}}/>
              <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Reorder threshold</label>
              <input style={inp} type="number" min="0" value={form.min} onChange={e=>setForm(p=>({...p,min:e.target.value}))} placeholder="e.g. 10"/>
              <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Oda URL (optional)</label>
              <input style={inp} value={form.odaUrl||""} onChange={e=>setForm(p=>({...p,odaUrl:e.target.value}))} placeholder="https://oda.com/no/products/…"/>
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
                {modal.type==="edit" && <button onClick={()=>del(modal.item.id)} style={{ border:"none", background:"none", color:RED, fontSize:13, cursor:"pointer", marginRight:"auto", fontFamily:font }}>Delete</button>}
                <button style={btn(false)} onClick={close}>Cancel</button>
                <button style={btn(true)} onClick={save}>Save</button>
              </div>
            </>
          )}
          {modal.type==="adj" && (
            <>
              <p style={{ fontSize:17, fontWeight:600, margin:"0 0 0.5rem", fontFamily:font }}>Adjust — {modal.item.name}</p>
              <p style={{ fontSize:13, color:"var(--color-text-secondary)", margin:"0 0 1rem", fontFamily:font }}>Current: <strong>{modal.item.qty} {modal.item.unit}</strong></p>
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                <button onClick={()=>setAdjDelta(v=>String((Number(v)||0)-1))} style={{ width:40, height:40, border:"2px solid var(--color-border-secondary)", borderRadius:12, background:"var(--color-background-secondary)", cursor:"pointer", fontSize:18, fontFamily:font }}>−</button>
                <input style={{...inp, margin:0, flex:1, textAlign:"center"}} type="number" value={adjDelta} onChange={e=>setAdjDelta(e.target.value)} placeholder="0"/>
                <button onClick={()=>setAdjDelta(v=>String((Number(v)||0)+1))} style={{ width:40, height:40, border:"2px solid var(--color-border-secondary)", borderRadius:12, background:"var(--color-background-secondary)", cursor:"pointer", fontSize:18, fontFamily:font }}>+</button>
              </div>
              {adjDelta!==""&&!isNaN(Number(adjDelta))&&<p style={{ fontSize:12, color:"var(--color-text-secondary)", margin:"-4px 0 12px", fontFamily:font }}>New: {Math.max(0,modal.item.qty+Number(adjDelta))} {modal.item.unit}</p>}
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                <button style={btn(false)} onClick={close}>Cancel</button>
                <button style={btn(true)} onClick={applyAdj}>Apply</button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

// ── Vendors ────────────────────────────────────────────────────────────────
const VCATS = ["All","Supplies","Maintenance","Cleaning","Catering","IT","Other"];
const VCOLORS = { Supplies:["#E6F1FB","#185FA5"], Maintenance:["#FAEEDA","#854F0B"], Cleaning:["#EAF3DE","#3B6D11"], Catering:["#FBEAF0","#993556"], IT:["#EEEDFE","#3C3489"], Other:["#F1EFE8","#5F5E5A"] };

function VendorsPage({ onBack }) {
  const [vendors, setVendors] = useLocalStorage("kanit_vendors", VENDOR_DEFAULT);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name:"", category:"Supplies", contact:"", phone:"", email:"", notes:"" });
  const [nextId, setNextId] = useLocalStorage("kanit_vendor_next_id", 4);
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => vendors.filter(v =>
    (filter==="All"||v.category===filter) &&
    (v.name+v.contact+v.email).toLowerCase().includes(search.toLowerCase())
  ), [vendors, filter, search]);

  const openAdd  = () => { setForm({ name:"", category:"Supplies", contact:"", phone:"", email:"", notes:"" }); setModal("add"); };
  const openEdit = v  => { setForm({...v}); setModal({type:"edit", vendor:v}); };
  const close    = () => setModal(null);
  const save = () => {
    if (!form.name.trim()) return;
    if (modal==="add") { setVendors(p=>[...p,{id:nextId,...form}]); setNextId(n=>n+1); }
    else setVendors(p=>p.map(v=>v.id===modal.vendor.id?{...v,...form}:v));
    close();
  };
  const del = id => { setVendors(p=>p.filter(v=>v.id!==id)); close(); };

  const inp = { height:40, border:"2px solid var(--color-border-secondary)", borderRadius:12, padding:"0 12px", fontSize:14, background:"var(--color-background-primary)", color:"var(--color-text-primary)", boxSizing:"border-box", marginBottom:14, width:"100%", fontFamily:font };
  const btn = (p) => ({ border:`2px solid ${p?"transparent":"var(--color-border-secondary)"}`, borderRadius:12, padding:"8px 18px", fontSize:14, cursor:"pointer", background:p?CORAL:"transparent", color:p?"#fff":"var(--color-text-primary)", fontWeight:p?600:400, fontFamily:font });

  return (
    <div style={{ fontFamily:font, minHeight:"100vh", background:"var(--color-background-tertiary)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 1.5rem 12px", borderBottom:"2px solid var(--color-border-tertiary)", background:"var(--color-background-primary)" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:CORAL, padding:0, lineHeight:1 }}>←</button>
        <span style={{ fontSize:18, fontWeight:600, color:"var(--color-text-primary)", fontFamily:font }}>Vendors</span>
      </div>
      <div style={{ display:"flex", gap:10, padding:"0.75rem 1.5rem", alignItems:"center" }}>
        <input style={{...inp, marginBottom:0, flex:1}} placeholder="Search vendors…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <button onClick={openAdd} style={{ background:CORAL, color:"#fff", border:"none", borderRadius:20, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:font }}>+ Add</button>
      </div>
      <div style={{ display:"flex", gap:6, padding:"0 1.5rem 0.75rem", flexWrap:"wrap" }}>
        {VCATS.map(c=>(
          <button key={c} onClick={()=>setFilter(c)}
            style={{ border:`2px solid ${filter===c?CORAL:"var(--color-border-tertiary)"}`, borderRadius:20, padding:"4px 12px", fontSize:12, cursor:"pointer", background:filter===c?CORAL:"transparent", color:filter===c?"#fff":"var(--color-text-secondary)", fontFamily:font }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"0 1.5rem 2rem" }}>
        {filtered.length===0 && <p style={{ textAlign:"center", color:"var(--color-text-tertiary)", fontSize:14, padding:"2rem 0", fontFamily:font }}>No vendors found</p>}
        {filtered.map(v => {
          const [bg,tc] = VCOLORS[v.category]||VCOLORS.Other;
          const open = expanded===v.id;
          return (
            <div key={v.id} style={{ background:"var(--color-background-primary)", borderRadius:16, border:"2px solid var(--color-border-tertiary)", overflow:"hidden" }}>
              <div onClick={()=>setExpanded(open?null:v.id)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", cursor:"pointer" }}>
                <div style={{ width:42, height:42, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:tc, fontFamily:font }}>{v.name.slice(0,2).toUpperCase()}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontWeight:600, fontSize:14, color:"var(--color-text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:font }}>{v.name}</p>
                  <p style={{ margin:0, fontSize:12, color:"var(--color-text-secondary)", fontFamily:font }}>{v.contact||"No contact set"}</p>
                </div>
                <span style={{ background:bg, color:tc, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600, fontFamily:font }}>{v.category}</span>
                <span style={{ color:"var(--color-text-tertiary)", fontSize:12, marginLeft:4 }}>{open?"▲":"▼"}</span>
              </div>
              {open && (
                <div style={{ borderTop:"2px solid var(--color-border-tertiary)", padding:"12px 16px", background:"var(--color-background-secondary)" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px" }}>
                    {v.phone && <div><p style={{ margin:"0 0 2px", fontSize:11, color:"var(--color-text-tertiary)", textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:font }}>Phone</p><a href={"tel:"+v.phone} style={{ fontSize:13, color:"#185FA5", textDecoration:"none", fontFamily:font }}>{v.phone}</a></div>}
                    {v.email && <div><p style={{ margin:"0 0 2px", fontSize:11, color:"var(--color-text-tertiary)", textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:font }}>Email</p><a href={"mailto:"+v.email} style={{ fontSize:13, color:"#185FA5", textDecoration:"none", fontFamily:font }}>{v.email}</a></div>}
                  </div>
                  {v.notes && <div style={{marginTop:10}}><p style={{ margin:"0 0 4px", fontSize:11, color:"var(--color-text-tertiary)", textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:font }}>Notes</p><p style={{ margin:0, fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.5, fontFamily:font }}>{v.notes}</p></div>}
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
                    <button style={btn(false)} onClick={()=>openEdit(v)}>Edit</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal onClose={close}>
          <p style={{ fontSize:17, fontWeight:600, margin:"0 0 1.25rem", fontFamily:font }}>{modal==="add"?"Add vendor":"Edit vendor"}</p>
          <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Company name</label>
          <input style={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Oslo Renhold"/>
          <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Category</label>
          <select style={inp} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
            {VCATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
          </select>
          <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Contact person</label>
          <input style={inp} value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} placeholder="Full name"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Phone</label>
              <input style={{...inp,marginBottom:0}} value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+47 …"/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Email</label>
              <input style={{...inp,marginBottom:0}} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="name@company.no"/>
            </div>
          </div>
          <div style={{height:14}}/>
          <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Notes</label>
          <textarea style={{...inp, height:"auto", minHeight:72, resize:"vertical", padding:"10px 12px"}} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Delivery schedule, SLA…"/>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
            {modal.type==="edit" && <button onClick={()=>del(modal.vendor.id)} style={{ border:"none", background:"none", color:RED, fontSize:13, cursor:"pointer", marginRight:"auto", fontFamily:font }}>Delete</button>}
            <button style={btn(false)} onClick={close}>Cancel</button>
            <button style={btn(true)} onClick={save}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [items] = useLocalStorage("kanit_items", INV_DEFAULT);

  const handleNav = (p) => {
    if (p === "reorder") setPage("inventory-reorder");
    else setPage(p);
  };

  if (page === "inventory" || page === "inventory-reorder") {
    return <InventoryPage onBack={() => setPage("home")} startTab={page === "inventory-reorder" ? "Reorder" : "Soda"} />;
  }
  if (page === "vendors") {
    return <VendorsPage onBack={() => setPage("home")} />;
  }
  return <HomePage onNav={handleNav} items={items} />;
}
