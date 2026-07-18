import { useState, useEffect, useMemo, useRef } from "react";
import { SEED_PATIENTS, SEED_INVENTORY, SEED_RECALLS, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS } from "./data/seedData";
import { EMPTY_REG, SPECIALTIES, WARDS, TRIAGE_LEVELS } from "./data/constants";
import { STATUS_META, timeNow, genNo, fmtN, calcAge, avatarHue, checkPharmCleared, emojiOf, CASH_METHODS, SCHEME_METHODS, todayStr, pad } from "./lib/utils";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "./data/referenceData";
import { C, Layout, TopBar, Sidebar, PatientBanner, RefNumStrip, EmptyState, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, CatalogueSearch, baseInput, IS, SS, TA, SkeletonPage } from "./components/SharedComponents";
import DebtorsAccount from "./components/DebtorsAccount";
import SchemesPage from "./components/SchemesPage";
import SpecimenSVG from "./components/SpecimenSVG";
import QueuePage from "./pages/QueuePage";
import TriagePage from "./pages/TriagePage";
import RegisterPage from "./pages/RegisterPage";
import BillingPage from "./pages/BillingPage";
import DoctorPage from "./pages/DoctorPage";
import LabPage from "./pages/LabPage";
import PharmacyPage from "./pages/PharmacyPage";
import WardPage from "./pages/WardPage";
import ReportsPage from "./pages/ReportsPage";
import FinancePage from "./pages/FinancePage";
import SchemesRoutePage from "./pages/SchemesRoutePage";
import InventoryPage from "./pages/InventoryPage";
import ProcurementPage from "./pages/ProcurementPage";
import HistoryPage from "./pages/HistoryPage";
import CataloguePage from "./pages/CataloguePage";
import ForecastPage from "./pages/ForecastPage";
import TransfersPage from "./pages/TransfersPage";
import ExpiryPage from "./pages/ExpiryPage";
import AnalyticsPage from "./pages/AnalyticsPage";

const STORAGE_KEY = "medicore_hms_local_store";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withClientIds(items, key) {
  return items.map((item) => ({ ...item, id: item.id || item[key] }));
}

function defaultStore() {
  return {
    patients: clone(SEED_PATIENTS),
    inventory: withClientIds(clone(SEED_INVENTORY), "itemId"),
    transactions: clone(SEED_INV_TXNS),
    suppliers: withClientIds(clone(SEED_SUPPLIERS), "supplierId"),
    purchaseOrders: withClientIds(clone(SEED_POS), "poId"),
  };
}

function readStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return stored ? { ...defaultStore(), ...stored } : defaultStore();
  } catch {
    return defaultStore();
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return store;
}

function upsertBy(items, key, value, patch) {
  return items.map((item) => item[key] === value || item.id === value ? { ...item, ...patch } : item);
}

function receivePurchaseOrder(store, poId, body) {
  const po = store.purchaseOrders.find((item) => item.id === poId || item.poId === poId);
  if (!po) return null;

  const today = new Date().toISOString().split("T")[0];
  const receivedItems = body?.items || [];
  const nextItems = (po.items || []).map((item, idx) => {
    const received = receivedItems[idx] || {};
    const qty = Math.max(0, Math.min(Number(received.qty || 0), (item.qty || 0) - (item.received || 0)));
    if (qty > 0) {
      const inventoryItem = store.inventory.find((inv) => inv.id === item.itemId || inv.itemId === item.itemId);
      if (inventoryItem) {
        const batchNo = received.batchNo || item.batchNo || `BATCH-${Date.now()}`;
        const batches = inventoryItem.batches || [];
        const existing = batches.find((batch) => batch.batchNo === batchNo);
        if (existing) {
          existing.qty += qty;
        } else {
          batches.push({
            batchNo,
            qty,
            receivedAt: today,
            expiryDate: received.expiryDate || item.expiryDate || "",
            unitCost: Number(received.unitCost ?? item.unitCost ?? 0) || 0,
            recalled: false,
          });
        }
        inventoryItem.batches = batches;
      }

      store.transactions.unshift({
        id: `TXN-${Date.now()}-${idx}`,
        txnId: `TXN-${Date.now()}-${idx}`,
        type: "in",
        itemId: item.itemId,
        qty,
        batchNo: received.batchNo || item.batchNo || "",
        date: today,
        reference: poId,
        department: "Procurement",
        notes: `Received from PO ${poId}`,
        unitCost: Number(received.unitCost ?? item.unitCost ?? 0) || 0,
        performedBy: body?.receivedBy || "",
      });
    }
    return { ...item, received: (item.received || 0) + qty };
  });

  const allReceived = nextItems.every((item) => Number(item.received || 0) >= Number(item.qty || 0));
  const anyReceived = nextItems.some((item) => Number(item.received || 0) > 0);
  const updated = { ...po, items: nextItems, status: allReceived ? "received" : anyReceived ? "partially_received" : po.status };
  store.purchaseOrders = upsertBy(store.purchaseOrders, "poId", poId, updated);
  return updated;
}

async function apiCall(path, method = "GET", body = null) {
  const store = readStore();
  const [cleanPath] = path.split("?");
  const parts = cleanPath.split("/").filter(Boolean);
  let result = null;

  if (method === "GET" && cleanPath === "/hms/patients") result = store.patients;
  if (method === "POST" && cleanPath === "/hms/patients") {
    const patient = { ...body, id: body.id || body.queueNo };
    store.patients = [patient, ...store.patients];
    result = patient;
  }
  if (method === "PUT" && parts[1] === "patients") {
    store.patients = upsertBy(store.patients, "queueNo", parts[2], body);
    result = store.patients.find((item) => item.queueNo === parts[2] || item.patientId === parts[2]);
  }
  if (method === "DELETE" && parts[1] === "patients") {
    store.patients = store.patients.filter((item) => item.queueNo !== parts[2]);
    result = true;
  }

  if (method === "GET" && cleanPath === "/hms/inventory") result = store.inventory;
  if (method === "POST" && cleanPath === "/hms/inventory") {
    const item = { ...body, id: body.itemId };
    store.inventory = [...store.inventory, item];
    result = item;
  }
  if (method === "POST" && parts[1] === "inventory" && parts[3] === "transaction") {
    const item = store.inventory.find((inv) => inv.id === parts[2] || inv.itemId === parts[2]);
    if (item) {
      const batches = item.batches || [];
      if (body.type === "in") {
        const existing = batches.find((batch) => batch.batchNo === body.batchNo);
        if (existing) existing.qty += Number(body.qty || 0);
        else batches.push({ batchNo: body.batchNo, qty: Number(body.qty || 0), receivedAt: body.receivedAt || todayStr(), expiryDate: body.expiryDate || "", unitCost: Number(body.unitCost || 0), recalled: false });
      }
      if (body.type === "out") {
        let remaining = Number(body.qty || 0);
        for (const batch of batches.filter((batch) => !batch.recalled && batch.qty > 0)) {
          const taken = Math.min(batch.qty, remaining);
          batch.qty -= taken;
          remaining -= taken;
          if (remaining <= 0) break;
        }
      }
      item.batches = batches;
    }
    const transaction = { id: `TXN-${Date.now()}`, txnId: `TXN-${Date.now()}`, itemId: parts[2], date: todayStr(), ...body };
    store.transactions = [transaction, ...store.transactions];
    result = { item, transaction };
  }
  if (method === "GET" && cleanPath === "/hms/inventory-transactions") result = store.transactions;

  if (method === "GET" && cleanPath === "/hms/suppliers") result = store.suppliers;
  if (method === "POST" && cleanPath === "/hms/suppliers") {
    const supplier = { ...body, id: body.supplierId || body.id || `SUP-${Date.now()}` };
    store.suppliers = [...store.suppliers, supplier];
    result = supplier;
  }
  if (method === "PUT" && parts[1] === "suppliers") {
    store.suppliers = upsertBy(store.suppliers, "supplierId", parts[2], body);
    result = store.suppliers.find((item) => item.supplierId === parts[2] || item.id === parts[2]);
  }
  if (method === "DELETE" && parts[1] === "suppliers") {
    store.suppliers = store.suppliers.filter((item) => item.supplierId !== parts[2] && item.id !== parts[2]);
    result = true;
  }

  if (method === "GET" && cleanPath === "/hms/purchase-orders") result = store.purchaseOrders;
  if (method === "POST" && cleanPath === "/hms/purchase-orders") {
    const po = { ...body, id: body.poId || body.id || `PO-${Date.now()}` };
    store.purchaseOrders = [po, ...store.purchaseOrders];
    result = po;
  }
  if (method === "PUT" && parts[1] === "purchase-orders") {
    store.purchaseOrders = upsertBy(store.purchaseOrders, "poId", parts[2], body);
    result = store.purchaseOrders.find((item) => item.poId === parts[2] || item.id === parts[2]);
  }
  if (method === "POST" && parts[1] === "purchase-orders" && parts[3] === "receive") {
    result = receivePurchaseOrder(store, parts[2], body);
  }
  if (method === "DELETE" && parts[1] === "purchase-orders") {
    store.purchaseOrders = store.purchaseOrders.filter((item) => item.poId !== parts[2] && item.id !== parts[2]);
    result = true;
  }

  writeStore(store);
  return clone(result);
}

export default function HMS() {
  const [page,     setRawPage]  = useState("queue");
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingPageName, setLoadingPageName] = useState("queue");
  const pageTimerRef = useRef(null);

  const setPage = (p) => {
    if (pageTimerRef.current) {
      clearTimeout(pageTimerRef.current);
    }
    setLoadingPageName(p);
    setIsPageLoading(true);
    setRawPage(p);
    const delay = p === "reports" || p === "finance" || p === "analytics" || p === "forecast" ? 350 : 200;
    pageTimerRef.current = setTimeout(() => {
      setIsPageLoading(false);
    }, delay);
  };
  // Finance module context (provider pre-selection when navigating from Debtors to Schemes)
  const [finCtx,   setFinCtx]   = useState({ providerId: null });
  const [patients, setPatients] = useState(SEED_PATIENTS);
  const [active,   setActive]   = useState(null);
  const [search,   setSearch]   = useState("");
  const [fStatus,  setFStatus]  = useState("All");
  const [delId,    setDelId]    = useState(null);

  // -- Global success toast --
  const [toast, setToast] = useState(null);
  const showToast = (title, msg, icon, onClose) => setToast({ title, msg, icon, onClose });
  const closeToast = () => { const cb = toast?.onClose; setToast(null); if(cb) cb(); };

  // -- Toast modal JSX (defined here so it's available to all page returns below) --
  const ToastModal = toast ? (
    <div style={{ position:"fixed",inset:0,background:"rgba(7,24,40,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(2px)" }}>
      <div style={{ background:"#fff",borderRadius:20,padding:"36px 40px",maxWidth:420,width:"90%",
        boxShadow:"0 32px 80px rgba(0,0,0,.35)",textAlign:"center",animation:"fadeUp .25s ease" }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#059669,#047857)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 18px" }}>
          {emojiOf(toast.icon)}
        </div>
        <div style={{ fontSize:9,fontWeight:700,color:"#059669",letterSpacing:2.5,textTransform:"uppercase",fontFamily:"monospace",marginBottom:8 }}>[OK] Success</div>
        <div style={{ fontSize:22,fontWeight:800,color:"#0b1929",marginBottom:10,letterSpacing:.2 }}>
          {toast.title}
        </div>
        <div style={{ fontSize:14,color:C.slate,lineHeight:1.7,marginBottom:28 }}>
          {toast.msg}
        </div>
        <button onClick={closeToast}
          style={{ padding:"13px 40px",border:"none",borderRadius:11,cursor:"pointer",fontFamily:"inherit",
            fontSize:15,fontWeight:700,color:"#fff",width:"100%",
            background:"linear-gradient(135deg,#059669,#047857)",
            boxShadow:"0 4px 16px rgba(5,150,105,.35)",letterSpacing:.3 }}>
          v Continue
        </button>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  ) : null;

  // -- QUEUE walk-in form --
  const [qFirstName, setQFirstName] = useState("");
  const [qSurname,   setQSurname]   = useState("");
  const [qPhone, setQPhone] = useState("");
  const [qErr,   setQErr]   = useState("");
  const [qModal, setQModal] = useState(false);
  const [kioskStep,    setKioskStep]    = useState("select"); // select | walkin-service | walkin-payment | walkin-form | new-patient | existing
  const [kioskService, setKioskService] = useState(null);     // pharmacy | lab | radiology
  const [kioskPayment, setKioskPayment] = useState(null);     // cash | credit
  const [kioskExSearch,setKioskExSearch]= useState("");
  const [kioskExPick,  setKioskExPick]  = useState(null);

  // -- TRIAGE --
  const [trForm, setTrForm] = useState({ level:"3",bp:"",pulse:"",temp:"",rr:"",spo2:"",gcs:"",weight:"",height:"",chiefComplaint:"",primaryCode:"",primaryDx:"",secondaryCode:"",secondaryDx:"",triageNurse:"",triageTime:timeNow() });
  const [trErr,  setTrErr]  = useState("");

  // -- REGISTRATION --
  const [regTab,  setRegTab]  = useState(0);
  const [regForm, setRegForm] = useState(EMPTY_REG);
  const [regErr,  setRegErr]  = useState("");
  const [regSaving, setRegSaving] = useState(false);

  // -- BILLING --
  const [bItems,  setBItems]  = useState([]);
  const [bDisc,   setBDisc]   = useState(0);
  const [bMethod, setBMethod] = useState("Cash");
  const [bNote,   setBNote]   = useState("");
  const [bErr,    setBErr]    = useState("");
  const [bTab,    setBTab]    = useState("consult"); // consult, lab, radiology, or pharmacy
  const [bOfficer,setBOfficer]= useState(""); // billing officer / cashier name

  // -- DOCTOR --
  const [docTab,  setDocTab]  = useState(0);
  const [clk, setClk] = useState({
    presentingComplaint:"", historyPC:"", pastMedHistory:"", surgicalHistory:"",
    familyHistory:"", socialHistory:"", allergies:"", currentMeds:"", reviewSystems:"",
    generalExam:"", cvExam:"", respExam:"", abdExam:"", neuroExam:"", mskExam:"", otherExam:"",
    provisionalDx:"", provisionalCode:"", finalDx:"", finalCode:"", differentials:"",
    planNotes:"", disposition:"OPD Follow-up", doctorName:"", doctorReg:"",
  });
  const [docErr,     setDocErr]     = useState("");
  const [docSaved,   setDocSaved]   = useState(false);
  // Admission request form (shown when disposition is Admit)
  const [admitReqForm, setAdmitReqForm] = useState({
    wardPref:"", urgency:"Routine", isolation:false, oxygenNeeded:false,
    ivAccess:false, monitoring:"Standard", specialNeeds:"", diet:"Regular",
    nursingNeeds:"", infectionControl:"None",
  });
  const [labSel,     setLabSel]     = useState([]);
  const [labSearch,  setLabSearch]  = useState("");
  const [labUrgency, setLabUrgency] = useState("Routine");
  const [labNotes,   setLabNotes]   = useState("");
  const [radSel,     setRadSel]     = useState([]);
  const [radUrgency, setRadUrgency] = useState("Routine");
  const [radNotes,   setRadNotes]   = useState("");
  const [rxList,     setRxList]     = useState([]);
  const [rxForm,     setRxForm]     = useState({ name:"", dose:"", route:"Oral", freq:"BD (Twice daily)", duration:"7 days", instructions:"" });
  const [consSpec,   setConsSpec]   = useState(SPECIALTIES[0]);
  const [consUrgency,setConsUrgency]= useState("Routine");
  const [consReason, setConsReason] = useState("");

  // -- LAB MODULE state --
  const [labActive,    setLabActive]    = useState(null);
  const [labStep,      setLabStep]      = useState("specimen"); // specimen, results, or summary
  const [labScientist, setLabScientist] = useState("");
  const [labResults,   setLabResults]   = useState({}); // { testId: { value, unit, flag, note } }
  const [labSaved,     setLabSaved]     = useState(false);
  const [labModErr,    setLabModErr]    = useState("");
  const [labViewModal, setLabViewModal] = useState(null); // { pat, testId }

  // -- INVENTORY MODULE state --
  const [invItems,  setInvItems]  = useState(SEED_INVENTORY);
  const [invTxns,   setInvTxns]   = useState(SEED_INV_TXNS);
  const [invTab,    setInvTab]    = useState("overview");
  const [invSearch, setInvSearch] = useState("");
  const [invCat,    setInvCat]    = useState("All");
  const [invModal,  setInvModal]  = useState(null); // { type:"stock-in"|"stock-out"|"add-item"|"history", item? }
  const [invForm,   setInvForm]   = useState({});
  const [invErr,    setInvErr]    = useState("");
  const [invMode,   setInvMode]   = useState("FEFO");  // "FEFO" | "FIFO"
  const [invRecalls,setInvRecalls] = useState(SEED_RECALLS);
  const [dispenseLog,setDispenseLog] = useState(SEED_DISPENSE_LOG);
  const [invRecallModal,setInvRecallModal] = useState(null); // recall object → show patient list

  // Procurement module state
  const [procSuppliers, setProcSuppliers] = useState(SEED_SUPPLIERS);
  const [procPOs,       setProcPOs]       = useState(SEED_POS);
  const [procTab,       setProcTab]       = useState(0);   // 0=Overview 1=POs 2=Suppliers 3=Receive
  const [procModal,     setProcModal]     = useState(null);
  const [procForm,      setProcForm]      = useState({});
  const [procErr,       setProcErr]       = useState("");
  const [supSearch,     setSupSearch]     = useState("");
  const [supEditId,     setSupEditId]     = useState(null);
  const [poDetailPO,    setPoDetailPO]    = useState(null);
  const [analyticsSupId,setAnalyticsSupId]= useState("all");
  // Patient History page state
  const [histSearch,    setHistSearch]    = useState("");
  const [histPatient,   setHistPatient]   = useState(null);
  const [histTab,       setHistTab]       = useState("overview");
  const [histFilter,    setHistFilter]    = useState("all");
  const [analTab,       setAnalTab]       = useState("demographics");
  // Master Catalogue page state
  const [catSearch,     setCatSearch]     = useState("");
  const [catTab,        setCatTab]        = useState("pharmacy");
  const [catEditItem,   setCatEditItem]   = useState(null);
  const [catEditPrice,  setCatEditPrice]  = useState("");
  // Stock Forecasting page state
  const [fcastSearch,   setFcastSearch]   = useState("");
  const [fcastCat,      setFcastCat]      = useState("All");
  // Batch Transfers page state
  const [transfers,     setTransfers]     = useState([]);
  const [tfSearch,      setTfSearch]      = useState("");
  const [tfModal,       setTfModal]       = useState(null); // "new" | "detail"
  const [tfForm,        setTfForm]        = useState({});
  const [tfErr,         setTfErr]         = useState("");
  const [tfDetail,      setTfDetail]      = useState(null);
  // Expiry Tracking page state
  const [expiryTab,     setExpiryTab]     = useState("dashboard");
  const [expirySearch,  setExpirySearch]  = useState("");
  const [expiryCat,     setExpiryCat]     = useState("All");
  const [disposals,     setDisposals]     = useState([]);
  const [dispModal,     setDispModal]     = useState(null); // "new"|"approve"|"complete"|"view"
  const [dispForm,      setDispForm]      = useState({});
  const [dispErr,       setDispErr]       = useState("");
  const [dispDetail,    setDispDetail]    = useState(null);
  const [alertLog,      setAlertLog]      = useState([]);
  const [procSearch,    setProcSearch]    = useState("");
  const [manualSearch,  setManualSearch]  = useState(""); // cross-page manual patient search
  const [procStatusF,   setProcStatusF]   = useState("all");
  const [procGRN,       setProcGRN]       = useState({});  // poId→{itemIdx→qty}
  const [procGRNPO,     setProcGRNPO]     = useState(null); // selected PO for GRN

  // -- PHARMACY MODULE state --
  const [pharmActive,  setPharmActive]  = useState(null);
  const [verifyChecks, setVerifyChecks] = useState({});
  const [pharmNotes,   setPharmNotes]   = useState("");
  const [pharmacist,   setPharmacist]   = useState("");
  const [pharmErr,     setPharmErr]     = useState("");

  // -- WARD MODULE state --
  const [wardAdmitPat, setWardAdmitPat] = useState(null); // patient being admitted
  const [wardForm,     setWardForm]     = useState({ ward:"", bed:"", admitReason:"", admitDoctor:"", admitNurse:"", diet:"Regular", isolation:false, notes:"" });
  const [wardErr,      setWardErr]      = useState("");
  const [wardActive,   setWardActive]   = useState(null); // patient being viewed/discharged
  const [dischargeForm,setDischargeForm]= useState({ dischargeDoctor:"", condition:"Stable", followUp:"", notes:"", dischargeType:"Home" });
  // Inpatient sub-view: "manage" | "billing" | "orders" | "sheet"
  const [wardView,     setWardView]     = useState("manage");
  // Inpatient running bill
  const [ipBillItems,  setIpBillItems]  = useState([]);
  const [ipBillErr,    setIpBillErr]    = useState("");
  const [ipBillSnap,   setIpBillSnap]   = useState(null); // generated bill snapshot {items, total, generatedAt, billNo, finalized, finalizedAt, discount}
  const [ipBillDisc,   setIpBillDisc]   = useState(0);
  const [ipBilledBy,   setIpBilledBy]   = useState(""); // billing officer for inpatient bill
  const [ipPayMethod,  setIpPayMethod]  = useState("Cash"); // inpatient payment method
  const [ipBillErr2,   setIpBillErr2]   = useState(""); // error for generate/finalize
  // Ward round orders & treatment sheet
  const [ipOrders,     setIpOrders]     = useState([]);
  const [ipOrderForm,  setIpOrderForm]  = useState({ date:new Date().toISOString().split("T")[0], doctor:"", vitals:"", fluidBalance:"", medications:"", ivFluids:"", labs:"", radiology:"", pharmacy:"", nursing:"", diet:"Regular", notes:"" });
  const [ipOrderErr,   setIpOrderErr]   = useState("");

  // -- helpers --
  const rf  = k => e => setRegForm(p=>({...p,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value}));
  const tf  = k => e => setTrForm(p=>({...p,[k]:e.target.value}));
  const ck  = k => e => setClk(p=>({...p,[k]:e.target.value}));

  // --- API: load persisted data on mount ---
  useEffect(() => {
    apiCall("/hms/patients").then(data => { if (data && data.length) setPatients(data); });
    apiCall("/hms/inventory").then(data => {
      if (data && data.length) setInvItems(data.map(it => ({ ...it, id: it.itemId || it.id })));
    });
    apiCall("/hms/suppliers").then(data => { if (data && data.length) setProcSuppliers(data.map(s => ({ ...s, id: s.supplierId || s.id }))); });
    apiCall("/hms/purchase-orders").then(data => { if (data && data.length) setProcPOs(data.map(po => ({ ...po, id: po.poId || po.id }))); });
  }, []);

  const openQueue = () => { setQFirstName(""); setQSurname(""); setQPhone(""); setQErr(""); setKioskStep("select"); setKioskService(null); setKioskPayment(null); setKioskExSearch(""); setKioskExPick(null); setQModal(true); };

  const servicePrefix = { pharmacy:"PH", lab:"LB", radiology:"RD" };
  const serviceLabel  = { pharmacy:"Pharmacy", lab:"Laboratory", radiology:"Radiology" };

  const saveWalkinPatient = () => {
    if (!qFirstName.trim() || !qSurname.trim() || !qPhone.trim()) { setQErr("First name, surname and phone are required."); return; }
    const pfx = servicePrefix[kioskService] || "WI";
    const cnt = patients.filter(p=>p.queueNo.startsWith(pfx+"-")).length + 1;
    const newPat = {
      ...EMPTY_REG,
      id:null, mrn:null,
      queueNo:`${pfx}-${pad(cnt,3)}`,
      queueTime:timeNow(),
      name:(qFirstName.trim()+" "+qSurname.trim()),
      firstName:qFirstName.trim(), lastName:qSurname.trim(),
      phone:qPhone.trim(),
      registeredDate:todayStr(),
      status: kioskPayment==="credit" ? "Queued" : "Queued",
      category: kioskPayment==="credit" ? "Credit" : "Cash",
      kioskService: kioskService,
      kioskPayment: kioskPayment,
      kioskRoute: kioskPayment==="credit" ? "registration" : "service",
      triage:null, billing:null, clerking:null,
      dateOfBirth:null, gender:null, bloodGroup:null,
      consentTreatment:false, consentData:false,
    };
    setPatients(p=>[...p, newPat]);
    apiCall("/hms/patients", "POST", newPat).catch(console.error);
    setQModal(false); setKioskStep("select");
  };

  const saveExistingCheckin = () => {
    if (!kioskExPick) return;
    const cnt = patients.filter(p=>p.queueNo.startsWith("EX-")).length + 1;
    setPatients(prev => prev.map(p =>
      p.id === kioskExPick.id || p.queueNo === kioskExPick.queueNo
        ? { ...p, queueNo:`EX-${pad(cnt,3)}`, queueTime:timeNow(), status:"Queued" }
        : p
    ));
    setQModal(false); setKioskStep("select"); setKioskExPick(null); setKioskExSearch("");
  };

  const saveQueuePatient = () => {
    if (!qFirstName.trim() || !qSurname.trim() || !qPhone.trim()) { setQErr("First name, surname and phone are required."); return; }
    const qCount = patients.filter(p=>p.queueNo.startsWith("Q-")).length + 1;
    const newPat = {
      ...EMPTY_REG,
      id:null, mrn:null,
      queueNo:`Q-${pad(qCount,3)}`,
      queueTime:timeNow(),
      name:(qFirstName.trim()+" "+qSurname.trim()),
      firstName:qFirstName.trim(), lastName:qSurname.trim(),
      phone:qPhone.trim(),
      registeredDate:todayStr(),
      status:"Queued",
      triage:null, billing:null, clerking:null,
      dateOfBirth:null, gender:null, bloodGroup:null,
      category:null, consentTreatment:false, consentData:false,
    };
    setPatients(p=>[...p, newPat]);
    apiCall("/hms/patients", "POST", newPat).catch(console.error);
    setQModal(false); setKioskStep("select");
  };

  const goTriage = (pat) => {
    setActive(pat);
    setTrForm(pat.triage ? {...pat.triage} : { level:"3",bp:"",pulse:"",temp:"",rr:"",spo2:"",gcs:"",weight:"",height:"",chiefComplaint:"",primaryCode:"",primaryDx:"",secondaryCode:"",secondaryDx:"",triageNurse:"",triageTime:timeNow() });
    setTrErr(""); setPage("triage");
  };

  const saveTriage = () => {
    const req = ["bp","pulse","temp","rr","spo2","gcs","weight","height","chiefComplaint","triageNurse"];
    if (req.some(k=>!trForm[k]?.toString().trim())) { setTrErr("All vital signs, chief complaint and triage nurse name are required."); return; }
    setPatients(p=>p.map(x=>x.queueNo===active.queueNo ? {...x, triage:{...trForm}, status:"Triaged"} : x));
    apiCall(`/hms/patients/${active.queueNo}`, "PUT", { triage:{...trForm}, status:"Triaged" }).catch(console.error);
    showToast("Triage Saved", `${active.name||active.queueNo} has been triaged successfully. Patient is now ready for registration.`, "🩺", ()=>{ setActive(null); setPage("queue"); });
  };

  const goRegister = (pat) => {
    setActive(pat);
    // Pre-fill name/phone from queue entry
    const base = { ...EMPTY_REG, phone: pat.phone||"" };
    if (pat.firstName) { setRegForm({...pat}); }
    else {
      const parts = (pat.name||"").split(" ");
      setRegForm({...base, firstName:parts[0]||"", lastName:parts.slice(1).join(" ")||""});
    }
    setRegTab(0); setRegErr(""); setPage("register");
  };

  const saveRegistration = () => {
    if (regSaving) return;
    if (!regForm.firstName?.trim()||!regForm.lastName?.trim()||!regForm.dateOfBirth||!regForm.phone?.trim()) { setRegErr("Required: First Name, Last Name, Date of Birth, Phone."); return; }
    if (regForm.category==="Insurance"&&!regForm.insuranceMemberNo?.trim()) { setRegErr("Insurance Member No. is required."); return; }
    if (!regForm.consentTreatment||!regForm.consentData) { setRegErr("Both consent checkboxes are required."); return; }
    
    setRegSaving(true);
    const seq = patients.findIndex(p=>p.queueNo===active.queueNo) + 1;
    const id  = active.id || `PAT-2026-${pad(seq)}`;
    const mrn = active.mrn || `MRN-2026-${pad(seq)}`;
    
    setTimeout(() => {
      setPatients(p=>p.map(x=>x.queueNo===active.queueNo ? {
        ...x, ...regForm,
        id, mrn,
        name:`${regForm.firstName} ${regForm.lastName}`,
        phone: regForm.phone,
        status:"Registered",
      } : x));
      apiCall(`/hms/patients/${active.queueNo}`, "PUT", { ...regForm, patientId:id, mrn, name:`${regForm.firstName} ${regForm.lastName}`, status:"Registered" })
        .catch(console.error)
        .finally(() => {
          setRegSaving(false);
          showToast("Registration Complete", `${regForm.firstName} ${regForm.lastName} has been registered successfully. Patient ID: ${id}`, "📝", ()=>{ setActive(null); setPage("queue"); });
        });
    }, 1200);
  };

  const goBilling = (pat) => {
    setActive(pat);
    if (pat.billing) {
      setBItems(pat.billing.items||[]);
      setBDisc(pat.billing.discount||0);
      setBMethod(pat.billing.paymentMethod||"Cash");
      setBNote(pat.billing.note||"");
      setBOfficer(pat.billing.billedBy||"");
    } else {
      const defaultMethod = pat.category==="Insurance"?"NHIF":pat.category==="Corporate"?"Corporate Account":"Cash";
      setBMethod(defaultMethod);
      setBOfficer("");
      const orders = pat.clerking?.orders;
      const autoItems = [];
      if (orders?.lab?.tests?.length) {
        const allLabTests = LAB_CATEGORIES.flatMap(c=>c.tests);
        orders.lab.tests.forEach(id => {
          const t = allLabTests.find(x=>x.id===id);
          if (t) autoItems.push({ id:t.id, name:t.name, price:t.price||0, qty:1, cat:"lab", fromOrder:true });
        });
      }
      if (orders?.rad?.tests?.length) {
        const allRadTests = RAD_CATEGORIES.flatMap(c=>c.tests);
        orders.rad.tests.forEach(id => {
          const t = allRadTests.find(x=>x.id===id);
          if (t) autoItems.push({ id:t.id, name:t.name, price:t.price||0, qty:1, cat:"radiology", fromOrder:true });
        });
      }
      if (orders?.rx?.drugs?.length) {
        orders.rx.drugs.forEach(d => {
          autoItems.push({ id:`drug_${d.id}`, name:`${d.name} ${d.dose}`, price:getDrugPrice(d.name), qty:1, cat:"pharmacy", fromOrder:true });
        });
      }
      setBItems(autoItems);
      setBDisc(0); setBNote("");
    }
    setBTab("consult"); setBErr(""); setPage("billing");
  };

  const bSub   = bItems.reduce((s,i)=>s+i.price*i.qty,0);
  const bTotal = bSub - Math.min(bSub, Number(bDisc)||0);
  const addBItem = svc => setBItems(p=>{ const e=p.find(i=>i.id===svc.id); return e?p.map(i=>i.id===svc.id?{...i,qty:i.qty+1}:i):[...p,{...svc,qty:1}]; });

  const saveBilling = (paid) => {
    if (!bItems.length) { setBErr("Add at least one service."); return; }
    if (!bOfficer.trim()) { setBErr("Billing officer / cashier name is required."); return; }
    const idx = patients.findIndex(p=>p.queueNo===active.queueNo);
    const inv = genNo("INV", idx+1);
    const recNo = paid ? genNo("REC", idx+1) : null;
    const now = new Date().toISOString();
    setPatients(p=>p.map(x=>x.queueNo===active.queueNo ? {
      ...x,
      billing:{
        invoiceNo: inv,
        receiptNo: recNo,
        items: bItems,
        discount: Number(bDisc)||0,
        paid,
        paymentMethod: paid ? bMethod : "",
        note: bNote,
        billedBy: bOfficer.trim(),
        billedAt: now,
        paidAt: paid ? now : null,
      },
      status: paid ? "Billed" : "Registered",
    } : x));
    const name = active.firstName ? `${active.firstName} ${active.lastName}` : active.name;
    apiCall(`/hms/patients/${active.queueNo}`, "PUT", {
      billing:{ invoiceNo:inv, receiptNo:recNo, items:bItems, discount:Number(bDisc)||0, paid, paymentMethod:paid?bMethod:"", note:bNote, billedBy:bOfficer.trim(), billedAt:new Date().toISOString(), paidAt:paid?new Date().toISOString():null },
      status: paid ? "Billed" : "Registered",
    }).catch(console.error);
    if (paid) {
      showToast("Payment Confirmed", `Invoice ${inv}  Receipt ${recNo}  ${name} paid via ${bMethod}. Billed by ${bOfficer}.`, "💳", ()=>{ setActive(null); setPage("queue"); });
    } else {
      showToast("Invoice Saved", `Invoice ${inv} for ${name} saved as unpaid. Raised by ${bOfficer}.`, "📋", ()=>{ setActive(null); setPage("queue"); });
    }
  };

  const goDoctor = (pat) => {
    setActive(pat);
    setClk(pat.clerking ? {...pat.clerking} : { presentingComplaint:"",historyPC:"",pastMedHistory:"",surgicalHistory:"",familyHistory:"",socialHistory:"",allergies:"",currentMeds:"",reviewSystems:"",generalExam:"",cvExam:"",respExam:"",abdExam:"",neuroExam:"",mskExam:"",otherExam:"",provisionalDx:"",provisionalCode:"",finalDx:"",finalCode:"",differentials:"",planNotes:"",disposition:"OPD Follow-up",doctorName:"",doctorReg:"" });
    if (pat.clerking?.orders) {
      const o = pat.clerking.orders;
      setLabSel(o.lab?.tests||[]); setLabNotes(o.lab?.notes||""); setLabUrgency(o.lab?.urgency||"Routine");
      setRadSel(o.rad?.tests||[]); setRadNotes(o.rad?.notes||""); setRadUrgency(o.rad?.urgency||"Routine");
      setRxList(o.rx?.drugs||[]);
      setConsSpec(o.consult?.specialty||SPECIALTIES[0]); setConsUrgency(o.consult?.urgency||"Routine"); setConsReason(o.consult?.reason||"");
    } else {
      setLabSel([]); setLabNotes(""); setLabUrgency("Routine");
      setRadSel([]); setRadNotes(""); setRadUrgency("Routine");
      setRxList([]);
      setConsSpec(SPECIALTIES[0]); setConsUrgency("Routine"); setConsReason("");
    }
    // Restore admission request if exists
    if (pat.clerking?.orders?.admit) {
      setAdmitReqForm(pat.clerking.orders.admit);
    } else {
      setAdmitReqForm({ wardPref:"", urgency:"Routine", isolation:false, oxygenNeeded:false, ivAccess:false, monitoring:"Standard", specialNeeds:"", diet:"Regular", nursingNeeds:"", infectionControl:"None" });
    }
    setDocTab(0); setDocErr(""); setDocSaved(false); setPage("doctor");
  };

  const saveDoctor = () => {
    if (!clk.presentingComplaint?.trim()) { setDocErr("Presenting complaint is required."); setDocTab(0); return; }
    if (!clk.doctorName?.trim()) { setDocErr("Attending doctor name is required."); setDocTab(2); return; }
    const isAdmission = clk.disposition?.startsWith("Admit");
    if (isAdmission && !admitReqForm.wardPref) { setDocErr("Select a preferred ward for admission."); setDocTab(2); return; }
    const idx = patients.findIndex(p=>p.queueNo===active.queueNo);
    const consNo = genNo("CONS", idx+1);
    const orders = {
      lab:    labSel.length  ? { tests:labSel, urgency:labUrgency, notes:labNotes } : null,
      rad:    radSel.length  ? { tests:radSel, urgency:radUrgency, notes:radNotes } : null,
      rx:     rxList.length  ? { drugs:rxList } : null,
      consult:consReason.trim() ? { specialty:consSpec, urgency:consUrgency, reason:consReason } : null,
      admit:  isAdmission ? { ...admitReqForm, requestedBy:clk.doctorName, requestedAt:new Date().toISOString() } : null,
    };
    const newStatus = isAdmission ? "Pending Admission" : labSel.length ? "Lab Pending" : "Completed";
    setPatients(p=>p.map(x=>x.queueNo===active.queueNo ? {
      ...x,
      clerking:{...clk, consNo, orders, savedAt:new Date().toISOString()},
      status: newStatus,
    } : x));
    apiCall(`/hms/patients/${active.queueNo}`, "PUT", {
      clerking:{...clk, consNo, orders, savedAt:new Date().toISOString()},
      status: newStatus,
    }).catch(console.error);
    setDocSaved(true);
    const name = active.firstName ? `${active.firstName} ${active.lastName}` : active.name;
    const nextStep = isAdmission
      ? `Admission request sent to Ward. Preferred ward: ${admitReqForm.wardPref}.`
      : labSel.length ? `${labSel.length} lab test(s) sent to Laboratory.` : "Patient encounter is now complete.";
    showToast("Clerking Saved", `Consultation ${consNo} for ${name} saved by Dr. ${clk.doctorName}. ${nextStep}`, "🩺", ()=>{ setActive(null); setPage("queue"); });
  };

  // -- WARD functions --
  const openAdmit = (pat) => {
    setWardAdmitPat(pat);
    setWardForm({ ward:"", bed:"", admitReason:pat.triage?.chiefComplaint||"", admitDoctor:pat.clerking?.doctorName||"", admitNurse:"", diet:"Regular", isolation:false, notes:"" });
    setWardErr("");
  };
  const saveAdmit = () => {
    if (!wardForm.ward) { setWardErr("Select a ward."); return; }
    if (!wardForm.bed.trim()) { setWardErr("Enter a bed number."); return; }
    if (!wardForm.admitDoctor.trim()) { setWardErr("Admitting doctor name is required."); return; }
    const idx = patients.findIndex(p=>p.queueNo===wardAdmitPat.queueNo);
    const admitNo = genNo("ADM", idx+1);
    setPatients(p=>p.map(x=>x.queueNo===wardAdmitPat.queueNo ? {
      ...x, admitted:true, status:"Admitted",
      admission:{ admitNo, ward:wardForm.ward, bed:wardForm.bed, admitReason:wardForm.admitReason,
        admitDoctor:wardForm.admitDoctor, admitNurse:wardForm.admitNurse, diet:wardForm.diet,
        isolation:wardForm.isolation, notes:wardForm.notes, admittedAt:new Date().toISOString(), discharged:false,
        // carry over doctor's admission request criteria
        admitRequest: wardAdmitPat.clerking?.orders?.admit || null,
      }
    } : x));
    apiCall(`/hms/patients/${wardAdmitPat.queueNo}`, "PUT", {
      admitted:true, status:"Admitted",
      admission:{ admitNo, ward:wardForm.ward, bed:wardForm.bed, admitReason:wardForm.admitReason, admitDoctor:wardForm.admitDoctor, admitNurse:wardForm.admitNurse, diet:wardForm.diet, isolation:wardForm.isolation, notes:wardForm.notes, admittedAt:new Date().toISOString(), discharged:false, admitRequest:wardAdmitPat.clerking?.orders?.admit||null },
    }).catch(console.error);
    const name = wardAdmitPat.firstName ? `${wardAdmitPat.firstName} ${wardAdmitPat.lastName}` : wardAdmitPat.name;
    showToast("Patient Admitted", `${admitNo} - ${name} admitted to ${wardForm.ward}, Bed ${wardForm.bed}.`, "🏥", ()=>{ setWardAdmitPat(null); });
  };
  const saveDischarge = () => {
    if (!dischargeForm.dischargeDoctor.trim()) { setWardErr("Discharging doctor name is required."); return; }
    setPatients(p=>p.map(x=>x.queueNo===wardActive.queueNo ? {
      ...x, admitted:false,
      admission:{ ...x.admission, discharged:true, dischargeDoctor:dischargeForm.dischargeDoctor,
        dischargeType:dischargeForm.dischargeType, conditionAtDischarge:dischargeForm.condition,
        followUp:dischargeForm.followUp, dischargeNotes:dischargeForm.notes, dischargedAt:new Date().toISOString() }
    } : x));
    apiCall(`/hms/patients/${wardActive.queueNo}`, "PUT", {
      admitted:false,
      discharge:{ dischargeDoctor:dischargeForm.dischargeDoctor, dischargeType:dischargeForm.dischargeType, conditionAtDischarge:dischargeForm.condition, followUp:dischargeForm.followUp, dischargeNotes:dischargeForm.notes, dischargedAt:new Date().toISOString() },
    }).catch(console.error);
    const name = wardActive.firstName ? `${wardActive.firstName} ${wardActive.lastName}` : wardActive.name;
    showToast("Patient Discharged", `${(wardActive.admission&&wardActive.admission.admitNo)||""} - ${name} discharged (${dischargeForm.dischargeType}).`, "🏥", ()=>{ setWardActive(null); });
  };

  // Inpatient billing helpers
  const openIpManage = (pat) => {
    setWardActive(pat);
    setDischargeForm({ dischargeDoctor:"", condition:"Stable", followUp:"", notes:"", dischargeType:"Home" });
    setIpBillItems(pat.admission?.ipBill || []);
    setIpBillSnap(pat.admission?.ipBillSnap || null);
    setIpBillDisc(pat.admission?.ipBillDisc || 0);
    setIpBilledBy(pat.admission?.ipBillSnap?.billedBy || "");
    setIpPayMethod(pat.admission?.ipBillSnap?.payMethod || (pat.category==="Insurance"?"NHIF":pat.category==="Corporate"?"Corporate Account":"Cash"));
    setIpOrders(pat.admission?.ipOrders || []);
    setIpOrderForm({ date:new Date().toISOString().split("T")[0], doctor:pat.clerking?.doctorName||"", vitals:"", fluidBalance:"", medications:"", ivFluids:"", labs:"", radiology:"", pharmacy:"", nursing:"", diet:pat.admission?.diet||"Regular", notes:"" });
    setWardView("manage");
    setWardErr(""); setIpBillErr(""); setIpOrderErr("");
  };

  const saveIpBillItem = (item) => {
    const newItems = [...ipBillItems, { ...item, id:item.id+"_"+Date.now(), addedAt:new Date().toISOString(), qty:1 }];
    setIpBillItems(newItems);
    setPatients(p=>p.map(x=>x.queueNo===wardActive.queueNo ? {
      ...x, admission:{ ...x.admission, ipBill:newItems }
    } : x));
  };

  const removeIpBillItem = (id) => {
    const newItems = ipBillItems.filter(i=>i.id!==id);
    setIpBillItems(newItems);
    setPatients(p=>p.map(x=>x.queueNo===wardActive.queueNo ? {
      ...x, admission:{ ...x.admission, ipBill:newItems }
    } : x));
  };

  const updateIpQty = (id, delta) => {
    const newItems = ipBillItems.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+delta)}:i);
    setIpBillItems(newItems);
    setPatients(p=>p.map(x=>x.queueNo===wardActive.queueNo ? {
      ...x, admission:{ ...x.admission, ipBill:newItems }
    } : x));
  };

  const generateIpBill = () => {
    if (!ipBillItems.length) { setIpBillErr("Add at least one charge before generating a bill."); return; }
    if (!ipBilledBy.trim()) { setIpBillErr("Billing officer name is required."); return; }
    const idx = patients.findIndex(p=>p.queueNo===wardActive.queueNo);
    const billNo = genNo("IPB", idx+1);
    const sub = ipBillItems.reduce((s,i)=>s+i.price*i.qty,0);
    const disc = Number(ipBillDisc)||0;
    const snap = {
      billNo, items:[...ipBillItems], subtotal:sub, discount:disc,
      total:sub-disc, generatedAt:new Date().toISOString(),
      billedBy:ipBilledBy.trim(), payMethod:ipPayMethod,
      finalized:false, finalizedAt:null, receiptNo:null, paidAt:null,
    };
    setIpBillSnap(snap);
    setPatients(p=>p.map(x=>x.queueNo===wardActive.queueNo ? {
      ...x, admission:{ ...x.admission, ipBillSnap:snap, ipBillDisc:disc }
    } : x));
    setIpBillErr(""); setIpBillErr2("");
    setWardView("view");
    showToast("Interim Bill Generated", `Bill ${billNo} generated for ${wardActive.firstName||wardActive.name} ${wardActive.lastName||""}. Total: KES ${(sub-disc).toLocaleString()}. Raised by ${ipBilledBy}.`, "💳", ()=>{});
  };

  const finalizeIpBill = () => {
    if (!ipBillSnap) return;
    if (!ipBilledBy.trim()) { setIpBillErr2("Billing officer name is required to finalize."); return; }
    const idx = patients.findIndex(p=>p.queueNo===wardActive.queueNo);
    const recNo = genNo("REC", idx+1);
    const now = new Date().toISOString();
    const isCashPay = CASH_METHODS.includes(ipPayMethod);
    const snap = {
      ...ipBillSnap,
      finalized: true,
      finalizedAt: now,
      finalizedBy: ipBilledBy.trim(),
      payMethod: ipPayMethod,
      receiptNo: isCashPay ? recNo : null,
      invoiceNo: !isCashPay ? (ipBillSnap.invoiceNo || genNo("INV", idx+1)) : ipBillSnap.invoiceNo,
      paidAt: isCashPay ? now : null,
    };
    setIpBillSnap(snap);
    setPatients(p=>p.map(x=>x.queueNo===wardActive.queueNo ? {
      ...x, admission:{ ...x.admission, ipBillSnap:snap }
    } : x));
    setIpBillErr2("");
    const msg = isCashPay
      ? `Bill ${snap.billNo}  Receipt ${recNo}  KES ${snap.total.toLocaleString()} paid via ${ipPayMethod}. Finalized by ${ipBilledBy}.`
      : `Bill ${snap.billNo} finalized. Invoice raised for ${ipPayMethod}. Billed by ${ipBilledBy}.`;
    showToast("Bill Finalized", msg, "💳", ()=>{});
  };

  const saveIpOrder = () => {
    if (!ipOrderForm.doctor.trim()) { setIpOrderErr("Doctor name is required."); return; }
    const order = { ...ipOrderForm, savedAt:new Date().toISOString(), id:Date.now() };
    const newOrders = [...ipOrders, order];
    setIpOrders(newOrders);
    setPatients(p=>p.map(x=>x.queueNo===wardActive.queueNo ? {
      ...x, admission:{ ...x.admission, ipOrders:newOrders }
    } : x));
    setIpOrderForm(f=>({ ...f, vitals:"", fluidBalance:"", medications:"", ivFluids:"", labs:"", radiology:"", pharmacy:"", nursing:"", notes:"" }));
    setIpOrderErr("");
    showToast("Ward Round Saved", `Orders saved for ${wardActive.firstName||wardActive.name} by Dr. ${ipOrderForm.doctor}.`, "📋", ()=>{});
  };

  const printIpBill = (pat, snap) => {
    const billData = snap || pat.admission?.ipBillSnap;
    const items = billData ? billData.items : (pat.admission?.ipBill || []);
    const total = billData ? billData.total : items.reduce((s,i)=>s+i.price*i.qty,0);
    const discount = billData ? (billData.discount||0) : 0;
    const subtotal = billData ? billData.subtotal : total;
    const isFinalized = billData?.finalized || false;
    const billNo = billData?.billNo || pat.admission?.admitNo || "-";
    const recNo = billData?.receiptNo || null;
    const invNo = billData?.invoiceNo || null;
    const billedBy = billData?.billedBy || billData?.finalizedBy || "-";
    const payMethod = billData?.payMethod || "-";
    const isCash = CASH_METHODS.includes(payMethod);
    const statusLabel = isFinalized ? (isCash ? "RECEIPT" : "FINAL INVOICE") : "INTERIM BILL";
    const statusColor = isFinalized ? "#059669" : "#d97706";
    // Group by category
    const cats = {};
    items.forEach(i=>{ if(!cats[i.cat||"other"]) cats[i.cat||"other"]=[]; cats[i.cat||"other"].push(i); });
    const catRows = Object.entries(cats).map(([cat,catItems])=>{
      return `<tr><td colspan="4" style="padding:6px 10px;background:#f8fafc;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b">${cat}</td></tr>`
        + catItems.map(i=>`<tr><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;padding-left:20px">${i.name}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;text-align:center">${i.qty}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;text-align:right">KES ${i.price.toLocaleString()}</td><td style="padding:6px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600">KES ${(i.price*i.qty).toLocaleString()}</td></tr>`).join("");
    }).join("");
    const html = `<!DOCTYPE html><html><head><title>Inpatient Bill ${billNo}</title>
    <style>body{font-family:sans-serif;margin:40px;color:#1e293b;font-size:13px}h2{margin:0}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#0b1929;color:#fff;padding:9px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px}td{font-size:12px}.total-row td{font-weight:900;font-size:15px;border-top:2px solid #0b1929}</style>
    </head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
      <div><h2>MediCore HMS</h2><div style="font-size:13px;color:#64748b;margin-top:4px">Inpatient ${statusLabel}</div></div>
      <div style="text-align:right">
        <div style="display:inline-block;background:${statusColor};color:#fff;padding:6px 18px;border-radius:6px;font-weight:900;font-size:13px;letter-spacing:1px">${statusLabel}</div>
        <div style="font-size:20px;font-weight:900;color:#0b1929;margin-top:4px;font-family:monospace">${billNo}</div>
        ${recNo?`<div style="font-size:12px;color:#059669;font-family:monospace;font-weight:700">Receipt: ${recNo}</div>`:""}
        ${invNo&&!isCash?`<div style="font-size:12px;color:#1d4ed8;font-family:monospace;font-weight:700">Invoice: ${invNo}</div>`:""}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;background:#f8fafc;padding:14px;border-radius:8px;margin-bottom:20px">
      <div><div style="font-size:10px;color:#64748b;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px">PATIENT</div><div style="font-weight:700">${pat.firstName||pat.name} ${pat.lastName||""}</div><div style="font-size:11px;color:#64748b">${pat.id||"-"} | ${pat.dateOfBirth?calcAge(pat.dateOfBirth)+" yrs":"-"} | ${pat.gender||"-"}</div></div>
      <div><div style="font-size:10px;color:#64748b;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px">ADMISSION</div><div style="font-weight:700">${pat.admission?.ward} - Bed ${pat.admission?.bed}</div><div style="font-size:11px;color:#64748b">Adm No: ${pat.admission?.admitNo||"-"} | Admitted: ${pat.admission?.admittedAt?new Date(pat.admission.admittedAt).toLocaleDateString("en-GB"):"-"}</div></div>
      <div><div style="font-size:10px;color:#64748b;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px">DIAGNOSIS</div><div style="font-weight:700">${pat.clerking?.finalDx||pat.clerking?.provisionalDx||"-"}</div></div>
      <div><div style="font-size:10px;color:#64748b;margin-bottom:2px;text-transform:uppercase;letter-spacing:1px">PAYMENT</div><div style="font-weight:700">${payMethod}</div><div style="font-size:11px;color:#64748b">Billed by: ${billedBy} | ${billData?.generatedAt?new Date(billData.generatedAt).toLocaleDateString("en-GB"):"-"}</div></div>
    </div>
    <table>
      <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        ${catRows}
        <tr><td colspan="3" style="padding:10px;text-align:right;font-size:12px;color:#64748b">Subtotal</td><td style="padding:10px;text-align:right;font-weight:600">KES ${subtotal.toLocaleString()}</td></tr>
        ${discount>0?`<tr><td colspan="3" style="padding:5px 10px;text-align:right;font-size:12px;color:#64748b">Discount</td><td style="padding:5px 10px;text-align:right;color:#dc2626">- KES ${discount.toLocaleString()}</td></tr>`:""}
        <tr class="total-row"><td colspan="3" style="padding:12px 10px;text-align:right">TOTAL ${isCash?"PAID":"DUE"}</td><td style="padding:12px 10px;text-align:right;color:#059669;font-size:18px">KES ${total.toLocaleString()}</td></tr>
      </tbody>
    </table>
    ${isFinalized
      ? `<div style="margin-top:20px;padding:12px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;color:#15803d;font-size:12px">
          <strong>${isCash?"PAYMENT RECEIVED":"INVOICE RAISED"}</strong> - Finalized by: ${billedBy}${isCash?" | Receipt: "+recNo:""}${isFinalized?" | "+new Date(billData.finalizedAt).toLocaleString():""}
        </div>`
      : `<div style="margin-top:20px;padding:12px;background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;color:#b45309;font-size:12px"><strong>INTERIM BILL</strong> - Preliminary bill. Charges may be amended. Raised by: ${billedBy}</div>`
    }
    </body></html>`;
    const w=window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
  };

  const printTreatmentSheet = (pat) => {
    const orders = pat.admission?.ipOrders || [];
    const rows = orders.map(o=>`<tr>
      <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px">${o.date}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px">${o.vitals||"-"}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px">${o.medications||"-"}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px">${o.ivFluids||"-"}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px">${o.labs||"-"}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px">${o.radiology||"-"}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px">${o.pharmacy||"-"}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px">${o.nursing||"-"}</td>
      <td style="padding:8px;border:1px solid #e2e8f0;font-size:11px">${o.doctor}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Treatment Sheet</title><style>body{font-family:sans-serif;margin:20px;color:#1e293b;font-size:12px}h2{margin-bottom:4px}</style></head><body>
    <h2>Inpatient Treatment Sheet - ${pat.admission?.admitNo||""}</h2>
    <p><b>Patient:</b> ${pat.firstName||pat.name} ${pat.lastName||""} &nbsp; <b>DOB:</b> ${pat.dateOfBirth||"-"} &nbsp; <b>Ward:</b> ${pat.admission?.ward} &nbsp; <b>Bed:</b> ${pat.admission?.bed} &nbsp; <b>Dx:</b> ${pat.clerking?.finalDx||pat.clerking?.provisionalDx||"-"}</p>
    <p><b>Allergies:</b> <span style="color:#dc2626;font-weight:700">${pat.clerking?.allergies||"NKDA"}</span> &nbsp; <b>Diet:</b> ${pat.admission?.diet||"-"} &nbsp; <b>Isolation:</b> ${pat.admission?.isolation?"YES":"No"}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      <thead><tr style="background:#f8fafc">
        <th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Date</th>
        <th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Vitals</th>
        <th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Medications</th>
        <th style="padding:8px;border:1px solid #e2e8f0;text-align:left">IV Fluids</th>
        <th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Lab Orders</th>
        <th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Radiology</th>
        <th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Pharmacy</th>
        <th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Nursing</th>
        <th style="padding:8px;border:1px solid #e2e8f0;text-align:left">Doctor</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </body></html>`;
    const w=window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
  };

  const goLab = (pat) => {
    setLabActive(pat);
    const saved = pat.clerking?.labResults || {};
    setLabResults(saved);
    setLabScientist(pat.clerking?.labScientist || "");
    setLabStep(Object.keys(saved).length ? "summary" : "specimen");
    setLabSaved(false); setLabModErr(""); setPage("lab");
  };

  const saveLabResults = () => {
    if (!labScientist.trim()) { setLabModErr("Lab scientist name is required."); return; }
    const tests = labActive.clerking?.orders?.lab?.tests || [];
    if (!tests.length) { setLabModErr("No lab tests found on this request."); return; }
    const idx = patients.findIndex(p=>p.queueNo===labActive.queueNo);
    const labNo = genNo("LAB", idx+1);
    setPatients(p=>p.map(x=>x.queueNo===labActive.queueNo ? {
      ...x,
      clerking:{ ...x.clerking, labResults:labResults, labScientist, labNo, labCompletedAt:new Date().toISOString() },
      status:"With Doctor",
    } : x));
    apiCall(`/hms/patients/${labActive.queueNo}`, "PUT", {
      clerking:{ ...labActive.clerking, labResults, labScientist, labNo, labCompletedAt:new Date().toISOString() },
      status:"With Doctor",
    }).catch(console.error);
    setLabSaved(true);
    const name = labActive.firstName ? `${labActive.firstName} ${labActive.lastName}` : labActive.name;
    showToast("Results Ready - Patient Queued to Doctor", `Lab report ${labNo} for ${name} has been entered by ${labScientist}. The patient has been sent back to the doctor for review.`, "🧪", ()=>{ setLabActive(null); setLabSaved(false); });
  };

  const DOC_TABS = [
    { label:"📋 History",    badge:null },
    { label:"🔍 Examination",badge:null },
    { label:"🎯 Diagnosis",  badge:null },
    { label:"🧪 Lab",        badge:labSel.length },
    { label:"🩻 Radiology",  badge:radSel.length },
    { label:"💊 Prescription",badge:rxList.length },
    { label:"🩺 Consult",    badge:consReason.trim()?1:0 },
  ];

  const filtered = patients.filter(p=>{
    const q = search.toLowerCase();
    const match = `${p.name||""} ${p.id||""} ${p.queueNo||""} ${p.phone||""}`.toLowerCase().includes(q);
    return match && (fStatus==="All" || p.status===fStatus);
  });

  const REG_TABS = ["👤 Patient Details","🌍 Demographics","👪 NOK & Emergency","Category","Consent"];

  // --- Button styles ---------------------------------------------------------
  const BtnPrimary = { padding:"10px 22px",border:"none",borderRadius:9,background:"#0b1929",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit" };
  const BtnGhost   = { padding:"9px 18px",border:"1.5px solid #e2e8f0",borderRadius:9,background:"#fff",cursor:"pointer",fontSize:13,fontFamily:"inherit",color:"#475569" };
  const BtnGreen   = { ...BtnPrimary, background:"#059669" };
  const BtnRed     = { ...BtnPrimary, background:"#dc2626" };
  const BtnCyan    = { ...BtnPrimary, background:C.cyan };

  // ==========================================================================
  // PAGE: QUEUE
  // ==========================================================================

  // Build context object to pass to page components
  const ctx = {
    page, setPage, finCtx, setFinCtx, patients, setPatients, active, setActive,
    search, setSearch, fStatus, setFStatus, delId, setDelId,
    toast, setToast, showToast, closeToast, ToastModal,
    qFirstName, setQFirstName, qSurname, setQSurname, qPhone, setQPhone,
    qErr, setQErr, qModal, setQModal,
    kioskStep, setKioskStep, kioskService, setKioskService,
    kioskPayment, setKioskPayment, kioskExSearch, setKioskExSearch, kioskExPick, setKioskExPick,
    trForm, setTrForm, trErr, setTrErr,
    regTab, setRegTab, regForm, setRegForm, regErr, setRegErr, regSaving, setRegSaving,
    bItems, setBItems, bDisc, setBDisc, bMethod, setBMethod, bNote, setBNote,
    bErr, setBErr, bTab, setBTab, bOfficer, setBOfficer, bSub, bTotal, addBItem,
    docTab, setDocTab, clk, setClk, docErr, setDocErr, docSaved, setDocSaved,
    admitReqForm, setAdmitReqForm,
    labSel, setLabSel, labSearch, setLabSearch, labUrgency, setLabUrgency, labNotes, setLabNotes,
    radSel, setRadSel, radUrgency, setRadUrgency, radNotes, setRadNotes,
    rxList, setRxList, rxForm, setRxForm,
    consSpec, setConsSpec, consUrgency, setConsUrgency, consReason, setConsReason,
    labActive, setLabActive, labStep, setLabStep, labScientist, setLabScientist,
    labResults, setLabResults, labSaved, setLabSaved, labModErr, setLabModErr, labViewModal, setLabViewModal,
    pharmActive, setPharmActive, verifyChecks, setVerifyChecks,
    pharmNotes, setPharmNotes, pharmacist, setPharmacist, pharmErr, setPharmErr,
    dispenseLog, setDispenseLog,
    wardAdmitPat, setWardAdmitPat, wardForm, setWardForm, wardErr, setWardErr,
    wardActive, setWardActive, dischargeForm, setDischargeForm, wardView, setWardView,
    ipBillItems, setIpBillItems, ipBillErr, setIpBillErr, ipBillSnap, setIpBillSnap,
    ipBillDisc, setIpBillDisc, ipBilledBy, setIpBilledBy, ipPayMethod, setIpPayMethod,
    ipBillErr2, setIpBillErr2, ipOrders, setIpOrders, ipOrderForm, setIpOrderForm, ipOrderErr, setIpOrderErr,
    invItems, setInvItems, invTxns, setInvTxns, invTab, setInvTab,
    invSearch, setInvSearch, invCat, setInvCat, invModal, setInvModal,
    invForm, setInvForm, invErr, setInvErr, invMode, setInvMode,
    invRecalls, setInvRecalls, invRecallModal, setInvRecallModal,
    procSuppliers, setProcSuppliers, procPOs, setProcPOs, procTab, setProcTab,
    procModal, setProcModal, procForm, setProcForm, procErr, setProcErr,
    procSearch, setProcSearch, procStatusF, setProcStatusF,
    procGRN, setProcGRN, procGRNPO, setProcGRNPO,
    supSearch, setSupSearch, supEditId, setSupEditId,
    poDetailPO, setPoDetailPO, analyticsSupId, setAnalyticsSupId,
    histSearch, setHistSearch, histPatient, setHistPatient, histTab, setHistTab, histFilter, setHistFilter,
    transfers, setTransfers,
    tfSearch, setTfSearch, tfModal, setTfModal, tfForm, setTfForm, tfErr, setTfErr, tfDetail, setTfDetail,
    expiryTab, setExpiryTab, expirySearch, setExpirySearch, expiryCat, setExpiryCat,
    disposals, setDisposals, dispModal, setDispModal, dispForm, setDispForm, dispErr, setDispErr,
    dispDetail, setDispDetail, alertLog, setAlertLog,
    manualSearch, setManualSearch,
    apiCall,
    BtnPrimary, BtnGhost, BtnGreen, BtnRed, BtnCyan,
    filtered, DOC_TABS, REG_TABS,
    rf, tf, ck,
    openQueue, saveQueuePatient, saveWalkinPatient, saveExistingCheckin,
    goTriage, saveTriage, goRegister, saveRegistration,
    goBilling, saveBilling, goDoctor, saveDoctor,
    openAdmit, saveAdmit, saveDischarge, openIpManage,
    saveIpBillItem, removeIpBillItem, updateIpQty, generateIpBill, finalizeIpBill,
    saveIpOrder, printIpBill, printTreatmentSheet,
    goLab, saveLabResults,
    servicePrefix, serviceLabel,
  };

  if (isPageLoading) {
    let title = "Loading...";
    let type = "list";
    if (loadingPageName === "queue") { title = "Patient Queue"; type = "list"; }
    else if (loadingPageName === "triage") { title = "Triage Assessment"; type = "list"; }
    else if (loadingPageName === "register") { title = "Patient Registration"; type = "list"; }
    else if (loadingPageName === "billing") { title = "Billing"; type = "list"; }
    else if (loadingPageName === "doctor") { title = "Doctor - Clerking & Orders"; type = "list"; }
    else if (loadingPageName === "lab") { title = "Laboratory"; type = "list"; }
    else if (loadingPageName === "pharmacy") { title = "Pharmacy"; type = "list"; }
    else if (loadingPageName === "ward") { title = "Ward Management"; type = "list"; }
    else if (loadingPageName === "reports") { title = "Reports & Analytics"; type = "dashboard"; }
    else if (loadingPageName === "finance") { title = "Finance Management"; type = "table"; }
    else if (loadingPageName === "schemes") { title = "Schemes"; type = "table"; }
    else if (loadingPageName === "inventory") { title = "Inventory Management"; type = "table"; }
    else if (loadingPageName === "procurement") { title = "Procurement"; type = "table"; }
    else if (loadingPageName === "history") { title = "Patient History"; type = "list"; }
    else if (loadingPageName === "catalogue") { title = "Master Price Catalogue"; type = "table"; }
    else if (loadingPageName === "forecast") { title = "Stock Forecasting"; type = "table"; }
    else if (loadingPageName === "transfers") { title = "Batch Transfers"; type = "table"; }
    else if (loadingPageName === "expiry") { title = "Expiry Tracking"; type = "table"; }
    else if (loadingPageName === "analytics") { title = "Analytics Dashboard"; type = "dashboard"; }

    return (
      <Layout page={loadingPageName} setPage={setPage} patients={patients} overlay={ToastModal}>
        <TopBar title={title} subtitle="Fetching live data from records..." />
        <SkeletonPage type={type} />
      </Layout>
    );
  }

  if (page==="queue") return <QueuePage {...ctx} />;
  if (page==="triage") return <TriagePage {...ctx} />;
  if (page==="register") return <RegisterPage {...ctx} />;
  if (page==="billing") return <BillingPage {...ctx} />;
  if (page==="doctor") return <DoctorPage {...ctx} />;
  if (page==="lab") return <LabPage {...ctx} />;
  if (page==="pharmacy") return <PharmacyPage {...ctx} />;
  if (page==="ward") return <WardPage {...ctx} />;
  if (page==="reports") return <ReportsPage {...ctx} />;
  if (page==="finance") return <FinancePage {...ctx} />;
  if (page==="schemes") return <SchemesRoutePage {...ctx} />;
  if (page==="inventory") return <InventoryPage {...ctx} />;
  if (page==="procurement") return <ProcurementPage {...ctx} />;
  if (page==="history") return <HistoryPage {...ctx} />;
  if (page==="catalogue") return <CataloguePage {...ctx} />;
  if (page==="forecast") return <ForecastPage {...ctx} />;
  if (page==="transfers") return <TransfersPage {...ctx} />;
  if (page==="expiry") return <ExpiryPage {...ctx} />;
  if (page==="analytics") return <AnalyticsPage {...ctx} />;

  return null;
}
