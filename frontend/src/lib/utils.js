// Auto-extracted from HMS.jsx — helpers, STATUS_META, CASH_METHODS, checkPharmCleared
const STATUS_META = {
  Queued:              { bg:"#f1f5f9", color:"#475569", dot:"#94a3b8" },
  Triaged:             { bg:"#ffedd5", color:"#c2410c", dot:"#f97316" },
  Registered:          { bg:"#fff9c4", color:"#b45309", dot:"#f59e0b" },
  Billed:              { bg:"#dbeafe", color:"#1d4ed8", dot:"#3b82f6" },
  "With Doctor":       { bg:"#f3e8ff", color:"#7e22ce", dot:"#a855f7" },
  "Lab Pending":       { bg:"#fef3c7", color:"#d97706", dot:"#f59e0b" },
  "Results Ready":     { bg:"#cffafe", color:"#0e7490", dot:"#06b6d4" },
  "Pending Admission": { bg:"#fdf2ff", color:"#9333ea", dot:"#a855f7" },
  Admitted:            { bg:"#e0f2fe", color:"#0369a1", dot:"#0ea5e9" },
  Completed:           { bg:"#dcfce7", color:"#15803d", dot:"#22c55e" },
};

const NAV = [
  { key:"queue",    label:"Queue",        emoji:"clip", desc:"Walk-in & tickets",      badge:"queue"    },
  { key:"triage",   label:"Triage",       emoji:"steth", desc:"Vitals & ESI level",     badge:"triage"   },
  { key:"register", label:"Registration", emoji:"note", desc:"Full patient record",     badge:"register" },
  { key:"billing",  label:"Billing",      emoji:"card", desc:"Invoice & payment",       badge:"billing"  },
  { key:"doctor",   label:"Doctor",       emoji:"steth", desc:"Clerk, diagnose, order", badge:"doctor"   },
  { key:"lab",      label:"Laboratory",   emoji:"lab", desc:"Results & reporting",     badge:"lab"      },
  { key:"pharmacy", label:"Pharmacy",     emoji:"pill", desc:"Dispense & verify drugs", badge:"pharmacy" },
  { key:"ward",     label:"Ward Mgmt",    emoji:"hosp", desc:"Admission & beds",        badge:"ward"     },
  { key:"reports",    label:"Reports",       emoji:"chart", desc:"Analytics & audit",       badge:""         },
  { key:"analytics",  label:"Pat. Analytics",emoji:"📊",   desc:"Demographics & trends",   badge:""         },
  { key:"finance",  label:"Finance",      emoji:"bank", desc:"Debtors & credit",        badge:"finance"  },
  { key:"schemes",  label:"Schemes",      emoji:"shield", desc:"Benefit plans & co-pay",  badge:""         },
  { key:"inventory",   label:"Inventory",   emoji:"box",  desc:"Stock & supply chain",    badge:"inventory"   },
  { key:"procurement", label:"Procurement", emoji:"cart", desc:"POs & supplier mgmt",     badge:""             },
  { key:"history",     label:"Pat. History",emoji:"📋",  desc:"Clinical records & visits", badge:""            },
  { key:"catalogue",   label:"Catalogue",   emoji:"📖",  desc:"Unified price list",         badge:""            },
  { key:"forecast",    label:"Forecasting", emoji:"📈",  desc:"Demand & reorder analysis",  badge:""            },
  { key:"transfers",   label:"Transfers",   emoji:"🔄",  desc:"Inter-facility batch moves",  badge:""            },
  { key:"expiry",      label:"Expiry Mgmt", emoji:"⏰",  desc:"Alerts, disposal & wastage",   badge:""            },
];

// --- Helpers -------------------------------------------------------------------
// Map ASCII icon codes back to emoji for JSX rendering
const ICON_EMOJI = {
  ticket:"🎫", steth:"🩺",  note:"📝",  card:"💳",
  lab:"🧪",    clip:"📋",   hosp:"🏥",  bed:"🛏",
  check:"[OK]",  chart:"📊",  bank:"🏦",  shield:"🛡",
  pill:"💊",   xray:"🩻",   dna:"🧬",   rcpt:"🧾",
  box:"📦",    pkg:"📦",   cart:"🛒",
  doc:"📄",    corp:"🏢",   govt:"🏛",  bolt:"",
  baby:"👶",   tooth:"🦷",
};
const emojiOf = (code) => ICON_EMOJI[code] || code;

const todayStr  = () => new Date().toISOString().split("T")[0];
const timeNow   = () => new Date().toTimeString().slice(0,5);
const pad       = (n, l=5) => String(n).padStart(l,"0");
const calcAge   = (d) => !d ? "-" : Math.floor((new Date()-new Date(d))/(365.25*24*3600*1000));
const fmtN      = (n) => "KES "+Number(n).toLocaleString();
const avatarHue = (id) => parseInt((id||"0").replace(/\D/g,"").slice(-5)||"0")*47%360;
// Generate a module billing/reference number: genNo("LAB",3) returns "LAB-26-00003"
function genNo(prefix, idx) {
  return prefix+"-"+new Date().getFullYear().toString().slice(2)+"-"+pad(idx);
}

// -- Pharmacy billing clearance check ------------------------------------------
const CASH_METHODS   = ["Cash","M-Pesa","POS / Card","Bank Transfer","Cheque"];
const SCHEME_METHODS = ["NHIF","SHA / Insurance","Corporate Account"];
function checkPharmCleared(pat) {
  const billing  = pat && pat.billing;
  const category = pat && pat.category;
  if (!billing || !billing.invoiceNo)
    return { cleared:false, reason:"No invoice has been raised for this patient. Please complete billing first.", paymentClass:"none" };

  const method = billing.paymentMethod || "";
  const isCash   = CASH_METHODS.includes(method)   || category==="Cash";
  const isScheme = SCHEME_METHODS.includes(method) || category==="Insurance" || category==="Corporate";

  const hasDrugItem = (billing.items||[]).some(function(i) {
    return i.cat==="pharmacy" || i.id==="s13" ||
      (i.name && i.name.toLowerCase().indexOf("pharmac") >= 0) ||
      (i.name && i.name.toLowerCase().indexOf("medic") >= 0) ||
      (i.name && i.name.toLowerCase().indexOf("drug") >= 0);
  });

  if (!hasDrugItem)
    return { cleared:false, reason:"Medications have not been added to the invoice. Please add Pharmacy/Medications to the bill before dispensing.", paymentClass: isCash?"cash":isScheme?"scheme":"none" };

  if (isCash) {
    if (!billing.paid)
      return { cleared:false, reason:"Cash payment has not been receipted. Patient must pay before drugs can be dispensed.", paymentClass:"cash" };
    return { cleared:true, reason:"Cash payment confirmed - receipt issued.", paymentClass:"cash" };
  }

  if (isScheme)
    return { cleared:true, reason:(method||category)+" scheme - invoice prepared. Dispense authorised.", paymentClass:"scheme" };

  return { cleared:false, reason:"Payment method not recognised. Please verify billing before dispensing.", paymentClass:"none" };
}

// --- UI Atoms -----------------------------------------------------------------

export { STATUS_META, NAV, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue };
