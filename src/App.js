import { useState, useMemo, useEffect, useRef, useCallback } from "react";

const CORAL = "#D85A30";
const AMBER = "#EF9F27";
const MINT  = "#5DCAA5";
const RED   = "#E24B4A";
const font  = "'Poppins', sans-serif";

// ── localStorage ───────────────────────────────────────────────────────────
function useLocalStorage(key, def) {
  const [val, setVal] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      if (!v) return def;
      const parsed = JSON.parse(v);
      if (key === "kanit_items" && Array.isArray(parsed))
        return parsed.map(i => ({ ...i, category: i.category === "Drinks" ? "Soda" : i.category }));
      return parsed;
    } catch { return def; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

// ── helpers ────────────────────────────────────────────────────────────────
function invStatus(qty, min) {
  if (qty <= 0) return "Critical";
  if (qty <= min) return "Low";
  return "OK";
}
function odaSearchUrl(name) {
  return "https://oda.com/no/products/?search=" + encodeURIComponent(name);
}

// ── voice command parser ───────────────────────────────────────────────────
function parseVoiceCommand(transcript, items) {
  const t = transcript.toLowerCase().trim();

  // find best matching item name
  let bestItem = null;
  let bestScore = 0;
  for (const item of items) {
    const name = item.name.toLowerCase();
    if (t.includes(name)) {
      if (name.length > bestScore) { bestScore = name.length; bestItem = item; }
    } else {
      // partial word match
      const words = name.split(/\s+/);
      const matched = words.filter(w => t.includes(w)).length;
      const score = matched / words.length;
      if (score > 0.5 && score > bestScore / 20) { bestScore = score * 10; bestItem = item; }
    }
  }
  if (!bestItem) return null;

  // extract number
  const numMatch = t.match(/\b(\d+)\b/);
  const num = numMatch ? parseInt(numMatch[1]) : null;
  if (num === null) return null;

  // detect operation
  const isSet   = /\bset\b|\bis\b|\bnow\b|\bcount\b|\btotal\b/.test(t);
  const isMinus = /\bminus\b|\bless\b|\bremove\b|\btook\b|\bused\b|\bdown\b/.test(t);
  const isPlus  = /\bplus\b|\badd\b|\bmore\b|\brestock\b|\bup\b|\barrived\b/.test(t);

  let op, delta;
  if (isSet)        { op = "set";   delta = num; }
  else if (isMinus) { op = "minus"; delta = -num; }
  else if (isPlus)  { op = "plus";  delta = num; }
  else              { op = "set";   delta = num; } // default: set

  return { item: bestItem, op, delta, num };
}

// ── data ───────────────────────────────────────────────────────────────────
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

// ── shared UI primitives ───────────────────────────────────────────────────
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

function LogoIcon({ size = 52 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:size*0.28, background:CORAL, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
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

function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 1.5rem 12px", borderBottom:"2px solid var(--color-border-tertiary)", background:"var(--color-background-primary)" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:CORAL, padding:0, lineHeight:1, fontFamily:font }}>←</button>
      <span style={{ fontSize:18, fontWeight:600, color:"var(--color-text-primary)", fontFamily:font, flex:1 }}>{title}</span>
      {right}
    </div>
  );
}

function InpStyle() {
  return { height:40, border:"2px solid var(--color-border-secondary)", borderRadius:12, padding:"0 12px", fontSize:14, background:"var(--color-background-primary)", color:"var(--color-text-primary)", boxSizing:"border-box", marginBottom:14, width:"100%", fontFamily:font };
}
function BtnStyle(primary) {
  return { border:`2px solid ${primary?"transparent":"var(--color-border-secondary)"}`, borderRadius:12, padding:"8px 18px", fontSize:14, cursor:"pointer", background:primary?CORAL:"transparent", color:primary?"#fff":"var(--color-text-primary)", fontWeight:primary?600:400, fontFamily:font };
}

// ── voice hook ─────────────────────────────────────────────────────────────
function useVoice(onResult) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);

  const supported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend   = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = e => {
      const t = e.results[0][0].transcript;
      setTranscript(t);
      onResult(t);
    };
    recRef.current = rec;
    rec.start();
  }, [supported, onResult]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, transcript, start, stop, supported };
}

// ── voice feedback toast ───────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  if (!msg) return null;
  const isErr = msg.startsWith("?");
  return (
    <div style={{ position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)", background:isErr?"#FCEBEB":CORAL, color:isErr?"#A32D2D":"#fff", borderRadius:14, padding:"10px 20px", fontSize:13, fontWeight:600, fontFamily:font, zIndex:300, maxWidth:"80vw", textAlign:"center", boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>
      {isErr ? msg.slice(1) : msg}
    </div>
  );
}

// ── mic button ─────────────────────────────────────────────────────────────
function MicButton({ items, onUpdate }) {
  const [toast, setToast] = useState(null);

  const handleResult = useCallback((transcript) => {
    const cmd = parseVoiceCommand(transcript, items);
    if (!cmd) {
      setToast(`? Didn't catch that: "${transcript}"`);
      return;
    }
    const newQty = cmd.op === "set"
      ? Math.max(0, cmd.num)
      : Math.max(0, cmd.item.qty + cmd.delta);
    onUpdate(cmd.item.id, newQty);
    const opLabel = cmd.op === "set" ? "set to" : cmd.op === "plus" ? "+" : "-";
    setToast(`${cmd.item.name} ${opLabel} ${Math.abs(cmd.delta ?? cmd.num)} → ${newQty}`);
  }, [items, onUpdate]);

  const { listening, start, stop, supported } = useVoice(handleResult);

  if (!supported) return null;

  return (
    <>
      <button
        onMouseDown={start} onMouseUp={stop}
        onTouchStart={e=>{e.preventDefault();start();}} onTouchEnd={e=>{e.preventDefault();stop();}}
        style={{ width:44, height:44, borderRadius:"50%", border:`2px solid ${listening?RED:CORAL}`, background:listening?RED:CORAL, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}
        title="Hold to speak">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="2" width="6" height="11" rx="3"/>
          <path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>
        </svg>
      </button>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
}

// ── item card ──────────────────────────────────────────────────────────────
function ItemCard({ item, onAdj, onEdit }) {
  const st  = invStatus(item.qty, item.min);
  const url = item.odaUrl || odaSearchUrl(item.name);
  const borderColor = st==="Critical"?"#F09595":st==="Low"?"#FAC775":"var(--color-border-tertiary)";
  const badgeBg  = st==="Critical"?"#FCEBEB":st==="Low"?"#FAEEDA":"#EAF3DE";
  const badgeTxt = st==="Critical"?"#A32D2D":st==="Low"?"#854F0B":"#3B6D11";
  const odaBg    = st==="Critical"?"#FCEBEB":"#E6F1FB";
  const odaTxt   = st==="Critical"?"#A32D2D":"#185FA5";

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
      {st !== "OK" && <>
        <div style={{ height:1, background:"var(--color-border-tertiary)" }}/>
        <a href={url} target="_blank" rel="noreferrer"
          style={{ display:"block", width:"100%", background:odaBg, color:odaTxt, border:"none", padding:"8px 0", fontSize:12, fontWeight:600, textAlign:"center", textDecoration:"none", fontFamily:font, boxSizing:"border-box" }}>
          Order on Oda ↗
        </a>
      </>}
    </div>
  );
}

// ── stock count mode ───────────────────────────────────────────────────────
function StockCountPage({ items, onSave, onClose }) {
  const all = [...items].sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  const [idx, setIdx] = useState(0);
  const [counts, setCounts] = useState({});
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState(null);

  const current = all[idx];

  const handleVoiceResult = useCallback((transcript) => {
    const num = parseInt(transcript.match(/\b(\d+)\b/)?.[1]);
    if (!isNaN(num)) {
      setCounts(c => ({ ...c, [current.id]: num }));
      setInput(String(num));
      setToast(`${current.name} → ${num}`);
      setTimeout(() => advance(num), 800);
    } else {
      setToast(`? Didn't catch a number`);
    }
  }, [current, idx]);

  const { listening, start, stop, supported } = useVoice(handleVoiceResult);

  const advance = (overrideVal) => {
    const val = overrideVal !== undefined ? overrideVal : (input === "" ? current.qty : Number(input));
    setCounts(c => ({ ...c, [current.id]: val }));
    setInput("");
    if (idx < all.length - 1) setIdx(i => i + 1);
    else setDone(true);
  };

  const skip = () => { setInput(""); if (idx < all.length - 1) setIdx(i => i + 1); else setDone(true); };

  const finish = () => {
    const updated = items.map(i => counts[i.id] !== undefined ? { ...i, qty: counts[i.id] } : i);
    onSave(updated);
    onClose();
  };

  const changedCount = Object.keys(counts).length;
  const progress = Math.round((idx / all.length) * 100);

  if (done) {
    return (
      <div style={{ fontFamily:font, minHeight:"100vh", background:"var(--color-background-tertiary)" }}>
        <TopBar title="Stock count" onBack={onClose} />
        <div style={{ padding:"2rem 1.5rem", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"#EAF3DE", border:"2px solid "+MINT, borderRadius:16, padding:"1.5rem", textAlign:"center" }}>
            <p style={{ margin:"0 0 4px", fontSize:20, fontWeight:700, color:"#3B6D11", fontFamily:font }}>Count complete!</p>
            <p style={{ margin:0, fontSize:14, color:"#3B6D11", fontFamily:font }}>{changedCount} item{changedCount!==1?"s":""} counted</p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {all.filter(i => counts[i.id] !== undefined).map(i => (
              <div key={i.id} style={{ background:"var(--color-background-primary)", borderRadius:12, border:"2px solid var(--color-border-tertiary)", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, fontWeight:500, fontFamily:font }}>{i.name}</span>
                <span style={{ fontSize:13, color:"var(--color-text-secondary)", fontFamily:font }}>{i.qty} → <strong style={{ color:CORAL }}>{counts[i.id]}</strong></span>
              </div>
            ))}
          </div>
          <button onClick={finish} style={{ background:CORAL, color:"#fff", border:"none", borderRadius:14, padding:"14px", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:font }}>
            Save all changes
          </button>
          <button onClick={onClose} style={{ background:"transparent", color:"var(--color-text-secondary)", border:"2px solid var(--color-border-secondary)", borderRadius:14, padding:"12px", fontSize:14, cursor:"pointer", fontFamily:font }}>
            Discard &amp; exit
          </button>
        </div>
        {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div style={{ fontFamily:font, minHeight:"100vh", background:"var(--color-background-tertiary)" }}>
      <TopBar title="Stock count" onBack={onClose}
        right={<span style={{ fontSize:12, color:"var(--color-text-secondary)", fontFamily:font }}>{idx+1} / {all.length}</span>} />

      {/* progress bar */}
      <div style={{ height:4, background:"var(--color-border-tertiary)" }}>
        <div style={{ height:4, width:progress+"%", background:CORAL, transition:"width 0.3s" }}/>
      </div>

      <div style={{ padding:"1.5rem", display:"flex", flexDirection:"column", gap:16 }}>
        {/* category label */}
        <p style={{ margin:0, fontSize:11, fontWeight:600, color:"var(--color-text-tertiary)", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:font }}>{current.category}</p>

        {/* current item card */}
        <div style={{ background:"var(--color-background-primary)", borderRadius:20, border:"2px solid "+CORAL, padding:"1.5rem", textAlign:"center" }}>
          <p style={{ margin:"0 0 4px", fontSize:22, fontWeight:700, color:"var(--color-text-primary)", fontFamily:font }}>{current.name}</p>
          <p style={{ margin:"0 0 1.25rem", fontSize:13, color:"var(--color-text-secondary)", fontFamily:font }}>Currently: {current.qty} {current.unit}</p>

          <input
            type="number" min="0"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && advance()}
            placeholder="Enter count…"
            style={{ width:"100%", height:56, border:"2px solid var(--color-border-secondary)", borderRadius:14, padding:"0 16px", fontSize:22, fontWeight:600, textAlign:"center", background:"var(--color-background-secondary)", color:"var(--color-text-primary)", boxSizing:"border-box", fontFamily:font }}
            autoFocus
          />
        </div>

        {/* mic instruction */}
        {supported && (
          <p style={{ margin:0, fontSize:12, color:"var(--color-text-tertiary)", textAlign:"center", fontFamily:font }}>
            {listening ? "🎤 Listening…" : "Hold mic and say the count"}
          </p>
        )}

        {/* action row */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={skip}
            style={{ flex:1, background:"transparent", color:"var(--color-text-secondary)", border:"2px solid var(--color-border-secondary)", borderRadius:14, padding:"12px", fontSize:14, cursor:"pointer", fontFamily:font }}>
            Skip
          </button>
          {supported && (
            <button
              onMouseDown={start} onMouseUp={stop}
              onTouchStart={e=>{e.preventDefault();start();}} onTouchEnd={e=>{e.preventDefault();stop();}}
              style={{ width:52, height:52, borderRadius:"50%", border:`2px solid ${listening?RED:CORAL}`, background:listening?RED:CORAL, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="2" width="6" height="11" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>
              </svg>
            </button>
          )}
          <button onClick={() => advance()}
            style={{ flex:1, background:CORAL, color:"#fff", border:"none", borderRadius:14, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:font }}>
            Next →
          </button>
        </div>

        {/* upcoming items */}
        {idx < all.length - 1 && (
          <div style={{ marginTop:4 }}>
            <p style={{ margin:"0 0 8px", fontSize:11, color:"var(--color-text-tertiary)", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:font }}>Up next</p>
            {all.slice(idx+1, idx+3).map(i => (
              <div key={i.id} style={{ background:"var(--color-background-secondary)", borderRadius:10, padding:"8px 14px", marginBottom:6, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, color:"var(--color-text-secondary)", fontFamily:font }}>{i.name}</span>
                <span style={{ fontSize:12, color:"var(--color-text-tertiary)", fontFamily:font }}>{i.qty} {i.unit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

// ── inventory page ─────────────────────────────────────────────────────────
function InventoryPage({ onBack, startTab }) {
  const [items, setItems] = useLocalStorage("kanit_items", INV_DEFAULT);
  const [tab, setTab]     = useState(startTab || "Soda");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState({});
  const [adjDelta, setAdjDelta] = useState("");
  const [nextId, setNextId] = useLocalStorage("kanit_next_id", 29);
  const [stockCount, setStockCount] = useState(false);

  const reorderItems = items.filter(i => invStatus(i.qty, i.min) !== "OK");
  const displayItems = useMemo(() => {
    if (tab === "Reorder") return reorderItems;
    return items.filter(i => i.category === tab && i.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, tab, search]);

  const updateQty = useCallback((id, newQty) => {
    setItems(p => p.map(i => i.id === id ? { ...i, qty: newQty } : i));
  }, [setItems]);

  const openAdd  = () => { setForm({ name:"", category:tab==="Reorder"?"Soda":tab, qty:"", unit:"cans", min:"", odaUrl:"" }); setModal("add"); };
  const openEdit = item => { setForm({...item}); setModal({type:"edit", item}); };
  const openAdj  = item => { setAdjDelta(""); setModal({type:"adj", item}); };
  const close    = () => setModal(null);

  const inp = InpStyle();
  const btn = BtnStyle;

  const save = () => {
    if (!form.name||form.qty===""||!form.unit||form.min==="") return;
    const entry = {...form, qty:Number(form.qty), min:Number(form.min), odaUrl:form.odaUrl||""};
    if (modal==="add") { setItems(p=>[...p,{id:nextId,...entry}]); setNextId(n=>n+1); }
    else setItems(p=>p.map(i=>i.id===modal.item.id?{...i,...entry}:i));
    close();
  };
  const applyAdj = () => {
    const d=Number(adjDelta); if(isNaN(d)||adjDelta==="") return;
    setItems(p=>p.map(i=>i.id===modal.item.id?{...i,qty:Math.max(0,i.qty+d)}:i)); close();
  };
  const del = id => { setItems(p=>p.filter(i=>i.id!==id)); close(); };

  if (stockCount) {
    return <StockCountPage items={items} onSave={setItems} onClose={() => setStockCount(false)} />;
  }

  return (
    <div style={{ fontFamily:font, minHeight:"100vh", background:"var(--color-background-tertiary)" }}>
      <TopBar title="Inventory" onBack={onBack}
        right={
          <button onClick={() => setStockCount(true)}
            style={{ background:MINT, color:"#fff", border:"none", borderRadius:20, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:font, whiteSpace:"nowrap" }}>
            Count
          </button>
        }
      />

      <div style={{ display:"flex", gap:8, padding:"12px 1.5rem 0" }}>
        {[["Soda",CORAL],["Beer",AMBER],["Reorder",RED]].map(([k,color])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{ border:`2px solid ${tab===k?color:"var(--color-border-tertiary)"}`, borderRadius:20, fontSize:12, fontWeight:tab===k?600:400, cursor:"pointer", background:tab===k?color:"transparent", color:tab===k?"#fff":"var(--color-text-secondary)", flex:k!=="Reorder"?1:"unset", padding:k==="Reorder"?"6px 14px":"6px 0", whiteSpace:"nowrap", fontFamily:font }}>
            {k==="Reorder"?"Reorder"+(reorderItems.length>0?" ("+reorderItems.length+")":""):k}
          </button>
        ))}
      </div>

      {tab !== "Reorder" && (
        <div style={{ display:"flex", gap:10, padding:"0.75rem 1.5rem", alignItems:"center" }}>
          <input style={{...inp, marginBottom:0, flex:1}} placeholder={"Search "+tab.toLowerCase()+"…"} value={search} onChange={e=>setSearch(e.target.value)}/>
          <MicButton items={items} onUpdate={updateQty} />
          <button onClick={openAdd} style={{ background:CORAL, color:"#fff", border:"none", borderRadius:20, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:font }}>+ Add</button>
        </div>
      )}

      {tab === "Reorder" && (
        <div style={{ display:"flex", gap:10, padding:"0.75rem 1.5rem", alignItems:"center" }}>
          <MicButton items={items} onUpdate={updateQty} />
          <p style={{ margin:0, fontSize:13, color:"var(--color-text-secondary)", fontFamily:font }}>
            {reorderItems.length} item{reorderItems.length!==1?"s":""} need restocking
          </p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"0.5rem 1.5rem 2rem" }}>
        {displayItems.length===0 && (
          <p style={{ textAlign:"center", color:"var(--color-text-tertiary)", fontSize:14, padding:"2rem 0", fontFamily:font }}>
            {tab==="Reorder"?"All stocked up — nothing to reorder!":"No items found"}
          </p>
        )}
        {displayItems.map(item=>(
          <ItemCard key={item.id} item={item} onAdj={openAdj} onEdit={openEdit}/>
        ))}
      </div>

      {modal && (
        <Modal onClose={close}>
          {(modal==="add"||modal.type==="edit") && <>
            <p style={{ fontSize:17, fontWeight:600, margin:"0 0 1.25rem", fontFamily:font }}>{modal==="add"?"Add item":"Edit item"}</p>
            <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Item name</label>
            <input style={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Coca Cola"/>
            <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Category</label>
            <select style={inp} value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
              {["Soda","Beer","Snacks","Dairy","Other"].map(c=><option key={c}>{c}</option>)}
            </select>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div><label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Quantity</label><input style={{...inp,marginBottom:0}} type="number" min="0" value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} placeholder="0"/></div>
              <div><label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Unit</label><input style={{...inp,marginBottom:0}} value={form.unit||""} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} placeholder="cans"/></div>
            </div>
            <div style={{height:14}}/>
            <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Reorder threshold</label>
            <input style={inp} type="number" min="0" value={form.min} onChange={e=>setForm(p=>({...p,min:e.target.value}))} placeholder="e.g. 10"/>
            <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Oda URL (optional)</label>
            <input style={inp} value={form.odaUrl||""} onChange={e=>setForm(p=>({...p,odaUrl:e.target.value}))} placeholder="https://oda.com/no/products/…"/>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
              {modal.type==="edit"&&<button onClick={()=>del(modal.item.id)} style={{ border:"none", background:"none", color:RED, fontSize:13, cursor:"pointer", marginRight:"auto", fontFamily:font }}>Delete</button>}
              <button style={btn(false)} onClick={close}>Cancel</button>
              <button style={btn(true)} onClick={save}>Save</button>
            </div>
          </>}
          {modal.type==="adj" && <>
            <p style={{ fontSize:17, fontWeight:600, margin:"0 0 0.5rem", fontFamily:font }}>Adjust — {modal.item.name}</p>
            <p style={{ fontSize:13, color:"var(--color-text-secondary)", margin:"0 0 1rem", fontFamily:font }}>Current: <strong>{modal.item.qty} {modal.item.unit}</strong></p>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              <button onClick={()=>setAdjDelta(v=>String((Number(v)||0)-1))} style={{ width:40, height:40, border:"2px solid var(--color-border-secondary)", borderRadius:12, background:"var(--color-background-secondary)", cursor:"pointer", fontSize:18, fontFamily:font }}>−</button>
              <input style={{...inp,margin:0,flex:1,textAlign:"center"}} type="number" value={adjDelta} onChange={e=>setAdjDelta(e.target.value)} placeholder="0"/>
              <button onClick={()=>setAdjDelta(v=>String((Number(v)||0)+1))} style={{ width:40, height:40, border:"2px solid var(--color-border-secondary)", borderRadius:12, background:"var(--color-background-secondary)", cursor:"pointer", fontSize:18, fontFamily:font }}>+</button>
            </div>
            {adjDelta!==""&&!isNaN(Number(adjDelta))&&<p style={{ fontSize:12, color:"var(--color-text-secondary)", margin:"-4px 0 12px", fontFamily:font }}>New: {Math.max(0,modal.item.qty+Number(adjDelta))} {modal.item.unit}</p>}
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button style={btn(false)} onClick={close}>Cancel</button>
              <button style={btn(true)} onClick={applyAdj}>Apply</button>
            </div>
          </>}
        </Modal>
      )}
    </div>
  );
}

// ── vendors page ───────────────────────────────────────────────────────────
const VCATS = ["All","Supplies","Maintenance","Cleaning","Catering","IT","Other"];
const VCOLORS = { Supplies:["#E6F1FB","#185FA5"], Maintenance:["#FAEEDA","#854F0B"], Cleaning:["#EAF3DE","#3B6D11"], Catering:["#FBEAF0","#993556"], IT:["#EEEDFE","#3C3489"], Other:["#F1EFE8","#5F5E5A"] };

function VendorsPage({ onBack }) {
  const [vendors, setVendors] = useLocalStorage("kanit_vendors", VENDOR_DEFAULT);
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({ name:"", category:"Supplies", contact:"", phone:"", email:"", notes:"" });
  const [nextId, setNextId]   = useLocalStorage("kanit_vendor_next_id", 4);
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => vendors.filter(v =>
    (filter==="All"||v.category===filter) &&
    (v.name+v.contact+v.email).toLowerCase().includes(search.toLowerCase())
  ), [vendors, filter, search]);

  const openAdd  = () => { setForm({ name:"", category:"Supplies", contact:"", phone:"", email:"", notes:"" }); setModal("add"); };
  const openEdit = v  => { setForm({...v}); setModal({type:"edit",vendor:v}); };
  const close    = () => setModal(null);
  const save = () => {
    if (!form.name.trim()) return;
    if (modal==="add") { setVendors(p=>[...p,{id:nextId,...form}]); setNextId(n=>n+1); }
    else setVendors(p=>p.map(v=>v.id===modal.vendor.id?{...v,...form}:v));
    close();
  };
  const del = id => { setVendors(p=>p.filter(v=>v.id!==id)); close(); };
  const inp = InpStyle();
  const btn = BtnStyle;

  return (
    <div style={{ fontFamily:font, minHeight:"100vh", background:"var(--color-background-tertiary)" }}>
      <TopBar title="Vendors" onBack={onBack} />
      <div style={{ display:"flex", gap:10, padding:"0.75rem 1.5rem", alignItems:"center" }}>
        <input style={{...inp,marginBottom:0,flex:1}} placeholder="Search vendors…" value={search} onChange={e=>setSearch(e.target.value)}/>
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
        {filtered.length===0&&<p style={{ textAlign:"center", color:"var(--color-text-tertiary)", fontSize:14, padding:"2rem 0", fontFamily:font }}>No vendors found</p>}
        {filtered.map(v=>{
          const [bg,tc]=VCOLORS[v.category]||VCOLORS.Other;
          const open=expanded===v.id;
          return (
            <div key={v.id} style={{ background:"var(--color-background-primary)", borderRadius:16, border:"2px solid var(--color-border-tertiary)", overflow:"hidden" }}>
              <div onClick={()=>setExpanded(open?null:v.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", cursor:"pointer" }}>
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
              {open&&(
                <div style={{ borderTop:"2px solid var(--color-border-tertiary)", padding:"12px 16px", background:"var(--color-background-secondary)" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px" }}>
                    {v.phone&&<div><p style={{ margin:"0 0 2px", fontSize:11, color:"var(--color-text-tertiary)", textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:font }}>Phone</p><a href={"tel:"+v.phone} style={{ fontSize:13, color:"#185FA5", textDecoration:"none", fontFamily:font }}>{v.phone}</a></div>}
                    {v.email&&<div><p style={{ margin:"0 0 2px", fontSize:11, color:"var(--color-text-tertiary)", textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:font }}>Email</p><a href={"mailto:"+v.email} style={{ fontSize:13, color:"#185FA5", textDecoration:"none", fontFamily:font }}>{v.email}</a></div>}
                  </div>
                  {v.notes&&<div style={{marginTop:10}}><p style={{ margin:"0 0 4px", fontSize:11, color:"var(--color-text-tertiary)", textTransform:"uppercase", letterSpacing:"0.04em", fontFamily:font }}>Notes</p><p style={{ margin:0, fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.5, fontFamily:font }}>{v.notes}</p></div>}
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
                    <button style={btn(false)} onClick={()=>openEdit(v)}>Edit</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {modal&&(
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
            <div><label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Phone</label><input style={{...inp,marginBottom:0}} value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+47 …"/></div>
            <div><label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Email</label><input style={{...inp,marginBottom:0}} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="name@company.no"/></div>
          </div>
          <div style={{height:14}}/>
          <label style={{ display:"block", fontSize:12, color:"var(--color-text-secondary)", marginBottom:4, fontFamily:font }}>Notes</label>
          <textarea style={{...inp,height:"auto",minHeight:72,resize:"vertical",padding:"10px 12px"}} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Delivery schedule, SLA…"/>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
            {modal.type==="edit"&&<button onClick={()=>del(modal.vendor.id)} style={{ border:"none", background:"none", color:RED, fontSize:13, cursor:"pointer", marginRight:"auto", fontFamily:font }}>Delete</button>}
            <button style={btn(false)} onClick={close}>Cancel</button>
            <button style={btn(true)} onClick={save}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── home ───────────────────────────────────────────────────────────────────
function HomePage({ onNav, items }) {
  const reorderCount  = items.filter(i=>invStatus(i.qty,i.min)!=="OK").length;
  const criticalCount = items.filter(i=>invStatus(i.qty,i.min)==="Critical").length;
  return (
    <div style={{ fontFamily:font, minHeight:"100vh", background:"var(--color-background-tertiary)", padding:"2rem 1.5rem", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <LogoIcon size={56}/>
        <div style={{ fontSize:32, fontWeight:700, color:"var(--color-text-primary)", letterSpacing:"-0.5px", fontFamily:font }}>Kanit</div>
      </div>
      {reorderCount===0 ? (
        <div style={{ background:"#EAF3DE", border:"2px solid "+MINT, borderRadius:16, padding:"1.25rem 1.5rem" }}>
          <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#3B6D11", fontFamily:font }}>All stocked up!</p>
        </div>
      ) : (
        <div style={{ background:"#FCEBEB", border:"2px solid "+RED, borderRadius:16, padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <div>
            <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#A32D2D", fontFamily:font }}>
              {criticalCount>0?criticalCount+" item"+(criticalCount>1?"s":"")+" out of stock":reorderCount+" item"+(reorderCount>1?"s":"")+" running low"}
            </p>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#A32D2D", opacity:0.8, fontFamily:font }}>{reorderCount} total need restocking</p>
          </div>
          <button onClick={()=>onNav("reorder")} style={{ background:RED, color:"#fff", border:"none", borderRadius:12, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:font }}>Reorder →</button>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <button onClick={()=>onNav("inventory")} style={{ background:CORAL, borderRadius:20, padding:"1.5rem 1rem", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:28 }}>🥤</span>
          <span style={{ fontSize:17, fontWeight:600, color:"#fff", fontFamily:font }}>Inventory</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)", fontFamily:font }}>Soda &amp; beer</span>
        </button>
        <button onClick={()=>onNav("vendors")} style={{ background:MINT, borderRadius:20, padding:"1.5rem 1rem", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:28 }}>📋</span>
          <span style={{ fontSize:17, fontWeight:600, color:"#fff", fontFamily:font }}>Vendors</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)", fontFamily:font }}>Suppliers &amp; contacts</span>
        </button>
      </div>
    </div>
  );
}

// ── app shell ──────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [items] = useLocalStorage("kanit_items", INV_DEFAULT);
  const handleNav = p => setPage(p==="reorder"?"inventory-reorder":p);
  if (page==="inventory"||page==="inventory-reorder")
    return <InventoryPage onBack={()=>setPage("home")} startTab={page==="inventory-reorder"?"Reorder":"Soda"}/>;
  if (page==="vendors")
    return <VendorsPage onBack={()=>setPage("home")}/>;
  return <HomePage onNav={handleNav} items={items}/>;
}
