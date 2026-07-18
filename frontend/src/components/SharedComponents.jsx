import { useState, useEffect, useRef } from "react";
import { LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, searchRegistry, FLOW_STEPS, TRIAGE_LEVELS } from "../data/referenceData";
import { STATUS_META, NAV, emojiOf, calcAge, avatarHue, fmtN, pad, genNo } from "../lib/utils";
import { Button } from "./ui/button";
import { Badge as ShadcnBadge } from "./ui/badge";
import {
  ClipboardList,
  Stethoscope,
  UserPlus,
  Heart,
  FlaskConical,
  Pill,
  Bed,
  Folder,
  BarChart3,
  FileText,
  CreditCard,
  Layers,
  Package,
  ShoppingCart,
  BookOpen,
  TrendingUp,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

const LUCIDE_ICONS = {
  queue: ClipboardList,
  triage: Stethoscope,
  register: UserPlus,
  doctor: Heart,
  lab: FlaskConical,
  pharmacy: Pill,
  ward: Bed,
  history: Folder,
  analytics: BarChart3,
  reports: FileText,
  finance: CreditCard,
  schemes: Layers,
  inventory: Package,
  procurement: ShoppingCart,
  catalogue: BookOpen,
  forecast: TrendingUp,
  transfers: RefreshCw,
  expiry: AlertTriangle,
};


// --- Theme Management System ---
let currentTheme = localStorage.getItem("medicore_theme") || "light";
const themeListeners = new Set();

export function getTheme() {
  return currentTheme;
}

export function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem("medicore_theme", theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  themeListeners.forEach(listener => listener(theme));
}

if (typeof window !== "undefined") {
  if (currentTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

const C = { // colors
  navy:"#071828", navyM:"#0d2744", navyL:"#0f3460",
  cyan:"#00bcd4", cyanL:"#e0f7fa",
  slate:"hsl(var(--muted-foreground))", slateL:"hsl(var(--muted-foreground))", slateXL:"hsl(var(--border))",
  bg:"hsl(var(--background))",
};

// ============================================================================
// CatalogueSearch - reusable item-search widget used at EVERY service point.
//
// Props:
//   cats        [string]   - category filter e.g. ["lab"] or ["pharmacy"]
//   selected    [id]       - currently selected item ids (for tick display)
//   onAdd       (item)=>   - called when user picks an item
//   onRemove    (id)=>     - called when user removes an item (optional)
//   placeholder string     - input hint
//   multi       bool       - allow multiple selections (default true)
//   showPrice   bool       - show price column (default true)
//   compact     bool       - smaller card layout
//   label       string     - section heading
//   accentColor string
// ============================================================================
function CatalogueSearch({
  cats = null,
  selected = [],
  onAdd,
  onRemove,
  placeholder = "Search items...",
  multi = true,
  showPrice = true,
  compact = false,
  label = null,
  accentColor = "#0e7490",
}) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState([]);
  const [limit,    setLimit]    = useState(12);
  const [focused,  setFocused]  = useState(false);
  const timerRef = useRef(null);

  // Debounced search - runs synchronously in this single-file setup
  const runSearch = (q) => {
    const r = searchRegistry(q, { cats, limit: 40 });
    setResults(r);
    setLimit(12);
  };

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    runSearch(q);
  };

  // Show default results when focused with empty query
  const handleFocus = () => {
    setFocused(true);
    if (!query) runSearch("");
  };

  const pick = (item) => {
    if (!multi && selected.length >= 1 && !selected.includes(item.id)) return;
    onAdd(item);
    if (!multi) { setQuery(""); setResults([]); setFocused(false); }
  };

  const visible = results.slice(0, limit);
  const hasMore = results.length > limit;

  const catColor = (cat) =>
    cat==="lab"?"#0e7490":cat==="radiology"?"#7c3aed":cat==="pharmacy"?"#059669":
    cat==="procedure"?"#d97706":cat==="consultation"?"#1d4ed8":
    cat==="accommodation"?"#0369a1":cat==="nursing"?"#be185d":"#475569";

  const catBg = (cat) =>
    cat==="lab"?"#cffafe":cat==="radiology"?"#ede9fe":cat==="pharmacy"?"#d1fae5":
    cat==="procedure"?"#fef3c7":cat==="consultation"?"#dbeafe":
    cat==="accommodation"?"#e0f2fe":cat==="nursing"?"#fce7f3":"#f1f5f9";

  return (
    <div style={{ marginBottom: compact ? 8 : 14 }}>
      {label && (
        <div style={{ fontSize:11,fontWeight:700,color:accentColor,textTransform:"uppercase",letterSpacing:.9,fontFamily:"monospace",marginBottom:6 }}>
          {label}
        </div>
      )}

      {/* Search input */}
      <div style={{ position:"relative", marginBottom: focused && visible.length ? 6 : 0 }}>
        <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#94a3b8",pointerEvents:"none",userSelect:"none" }}>
          🔍
        </span>
        <input
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          placeholder={placeholder}
          style={{ width:"100%",boxSizing:"border-box",padding:"10px 36px",border:"1.5px solid #e2e8f0",borderRadius:9,fontFamily:"inherit",fontSize:13,outline:"none",background:"#f8fafc",transition:"border-color .15s",borderColor: focused ? accentColor : "#e2e8f0" }}
        />
        {query && (
          <button onClick={()=>{ setQuery(""); setResults([]); }}
            style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#94a3b8",padding:"0 4px",lineHeight:1 }}>
            x
          </button>
        )}
      </div>

      {/* Results dropdown / inline list */}
      {focused && visible.length > 0 && (
        <div style={{ background:"#fff",borderRadius:10,border:"1.5px solid #e2e8f0",boxShadow:"0 6px 24px rgba(0,0,0,.10)",overflow:"hidden",maxHeight:320,overflowY:"auto" }}>
          {visible.map(item => {
            const isSelected = selected.includes(item.id);
            return (
              <div key={item.id}
                onMouseDown={() => pick(item)}
                style={{ display:"flex",alignItems:"center",gap:10,padding: compact ? "8px 12px" : "10px 14px",cursor: isSelected && multi ? "default" : "pointer",
                  background: isSelected ? "#f0fdf4" : "#fff",
                  borderBottom:"1px solid #f1f5f9",transition:"background .1s" }}
                onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background="#f8fafc"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=isSelected?"#f0fdf4":"#fff"; }}>
                {/* Status indicator */}
                <div style={{ width:20,height:20,borderRadius:5,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                  background: isSelected ? "#059669" : "#f1f5f9",
                  border: isSelected ? "none" : "1.5px solid #e2e8f0" }}>
                  {isSelected && <span style={{ color:"#fff",fontSize:11,fontWeight:900 }}>v</span>}
                </div>
                {/* Item info */}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize: compact ? 12 : 13, fontWeight:600, color:"#0b1929",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                    {item.name}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:2 }}>
                    <span style={{ background:catBg(item.cat),color:catColor(item.cat),
                      borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:.6 }}>
                      {item.subcat||item.cat}
                    </span>
                    {item.unit && <span style={{ fontSize:10,color:"#94a3b8" }}>{item.unit}</span>}
                  </div>
                </div>
                {/* Price */}
                {showPrice && (
                  <div style={{ fontSize: compact ? 11 : 12, fontWeight:700, color: isSelected ? "#059669" : catColor(item.cat),
                    fontFamily:"monospace",flexShrink:0 }}>
                    {item.price > 0 ? `KES ${item.price.toLocaleString()}` : "POA"}
                  </div>
                )}
                {/* Remove button if selected */}
                {isSelected && onRemove && (
                  <button onMouseDown={e=>{ e.stopPropagation(); onRemove(item.id); }}
                    style={{ background:"#fef2f2",border:"none",borderRadius:5,width:22,height:22,cursor:"pointer",color:"#dc2626",fontSize:13,fontWeight:700,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    x
                  </button>
                )}
              </div>
            );
          })}
          {hasMore && (
            <div onMouseDown={()=>setLimit(l=>l+12)}
              style={{ padding:"10px 14px",textAlign:"center",fontSize:12,color:accentColor,fontWeight:700,cursor:"pointer",background:"#f8fafc" }}>
              Show more results ({results.length - limit} more)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ label, color, bg, dot, sm }) {
  return (
    <span style={{ background:bg, color, borderRadius:20,
      padding:sm?"2px 10px":"4px 13px",
      fontSize:sm?11:12, fontWeight:700,
      display:"inline-flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
      {dot && <span style={{ width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0 }}/>}
      {label}
    </span>
  );
}

function Sec({ children, accent="#475569" }) {
  return (
    <div style={{ fontSize:11,fontWeight:700,color:accent,letterSpacing:1.3,
      textTransform:"uppercase",fontFamily:"monospace",marginBottom:12,
      paddingBottom:6,borderBottom:`2px solid ${accent}22` }}>{children}</div>
  );
}

const baseInput = { width:"100%",padding:"9px 11px",borderRadius:8,fontSize:13,
  fontFamily:"inherit",outline:"none",boxSizing:"border-box",color:"#1e293b",background:"#fff" };
const IS  = (err) => ({ ...baseInput, border:`1.5px solid ${err?"#fca5a5":"#e2e8f0"}` });
const SS  = { ...baseInput, border:"1.5px solid #e2e8f0" };
const TA  = (err, rows=3) => ({ ...IS(err), resize:"vertical", minHeight:rows*28 });

function FL({ label, ch, span }) {
  return (
    <div style={{ gridColumn:span===2?"1/-1":"auto" }}>
      <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,
        marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>{label}</label>
      {ch}
    </div>
  );
}

function Card({ children, mb=16, p="20px 22px" }) {
  return <div style={{ background:"hsl(var(--card))",borderRadius:14,padding:p,
    border:"1.5px solid hsl(var(--border))",
    boxShadow:"0 2px 12px rgba(0,0,0,.04)",marginBottom:mb,color:"hsl(var(--foreground))" }}>{children}</div>;
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background:"#fef2f2",color:"#dc2626",borderRadius:9,
    padding:"10px 16px",marginBottom:14,fontSize:13,border:"1px solid #fecaca" }}>{msg}</div>;
}

function SuccessBox({ msg }) {
  if (!msg) return null;
  return <div style={{ background:"#f0fdf4",color:"#15803d",borderRadius:9,
    padding:"10px 16px",marginBottom:14,fontSize:13,border:"1px solid #bbf7d0",
    display:"flex",alignItems:"center",gap:8,fontWeight:600 }}>[OK] {msg}</div>;
}

// --- Flow Progress Bar ---------------------------------------------------------
function FlowBar({ status }) {
  const idx = FLOW_STEPS.findIndex(s=>s.key===status);
  return (
    <div style={{ background:"hsl(var(--card))",borderRadius:12,padding:"14px 20px",marginBottom:16,
      border:"1.5px solid hsl(var(--border))",
      boxShadow:"0 1px 8px rgba(0,0,0,.04)" }}>
      <div style={{ display:"flex",alignItems:"center" }}>
        {FLOW_STEPS.map((s,i) => {
          const done = i < idx, curr = i === idx;
          return (
            <div key={s.key} style={{ display:"flex",alignItems:"center",flex:i<FLOW_STEPS.length-1?1:"auto" }}>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5,flexShrink:0 }}>
                <div style={{ width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:done?13:curr?16:14,fontWeight:800,transition:"all .2s",
                  background:done?"#0b1929":curr?C.cyan:"#f1f5f9",
                  color:done||curr?"#fff":C.slateL,
                  boxShadow:curr?"0 0 0 4px rgba(0,188,212,.2)":"none" }}>
                  {done ? "v" : emojiOf(s.icon)}
                </div>
                <span style={{ fontSize:9,fontWeight:curr?800:400,letterSpacing:.5,whiteSpace:"nowrap",
                  color:curr?"#0b1929":done?"#475569":C.slateL }}>{s.label}</span>
              </div>
              {i < FLOW_STEPS.length-1 &&
                <div style={{ flex:1,height:2.5,borderRadius:2,margin:"0 6px",marginBottom:16,
                  background:done?"#0b1929":"#e2e8f0",transition:"background .3s" }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Sidebar ------------------------------------------------------------------
function Sidebar({ page, setPage, patients, collapsed, setCollapsed }) {
  const badgeCounts = {
    queue:    patients.filter(p=>p.status==="Queued").length,
    triage:   patients.filter(p=>p.status==="Queued").length,
    register: patients.filter(p=>p.status==="Triaged").length,
    billing:  patients.filter(p=>p.status==="Registered").length,
    doctor:   patients.filter(p=>p.status==="Billed"||p.status==="With Doctor").length,
    lab:      patients.filter(p=>p.status==="Lab Pending").length,
    pharmacy: patients.filter(p=>p.clerking?.orders?.rx?.drugs?.length>0 && !p.clerking?.dispensed).length,
    ward:     patients.filter(p=>p.admitted || p.status==="Pending Admission").length,
    finance:  (() => { try { const d=JSON.parse(localStorage.getItem("medicore_debtors_registry")||"[]"); return d.filter(x=>x.status==="suspended").length; } catch { return 0; } })(),
  };

  // Group NAV into sections for clean rendering
  const clinicalItems  = NAV.filter(n=>!["finance","schemes","inventory","procurement","catalogue","forecast","transfers","expiry"].includes(n.key));
  const financeItems   = NAV.filter(n=>["finance","schemes"].includes(n.key));
  const operationsItems= NAV.filter(n=>["inventory","procurement","catalogue","forecast","transfers","expiry"].includes(n.key));

  const NavItem = ({ n, i }) => {
    const active = page === n.key;
    const cnt    = badgeCounts[n.badge] || 0;
    const IconComponent = LUCIDE_ICONS[n.key];
    return (
      <Button
        variant="ghost"
        onClick={() => setPage(n.key)}
        className={`w-full justify-start text-left px-3 py-2 h-auto gap-3 rounded-lg mb-0.5 border-l-3 transition-all outline-none group/btn ${
          active
            ? "bg-cyan-500/15 text-cyan-400 border-cyan-400 font-semibold"
            : "text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-100"
        }`}
        id={`nav-item-${n.key}`}
      >
        {IconComponent ? (
          <IconComponent
            size={16}
            className={`shrink-0 transition-transform group-hover/btn:scale-105 ${
              active ? "text-cyan-400 opacity-100" : "text-slate-400 opacity-70 group-hover/btn:opacity-100"
            }`}
          />
        ) : (
          <span className="text-[15px] w-5 shrink-0 text-center">{emojiOf(n.emoji)}</span>
        )}
        <div className="flex-1 min-w-0">
          <div className={`text-[12px] leading-tight ${active ? "font-bold" : "font-medium"}`}>
            {n.label}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5 leading-none overflow-hidden text-ellipsis whitespace-nowrap">
            {n.desc}
          </div>
        </div>
        {cnt > 0 && (
          <ShadcnBadge
            variant={active ? "default" : "secondary"}
            className={`px-1.5 py-0 h-4 min-w-4 text-[9px] font-bold rounded-full ${
              active ? "bg-cyan-500 text-slate-950" : "bg-white/10 text-white"
            }`}
          >
            {cnt}
          </ShadcnBadge>
        )}
      </Button>
    );
  };

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize:8,color:"rgba(255,255,255,.22)",letterSpacing:2.5,textTransform:"uppercase",
      fontFamily:"monospace",padding:"6px 10px 4px",marginTop:4 }}>{children}</div>
  );

  return (
    <div
      id="main-sidebar"
      className={`shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden transition-all duration-300 ${
        collapsed ? "w-0 hidden" : "w-[220px] flex"
      }`}
      style={{
        background: `linear-gradient(180deg, ${C.navy} 0%, ${C.navyM} 60%, #0a1f38 100%)`,
        boxShadow: "4px 0 28px rgba(0, 0, 0, 0.45)",
      }}
    >

      {/* Logo */}
      <div className="p-4 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl shrink-0 bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-lg shadow-md shadow-cyan-500/20">
              🏥
            </div>
            <div>
              <div className="text-white font-extrabold text-[15px] tracking-tight leading-tight">MediCore</div>
              <div className="text-white/30 text-[8px] tracking-[0.2em] uppercase font-mono mt-0.5 leading-none">HMS · v3.0</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-7 w-7 rounded-md bg-white/5 text-slate-400 hover:bg-white/15 hover:text-white shrink-0"
            title="Collapse Sidebar"
            id="btn-collapse-sidebar"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Scrollable nav — all sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 medicore-nav">
        <style>{`
          .medicore-nav::-webkit-scrollbar{width:4px}
          .medicore-nav::-webkit-scrollbar-track{background:transparent}
          .medicore-nav::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:4px}
        `}</style>

        <SectionLabel>Modules</SectionLabel>
        {clinicalItems.map((n,i)=><NavItem key={n.key} n={n} i={i} />)}

        <div style={{ height:1,background:"rgba(255,255,255,.08)",margin:"8px 6px 4px",borderRadius:1 }} />
        <SectionLabel>Finance</SectionLabel>
        {financeItems.map((n,i)=><NavItem key={n.key} n={n} i={i} />)}

        <div style={{ height:1,background:"rgba(255,255,255,.08)",margin:"8px 6px 4px",borderRadius:1 }} />
        <SectionLabel>Operations</SectionLabel>
        {operationsItems.map((n,i)=><NavItem key={n.key} n={n} i={i} />)}
      </nav>

      {/* Footer */}
      <div className="p-3.5 border-t border-white/5 shrink-0" id="sidebar-footer">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-[13px] shrink-0 shadow-md">
            🩺
          </div>
          <div className="min-w-0">
            <div className="text-slate-200 text-[11px] font-semibold leading-tight">Admin User</div>
            <div className="text-slate-500 text-[9px] font-mono leading-none mt-0.5">
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// --- Top Bar ------------------------------------------------------------------
function TopBar({ title, subtitle, sub, action }) {
  const [theme, setLocalTheme] = useState(getTheme());

  useEffect(() => {
    themeListeners.add(setLocalTheme);
    return () => {
      themeListeners.delete(setLocalTheme);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const displaySubtitle = subtitle || sub;

  return (
    <div
      id="main-topbar"
      className="bg-card border-b border-border py-3 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm"
    >
      <div>
        <div className="text-[17px] font-extrabold text-foreground tracking-tight">{title}</div>
        {displaySubtitle && (
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {displaySubtitle}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="font-semibold text-xs border border-border bg-muted hover:bg-accent hover:text-foreground text-foreground flex items-center gap-1.5 transition-all outline-none"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          id="theme-toggle-btn"
        >
          <span>{theme === "dark" ? "☀️" : "🌙"}</span>
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </Button>
        {action}
      </div>
    </div>
  );
}

// --- Layout -------------------------------------------------------------------
function CopyButton({ text, label, style = {} }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (window.showToastNotification) {
        window.showToastNotification(`${label || "Code"} copied to clipboard`, "copy");
      }
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: "hsla(var(--foreground), 0.05)",
        border: "1px solid hsl(var(--border))",
        borderRadius: "5px",
        padding: "2px 6px",
        fontSize: "10px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        color: "hsl(var(--foreground))",
        opacity: 0.7,
        transition: "all 0.15s ease",
        verticalAlign: "middle",
        outline: "none",
        ...style
      }}
      title={`Copy ${label || "code"} to clipboard`}
      onMouseEnter={e => {
        e.currentTarget.style.opacity = 1;
        e.currentTarget.style.background = "hsla(var(--foreground), 0.1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity = 0.7;
        e.currentTarget.style.background = "hsla(var(--foreground), 0.05)";
      }}
    >
      <span>{copied ? "✓" : "📋"}</span>
      <span style={{ fontSize: "9px", fontWeight: "600" }}>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function Layout({ page, setPage, patients, children, overlay }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("medicore_sidebar_collapsed") === "true";
  });
  const [miniToasts, setMiniToasts] = useState([]);

  useEffect(() => {
    window.showToastNotification = (message, type = "success") => {
      const id = Date.now() + Math.random();
      setMiniToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setMiniToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };
    return () => {
      window.showToastNotification = undefined;
    };
  }, []);

  const handleCloseToast = (id) => {
    setMiniToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleToggle = (val) => {
    setCollapsed(val);
    localStorage.setItem("medicore_sidebar_collapsed", val ? "true" : "false");
  };

  return (
    <div
      id="main-layout-container"
      className="flex min-h-screen font-sans bg-background text-foreground selection:bg-cyan-500/30 select-none"
    >
      <Sidebar
        page={page}
        setPage={setPage}
        patients={patients}
        collapsed={collapsed}
        setCollapsed={handleToggle}
      />
      <div className="flex-1 flex flex-col bg-background min-w-0 overflow-auto relative">
        {collapsed && (
          <Button
            onClick={() => handleToggle(false)}
            className="fixed left-0 top-[14px] z-50 w-9 h-9 rounded-r-lg rounded-l-none bg-[#0b1929] text-[#00e5ff] border border-[#00bcd4] border-l-0 hover:bg-[#0d2744] hover:w-10 shadow-lg cursor-pointer flex items-center justify-center text-lg transition-all outline-none"
            title="Expand Sidebar"
            id="btn-expand-sidebar"
          >
            ☰
          </Button>
        )}
        {children}
      </div>
      {overlay}

      {/* Mini Toasts Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-[360px] w-[calc(100%-48px)] pointer-events-none">
        {miniToasts.map((t) => {
          const isCopy = t.type === "copy";
          const icon = isCopy ? "📋" : "✓";
          const borderClass = isCopy ? "border-cyan-500" : "border-emerald-500";
          const textAccent = isCopy ? "text-cyan-400" : "text-emerald-500";
          const textHeader = isCopy ? "Copied" : "Success";
          return (
            <div
              key={t.id}
              className={`pointer-events-auto bg-card border ${borderClass} rounded-xl p-3 shadow-xl flex items-center justify-between gap-3 backdrop-blur-md relative overflow-hidden transition-all duration-300`}
              style={{
                animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              id={`toast-${t.id}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCopy ? "bg-cyan-500/10 text-cyan-400" : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {icon}
                </span>
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${textAccent}`}>
                    {textHeader}
                  </div>
                  <div className="text-xs font-medium text-foreground mt-0.5 word-break-all">
                    {t.message}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCloseToast(t.id)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 rounded-md"
                id={`toast-close-${t.id}`}
              >
                ✕
              </Button>
              <div
                className={`absolute bottom-0 left-0 h-0.5 w-full ${isCopy ? "bg-cyan-400" : "bg-emerald-500"}`}
                style={{
                  animation: "toastProgress 4s linear forwards",
                }}
              />
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// --- Patient Banner -----------------------------------------------------------
function PatientBanner({ p }) {
  if (!p) return null;
  const sm = STATUS_META[p.status] || STATUS_META.Queued;
  const hue = avatarHue(p.id);
  return (
    <div style={{ background:"hsl(var(--card))",borderRadius:12,padding:"14px 18px",marginBottom:14,
      border:"1.5px solid hsl(var(--border))",
      boxShadow:"0 1px 8px rgba(0,0,0,.04)",display:"flex",justifyContent:"space-between",
      alignItems:"center",flexWrap:"wrap",gap:12,color:"hsl(var(--foreground))" }}>
      <div style={{ display:"flex",alignItems:"center",gap:13 }}>
        <div style={{ width:44,height:44,borderRadius:"50%",flexShrink:0,
          background:`hsl(${hue},50%,82%)`,color:`hsl(${hue},40%,28%)`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800 }}>
          {(p.firstName||"?")[0]}{(p.lastName||"?")[0]}
        </div>
        <div>
          <div style={{ fontWeight:800,color:"hsl(var(--foreground))",fontSize:15 }}>
            {p.firstName||"-"} {p.middleName||""} {p.lastName||"-"}
          </div>
          <div style={{ fontSize:11,color:"hsl(var(--muted-foreground))",fontFamily:"monospace",display:"flex",alignItems:"center",flexWrap:"wrap",gap:"4px" }}>
            <span>ID: {p.id||"Unregistered"}</span>
            <CopyButton text={p.id} label="Patient ID" style={{ padding: "1px 4px", fontSize: "9px" }} />
            <span style={{ color:"hsl(var(--border))",margin:"0 4px" }}>|</span>
            <span>MRN: {p.mrn||"-"}</span>
            <CopyButton text={p.mrn} label="MRN" style={{ padding: "1px 4px", fontSize: "9px" }} />
            <span style={{ color:"hsl(var(--border))",margin:"0 4px" }}>|</span>
            <span>Q: {p.queueNo}</span>
            <CopyButton text={p.queueNo} label="Queue No" style={{ padding: "1px 4px", fontSize: "9px" }} />
          </div>
        </div>
      </div>
      <div style={{ display:"flex",gap:16,alignItems:"center",flexWrap:"wrap" }}>
        {p.dateOfBirth && <div><div style={{ fontSize:9,color:"hsl(var(--muted-foreground))",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1 }}>Age</div><div style={{ fontSize:13,fontWeight:700 }}>{calcAge(p.dateOfBirth)} yrs</div></div>}
        {p.gender && <div><div style={{ fontSize:9,color:"hsl(var(--muted-foreground))",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1 }}>Sex</div><div style={{ fontSize:13,fontWeight:700 }}>{p.gender}</div></div>}
        {p.bloodGroup && <div><div style={{ fontSize:9,color:"hsl(var(--muted-foreground))",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1 }}>Blood</div><div style={{ fontSize:13,fontWeight:700 }}>{p.bloodGroup}</div></div>}
        {p.category && <div><div style={{ fontSize:9,color:"hsl(var(--muted-foreground))",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1 }}>Category</div><div style={{ fontSize:13,fontWeight:700 }}>{p.category}</div></div>}
        {(() => {
          const w = parseFloat(p.triage?.weight); const h = parseFloat(p.triage?.height);
          const bmi = (w && h) ? (w/((h/100)**2)).toFixed(1) : null;
          if (!bmi) return null;
          const bmiLabel = bmi>=40?"Morbidly Obese":bmi>=35?"Obese II":bmi>=30?"Obese":bmi>=25?"Overweight":bmi>=18.5?"Normal":bmi>=16?"Underweight":"Sev. Underweight";
          const bmiColor = bmi>=30?"#dc2626":bmi>=25?"#b45309":bmi<16?"#dc2626":bmi<18.5?"#b45309":"#059669";
          const bmiBg   = bmi>=30?"#fee2e2":bmi>=25?"#fef3c7":bmi<16?"#fee2e2":bmi<18.5?"#fef3c7":"#dcfce7";
          return (
            <div style={{ display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:8,background:bmiBg,border:`1.5px solid ${bmiColor}44` }}>
              <div>
                <div style={{ fontSize:8,color:bmiColor,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8,fontWeight:700 }}>BMI</div>
                <div style={{ fontSize:16,fontWeight:900,color:bmiColor,lineHeight:1 }}>{bmi}</div>
              </div>
              <div style={{ fontSize:10,fontWeight:700,color:bmiColor }}>{bmiLabel}</div>
            </div>
          );
        })()}
        <Badge label={p.status} color={sm.color} bg={sm.bg} dot={sm.dot} sm />
      </div>
    </div>
  );
}

// --- Billing / Reference Number Strip -----------------------------------------
// Shows all reference numbers for a patient in a consistent coloured strip.
// Pass the patient object; only numbers that exist are rendered.
// Clicking cards copies their values.
function RefNumStrip({ p }) {
  if (!p) return null;
  const nums = [
    p.billing?.invoiceNo   && { label:"Invoice",      val:p.billing.invoiceNo,   bg:"#eff6ff", border:"#bfdbfe", col:"#1d4ed8",
                                  badge: p.billing.paid
                                    ? { txt:"PAID",   bg:"#dcfce7", col:"#15803d" }
                                    : { txt:"UNPAID", bg:"#fef3c7", col:"#b45309" } },
    p.billing?.receiptNo   && { label:"Receipt",      val:p.billing.receiptNo,   bg:"#f0fdf4", border:"#bbf7d0", col:"#15803d" },
    p.clerking?.consNo     && { label:"Consultation", val:p.clerking.consNo,     bg:"#f5f3ff", border:"#ddd6fe", col:"#7c3aed" },
    p.clerking?.labNo      && { label:"Lab Report",   val:p.clerking.labNo,      bg:"#f0fdfa", border:"#99f6e4", col:"#0f766e" },
    p.clerking?.rxNo       && { label:"Rx Dispensed", val:p.clerking.rxNo,       bg:"#f0fdf4", border:"#86efac", col:"#15803d",
                                  badge: { txt:"DISPENSED", bg:"#dcfce7", col:"#166534" } },
    p.billing?.billedBy    && { label:"Billed By",    val:p.billing.billedBy,    bg:"#f8fafc", border:"#e2e8f0", col:"#475569",
                                  sub: p.billing.billedAt ? new Date(p.billing.billedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : null },
  ].filter(Boolean);

  if (!nums.length) return null;

  return (
    <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:14 }}>
      {nums.map(n=>(
        <div key={n.label} style={{ background:n.bg,border:`1px solid ${n.border}`,borderRadius:8,
          padding:"5px 12px",display:"flex",alignItems:"center",gap:7 }}>
          <div>
            <div style={{ fontSize:8,fontFamily:"monospace",color:n.col,textTransform:"uppercase",
              letterSpacing:1.2,opacity:.75,marginBottom:1 }}>{n.label}</div>
            <div style={{ fontSize:13,fontWeight:800,color:n.col,fontFamily:"monospace",lineHeight:1,display:"flex",alignItems:"center" }}>
              <span>{n.val}</span>
              {n.label !== "Billed By" && (
                <CopyButton text={n.val} label={n.label} style={{
                  background: "transparent",
                  border: "none",
                  marginLeft: "4px",
                  padding: "1px 2px",
                  borderRadius: "3px",
                  color: n.col
                }} />
              )}
            </div>
            {n.sub && <div style={{ fontSize:9,color:n.col,opacity:.6,fontFamily:"monospace",marginTop:1 }}>{n.sub}</div>}
          </div>
          {n.badge && (
            <span style={{ background:n.badge.bg,color:n.badge.col,borderRadius:4,
              padding:"1px 6px",fontSize:9,fontWeight:800,letterSpacing:.5,flexShrink:0 }}>
              {n.badge.txt}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Empty select state --------------------------------------------------------
function EmptyState({ icon, msg, btn, onBtn }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:14,marginTop:64 }}>
      <div style={{ fontSize:56,lineHeight:1 }}>{icon}</div>
      <div style={{ fontSize:15,color:C.slate,fontWeight:600,textAlign:"center",maxWidth:360 }}>{msg}</div>
      {onBtn && <button onClick={onBtn} style={{ padding:"10px 22px",border:"none",borderRadius:9,background:"#0b1929",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit" }}>{btn}</button>}
    </div>
  );
}

// --- Skeleton Loading States ---------------------------------------------------
function Skeleton({ width="100%", height="16px", borderRadius="6px", style={}, className="" }) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "hsla(var(--foreground), 0.08)",
        flexShrink: 0,
        ...style
      }}
    />
  );
}

function SkeletonStats({ count = 6 }) {
  return (
    <div style={{ display:"grid",gridTemplateColumns:`repeat(${count},1fr)`,gap:11,marginBottom:20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background:"hsl(var(--card))", border:"1.5px solid hsl(var(--border))", borderRadius:11, padding:"11px 13px", display:"flex", alignItems:"center", gap:10 }}>
          <Skeleton width="36px" height="36px" borderRadius="9px" />
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
            <Skeleton width="40%" height="20px" />
            <Skeleton width="70%" height="11px" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonPatientRow() {
  return (
    <div style={{ background:"hsl(var(--card))", borderRadius:12, padding:"14px 18px", marginBottom:14,
      border:"1.5px solid hsl(var(--border))", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:13, flex: 1 }}>
        <Skeleton width="44px" height="44px" borderRadius="50%" />
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
          <Skeleton width="30%" height="15px" />
          <Skeleton width="20%" height="11px" />
        </div>
      </div>
      <div style={{ display:"flex", gap:16, alignItems:"center" }}>
        <Skeleton width="60px" height="13px" />
        <Skeleton width="50px" height="13px" />
        <Skeleton width="80px" height="24px" borderRadius="8px" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 4 }) {
  return (
    <div style={{ display:"flex", flexDirection:"column" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPatientRow key={i} />
      ))}
    </div>
  );
}

function SkeletonTable({ rows = 4, cols = 4 }) {
  return (
    <div style={{ background:"hsl(var(--card))", border:"1.5px solid hsl(var(--border))", borderRadius:12, padding:"16px", marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, borderBottom:"1.5px solid hsl(var(--border))", paddingBottom:12 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${80 / cols}%`} height="16px" />
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={colIndex} width={`${80 / cols}%`} height="14px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonPage({ type = "list" }) {
  return (
    <div style={{ padding:"20px 26px" }}>
      {type === "dashboard" || type === "list" ? (
        <>
          <SkeletonStats />
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginTop:20 }}>
            <div>
              <Skeleton width="150px" height="18px" style={{ marginBottom:14 }} />
              <SkeletonList count={4} />
            </div>
            <div>
              <Skeleton width="120px" height="18px" style={{ marginBottom:14 }} />
              <div style={{ background:"hsl(var(--card))", border:"1.5px solid hsl(var(--border))", borderRadius:12, padding:18, display:"flex", flexDirection:"column", gap:12 }}>
                <Skeleton width="100%" height="40px" />
                <Skeleton width="90%" height="14px" style={{ marginTop: 8 }} />
                <Skeleton width="80%" height="14px" style={{ marginTop: 8 }} />
                <Skeleton width="100%" height="32px" style={{ marginTop:14, borderRadius:8 }} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16 }}>
          <div>
            <Skeleton width="100%" height="220px" style={{ borderRadius:12, marginBottom:16 }} />
            <Skeleton width="100%" height="120px" style={{ borderRadius:12 }} />
          </div>
          <div>
            <SkeletonTable rows={5} cols={5} />
          </div>
        </div>
      )}
    </div>
  );
}


export { C, baseInput, IS, SS, TA };
export { CatalogueSearch };
export { Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar };
export { Sidebar, TopBar, Layout };
export { PatientBanner, RefNumStrip, EmptyState, CopyButton };
export { Skeleton, SkeletonStats, SkeletonPatientRow, SkeletonList, SkeletonTable, SkeletonPage };
