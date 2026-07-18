import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function ProcurementPage(props) {
  const {
    page, setPage, finCtx, setFinCtx, patients, setPatients, active, setActive,
    search, setSearch, fStatus, setFStatus, delId, setDelId,
    toast, setToast, showToast, closeToast, ToastModal,
    qFirstName, setQFirstName, qSurname, setQSurname, qPhone, setQPhone,
    qErr, setQErr, qModal, setQModal,
    kioskStep, setKioskStep, kioskService, setKioskService,
    kioskPayment, setKioskPayment, kioskExSearch, setKioskExSearch, kioskExPick, setKioskExPick,
    trForm, setTrForm, trErr, setTrErr,
    regTab, setRegTab, regForm, setRegForm, regErr, setRegErr,
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
    tfSearch, setTfSearch, tfModal, setTfModal, tfForm, setTfForm, tfErr, setTfErr, tfDetail, setTfDetail,
    expiryTab, setExpiryTab, expirySearch, setExpirySearch, expiryCat, setExpiryCat,
    disposals, setDisposals, dispModal, setDispModal, dispForm, setDispForm, dispErr, setDispErr,
    dispDetail, setDispDetail, alertLog, setAlertLog,
    manualSearch, setManualSearch,
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
  } = props;

  // ── GRN form local state ─────────────────────────────────────────────────
  const [grnMeta, setGrnMeta] = useState({
    receivedBy:"", deliveryNoteNo:"", receiptDate:new Date().toISOString().split("T")[0],
    vehicleNo:"", remarks:""
  });

    const fmtMoney = (n) => "KSh "+Number(n||0).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2});
    const fmtDate  = (d) => d?new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—";

    const PO_STATUS = {
      draft:              { label:"Draft",              color:"#475569", bg:"#f1f5f9", dot:"#94a3b8" },
      approved:           { label:"Approved",           color:"#1d4ed8", bg:"#eff6ff", dot:"#3b82f6" },
      sent:               { label:"Sent to Supplier",   color:"#7c3aed", bg:"#f5f3ff", dot:"#8b5cf6" },
      partially_received: { label:"Partial Receipt",    color:"#b45309", bg:"#fffbeb", dot:"#f59e0b" },
      received:           { label:"Fully Received",     color:"#15803d", bg:"#f0fdf4", dot:"#22c55e" },
      closed:             { label:"Closed",             color:"#374151", bg:"#f9fafb", dot:"#6b7280" },
      cancelled:          { label:"Cancelled",          color:"#991b1b", bg:"#fef2f2", dot:"#ef4444" },
    };

    const poTotal = (po) => (po.items||[]).reduce((s,it)=>s+(it.qty||0)*(it.unitCost||0),0);
    const poReceivedPct = (po) => {
      const total = (po.items||[]).reduce((s,it)=>s+(it.qty||0),0);
      const rcvd  = (po.items||[]).reduce((s,it)=>s+(it.received||0),0);
      return total>0 ? Math.round(rcvd/total*100) : 0;
    };

    // KPIs
    const totalPOs       = procPOs.length;
    const pendingApproval= procPOs.filter(p=>p.status==="draft").length;
    const openValue      = procPOs.filter(p=>!["received","closed","cancelled"].includes(p.status)).reduce((s,p)=>s+poTotal(p),0);
    const receivedThisMonth = procPOs.filter(p=>p.status==="received"&&p.date&&p.date.startsWith("2025")).length;

    const filteredPOs = procPOs.filter(p=>{
      const matchStatus = procStatusF==="all" || p.status===procStatusF;
      const matchSearch = !procSearch || p.id.toLowerCase().includes(procSearch.toLowerCase()) ||
        p.supplierName?.toLowerCase().includes(procSearch.toLowerCase());
      return matchStatus && matchSearch;
    });

    // GRN — receive goods
    // procGRN[poId][idx] = { qty, batchNo, expiryDate, condition }
    const getGrnEntry = (poId, idx) => {
      const raw = procGRN[poId]?.[idx];
      if (!raw || typeof raw === "string" || typeof raw === "number") return { qty: Number(raw||0), batchNo:"", expiryDate:"", condition:"Good" };
      return raw;
    };
    const setGrnEntry = (poId, idx, field, value) =>
      setProcGRN(prev => ({
        ...prev,
        [poId]: { ...(prev[poId]||{}), [idx]: { ...getGrnEntry(poId, idx), [field]: value } }
      }));

    const submitGRN = () => {
      if (!procGRNPO) { setProcErr("Select a PO to receive against."); return; }
      const grn = procGRN[procGRNPO.id] || {};
      const entries = Object.entries(grn).filter(([,v])=>Number(typeof v==="object"?v?.qty:v)>0);
      if (!entries.length) { setProcErr("Enter at least one received quantity."); return; }

      const today = grnMeta.receiptDate || new Date().toISOString().split("T")[0];
      let newTxns = [...invTxns];
      let newItems = [...invItems];

      entries.forEach(([idxStr, rawEntry]) => {
        const idx = Number(idxStr);
        const lineItem = procGRNPO.items[idx];
        if (!lineItem) return;
        const entry = getGrnEntry(procGRNPO.id, idx);
        const qty = Math.min(Number(entry.qty||0), (lineItem.qty||0)-(lineItem.received||0));
        if (qty<=0) return;
        const batchNo    = entry.batchNo   || lineItem.batchNo   || "BATCH-GRN";
        const expiryDate = entry.expiryDate|| lineItem.expiryDate|| "";
        const condition  = entry.condition || "Good";

        // Create stock-in transaction
        const txnId = "TXN"+String(newTxns.length+1).padStart(3,"0");
        newTxns.push({
          id:txnId, type:"in", itemId:lineItem.itemId, qty, batchNo, date:today,
          reference:procGRNPO.id,
          department:procGRNPO.department||"Pharmacy",
          notes:`GRN from ${procGRNPO.supplierName}${grnMeta.deliveryNoteNo?" · DN:"+grnMeta.deliveryNoteNo:""}${condition!=="Good"?" · Condition:"+condition:""}`,
          unitCost:lineItem.unitCost||0,
          performedBy:grnMeta.receivedBy||"Store Manager"
        });

        // Update inventory batch (use GRN batch no and expiry)
        newItems = newItems.map(it => {
          if (it.id !== lineItem.itemId) return it;
          const existing = it.batches?.find(b=>b.batchNo===batchNo);
          const newBatches = existing
            ? (it.batches||[]).map(b=>b.batchNo===batchNo?{...b,qty:b.qty+qty}:b)
            : [...(it.batches||[]),{batchNo,qty,receivedAt:today,expiryDate,unitCost:lineItem.unitCost||0,recalled:false}];
          return {...it, batches:newBatches};
        });
      });

      setInvTxns(newTxns);
      setInvItems(newItems);

      // Update PO received quantities and status
      setProcPOs(prev=>prev.map(po=>{
        if (po.id!==procGRNPO.id) return po;
        const updatedItems = po.items.map((it,idx)=>{
          const entry = getGrnEntry(po.id, idx);
          const added = Number(entry.qty||0);
          return {...it, received:(it.received||0)+Math.min(added,(it.qty||0)-(it.received||0))};
        });
        const allReceived = updatedItems.every(it=>Number(it.received)>=Number(it.qty));
        const anyReceived = updatedItems.some(it=>Number(it.received)>0);
        const newStatus   = allReceived?"received":anyReceived?"partially_received":po.status;
        return {...po, items:updatedItems, status:newStatus};
      }));

      // Persist to API
      apiCall(`/hms/purchase-orders/${procGRNPO.id}/receive`, "POST", {
        items: procGRNPO.items.map((_,idx) => {
          const entry = getGrnEntry(procGRNPO.id, idx);
          const lineItem = procGRNPO.items[idx];
          return { itemId:lineItem.itemId, qty:Number(entry.qty||0), batchNo:entry.batchNo||lineItem.batchNo||"", expiryDate:entry.expiryDate||lineItem.expiryDate||"", unitCost:lineItem.unitCost||0 };
        })
      }).catch(console.error);

      setProcGRN(prev=>({...prev,[procGRNPO.id]:{}}));
      setProcGRNPO(null);
      setProcErr("");
      showToast("GRN posted — stock updated successfully.", "success");
    };

    // Create new supplier
    const submitSupplier = () => {
      const f = procForm;
      if (!f.name?.trim())    { setProcErr("Supplier name is required."); return; }
      if (!f.phone?.trim())   { setProcErr("Phone is required."); return; }
      if (supEditId) {
        const updates = { name:f.name.trim(), category:f.category||"", contact:f.contact||"", phone:f.phone.trim(), email:f.email||"", address:f.address||"", paymentTerms:f.paymentTerms||"Net 30", rating:Number(f.rating)||0, notes:f.notes||"" };
        setProcSuppliers(prev=>prev.map(x=>x.id===supEditId?{...x,...updates}:x));
        apiCall(`/hms/suppliers/${supEditId}`, "PUT", updates).catch(console.error);
      } else {
        const id = "SUP"+String(procSuppliers.length+1).padStart(3,"0");
        const newSup = { id, supplierId:id, name:f.name.trim(), category:f.category||"", contact:f.contact||"", phone:f.phone.trim(), email:f.email||"", address:f.address||"", paymentTerms:f.paymentTerms||"Net 30", status:"active", rating:Number(f.rating)||0, notes:f.notes||"" };
        setProcSuppliers(prev=>[...prev,newSup]);
        apiCall("/hms/suppliers", "POST", newSup).catch(console.error);
      }
      setSupEditId(null);
      setProcModal(null); setProcForm({}); setProcErr("");
    };

    // Create new PO
    const submitPO = () => {
      const f = procForm;
      if (!f.supplierId)           { setProcErr("Select a supplier."); return; }
      if (!f.requestedBy?.trim())  { setProcErr("Requested By is required."); return; }
      if (!f.expectedDate?.trim()) { setProcErr("Expected delivery date is required."); return; }
      const items = (f.items||[]).filter(it=>it.itemId&&Number(it.qty)>0);
      if (!items.length)           { setProcErr("Add at least one line item with a valid quantity."); return; }
      const sup       = procSuppliers.find(s=>s.id===f.supplierId);
      const id        = "PO-"+new Date().getFullYear()+"-"+String(procPOs.length+1).padStart(3,"0");
      const subtotal  = items.reduce((s,it)=>s+(Number(it.qty)||0)*(Number(it.unitCost)||0),0);
      const discount  = Number(f.discount||0);
      const vatRate   = Number(f.vatRate||0);
      const shipping  = Number(f.shippingCost||0);
      const afterDisc = subtotal - (subtotal*discount/100);
      const vatAmt    = afterDisc*(vatRate/100);
      const grandTotal= afterDisc + vatAmt + shipping;
      const newPO = {
        id, supplierId:f.supplierId, supplierName:sup?.name||"",
        date:new Date().toISOString().split("T")[0], expectedDate:f.expectedDate,
        status:"draft", approvedBy:null,
        requestedBy:f.requestedBy||"", department:f.department||"", priority:f.priority||"Normal",
        createdBy:f.requestedBy||"Admin User",
        deliveryAddress:f.deliveryAddress||"MediCore Hospital", shippingMethod:f.shippingMethod||"", shippingCost:shipping,
        paymentTerms:f.paymentTerms||sup?.paymentTerms||"Net 30", paymentMethod:f.paymentMethod||"Bank Transfer", currency:f.currency||"KES",
        discount, vatRate, subtotal, grandTotal,
        returnPolicy:f.returnPolicy||"", warranty:f.warranty||"", penalties:f.penalties||"",
        specialInstructions:f.specialInstructions||"", notes:f.notes||"",
        items:items.map(it=>{ const inv=invItems.find(i=>i.id===it.itemId); return {
          itemId:it.itemId, itemName:inv?.name||it.itemId, unit:inv?.unit||"",
          qty:Number(it.qty), unitCost:Number(it.unitCost||0), total:Number(it.qty)*Number(it.unitCost||0), received:0
        };})
      };
      setProcPOs(prev=>[...prev,newPO]);
      apiCall("/hms/purchase-orders", "POST", { ...newPO, poId:newPO.id }).catch(console.error);
      setProcModal(null); setProcForm({}); setProcErr("");
    };

    const approvePO = (id) => { setProcPOs(prev=>prev.map(po=>po.id===id?{...po,status:"approved",approvedBy:"Admin User"}:po)); apiCall(`/hms/purchase-orders/${id}`,"PUT",{status:"approved",approvedBy:"Admin User"}).catch(console.error); };
    const sendPO    = (id) => { setProcPOs(prev=>prev.map(po=>po.id===id?{...po,status:"sent"}:po)); apiCall(`/hms/purchase-orders/${id}`,"PUT",{status:"sent"}).catch(console.error); };
    const cancelPO  = (id) => { setProcPOs(prev=>prev.map(po=>po.id===id?{...po,status:"cancelled"}:po)); apiCall(`/hms/purchase-orders/${id}`,"PUT",{status:"cancelled"}).catch(console.error); };

    const SUP_CATS = ["Pharmaceuticals","Medical Supplies","Lab Reagents","Equipment","Office Supplies","Other"];
    const PAYMENT_TERMS = ["Net 15","Net 30","Net 45","Net 60","Net 90","Immediate","COD"];

    const Tabs = ["Overview","Purchase Orders","Suppliers","Receive Goods","Analytics"];
    const tabStyle = (i) => ({
      padding:"9px 18px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",
      fontSize:13,fontWeight:procTab===i?700:500,
      background:procTab===i?"#0b1929":"transparent",
      color:procTab===i?"#fff":"#475569",transition:"all .15s"
    });

    const StatusBadge = ({status}) => {
      const s = PO_STATUS[status]||PO_STATUS.draft;
      return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,background:s.bg,color:s.color,fontSize:11,fontWeight:700}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:s.dot,flexShrink:0}}/>
        {s.label}
      </span>;
    };

    const Card = ({children,style}) => (
      <div style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,.06)",padding:"20px 22px",...style}}>{children}</div>
    );

    const KPI = ({label,value,sub,icon,color}) => (
      <div style={{background:"#fff",borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,.06)",padding:"20px 22px",display:"flex",alignItems:"flex-start",gap:16}}>
        <div style={{width:46,height:46,borderRadius:12,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icon}</div>
        <div>
          <div style={{fontSize:24,fontWeight:800,color:"#0b1929",letterSpacing:-0.5}}>{value}</div>
          <div style={{fontSize:12,fontWeight:700,color:"#475569",marginTop:1}}>{label}</div>
          {sub&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{sub}</div>}
        </div>
      </div>
    );

    // ── GRN print document builder ───────────────────────────────────────────
    const buildGRNDoc = (po, meta, grnData) => {
      const cur = po.currency||"KES";
      const fmt = (n) => `${cur} ${Number(n||0).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
      const grnId = "GRN-"+po.id+"-"+Date.now().toString(36).toUpperCase();
      const lines = (po.items||[]).map((it,idx)=>{
        const entry = grnData?.[idx]||{};
        const ordered = Number(it.qty)||0;
        const alreadyRcvd = Number(it.received)||0;
        const nowRcvd = Math.min(Number(entry.qty||0), ordered-alreadyRcvd);
        return {...it, nowRcvd, batchInput:entry.batchNo||it.batchNo||"", expiryInput:entry.expiryDate||it.expiryDate||"", condition:entry.condition||"Good", alreadyRcvd};
      }).filter(it=>it.nowRcvd>0);
      const totalQty = lines.reduce((s,l)=>s+l.nowRcvd,0);
      const totalValue = lines.reduce((s,l)=>s+l.nowRcvd*(Number(l.unitCost)||0),0);
      return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>GRN – ${grnId}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#1e293b;background:#fff}
  @media screen{body{padding:32px;max-width:900px;margin:auto}}
  @media print{body{padding:18mm 16mm}}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #059669;padding-bottom:14px;margin-bottom:20px}
  .hdr-left h1{font-size:22px;font-weight:900;color:#059669;letter-spacing:-0.5px}
  .hdr-left p{font-size:11px;color:#64748b;margin-top:3px}
  .hdr-right{text-align:right}
  .grn-num{font-size:16px;font-weight:800;color:#0b1929;font-family:monospace}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px}
  .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:18px}
  .sec-title{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #f1f5f9}
  .sec-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px}
  .row{display:flex;justify-content:space-between;margin-bottom:4px}
  .lbl{font-weight:700;color:#64748b;font-size:11px}
  .val{color:#0b1929;font-size:11px;text-align:right}
  table{width:100%;border-collapse:collapse;margin-bottom:4px;font-size:11px}
  thead tr{background:#059669;color:#fff}
  thead th{padding:8px 10px;text-align:left;font-weight:700;font-size:10px;letter-spacing:.3px}
  tbody tr:nth-child(even){background:#f8fafc}
  tbody td{padding:8px 10px;border-bottom:1px solid #e2e8f0;vertical-align:middle}
  tbody td.num{text-align:right;font-family:monospace}
  .cond-good{background:#dcfce7;color:#15803d;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700}
  .cond-damaged{background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700}
  .cond-short{background:#fef3c7;color:#d97706;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700}
  .totals{width:280px;margin-left:auto;margin-top:8px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
  .totals .tr{display:flex;justify-content:space-between;padding:7px 14px;font-size:12px;border-bottom:1px solid #f1f5f9}
  .totals .tr:last-child{background:#059669;color:#fff;font-weight:800;font-size:13px;border-bottom:none}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:30px}
  .sig-box{border-top:1.5px solid #059669;padding-top:8px}
  .sig-name{font-weight:700;font-size:12px;color:#0b1929;margin-bottom:2px}
  .sig-role{font-size:10px;color:#94a3b8}
  .sig-date{font-size:10px;color:#64748b;margin-top:16px}
  .print-bar{display:flex;gap:10px;justify-content:flex-end;margin-bottom:20px}
  .print-bar button{padding:8px 18px;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700}
  .btn-print{background:#059669;color:#fff}
  .btn-close{background:#f1f5f9;color:#0b1929}
  @media print{.print-bar{display:none}}
  .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;font-weight:900;color:rgba(5,150,105,.04);pointer-events:none;white-space:nowrap;z-index:0}
  .content{position:relative;z-index:1}
  .remarks-box{border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;margin-top:14px;font-size:11px;color:#475569;font-style:italic}
</style></head>
<body>
<div class="watermark">GOODS RECEIPT NOTE</div>
<div class="content">
<div class="print-bar">
  <button class="btn-print" onclick="window.print()">🖨 Print</button>
  <button class="btn-close" onclick="window.close()">✕ Close</button>
</div>
<div class="hdr">
  <div class="hdr-left">
    <h1>GOODS RECEIPT NOTE</h1>
    <p>MediCore Hospital Management System · Nairobi, Kenya</p>
  </div>
  <div class="hdr-right">
    <div class="grn-num">${grnId}</div>
    <div style="font-size:11px;color:#64748b;margin-top:4px">Receipt Date: ${meta.receiptDate||new Date().toLocaleDateString("en-GB")}</div>
    <div style="margin-top:4px;display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;background:#dcfce7;color:#15803d">RECEIVED</div>
  </div>
</div>
<div class="grid-3" style="margin-bottom:20px">
  <div>
    <div class="sec-title">Against Purchase Order</div>
    <div class="sec-box">
      <div class="row"><span class="lbl">PO Number</span><span class="val" style="font-family:monospace;font-weight:800">${po.id}</span></div>
      <div class="row"><span class="lbl">Supplier</span><span class="val">${po.supplierName||"—"}</span></div>
      <div class="row"><span class="lbl">PO Date</span><span class="val">${po.date||"—"}</span></div>
      <div class="row"><span class="lbl">Expected Date</span><span class="val">${po.expectedDate||"—"}</span></div>
    </div>
  </div>
  <div>
    <div class="sec-title">Delivery Information</div>
    <div class="sec-box">
      <div class="row"><span class="lbl">Delivery Note #</span><span class="val" style="font-family:monospace;font-weight:700">${meta.deliveryNoteNo||"—"}</span></div>
      <div class="row"><span class="lbl">Vehicle / Driver</span><span class="val">${meta.vehicleNo||"—"}</span></div>
      <div class="row"><span class="lbl">Receipt Date</span><span class="val">${meta.receiptDate||"—"}</span></div>
    </div>
  </div>
  <div>
    <div class="sec-title">Received By</div>
    <div class="sec-box">
      <div style="font-weight:800;font-size:13px;color:#0b1929;margin-bottom:4px">${meta.receivedBy||"____________________"}</div>
      <div style="color:#475569;font-size:11px">Store / Receiving Officer</div>
      <div style="color:#475569;font-size:11px;margin-top:6px">Dept: ${po.department||"Pharmacy / Store"}</div>
    </div>
  </div>
</div>
<div style="margin-bottom:8px">
  <div class="sec-title">Items Received (${totalQty} units across ${lines.length} line${lines.length!==1?"s":""})</div>
  <table>
    <thead><tr>
      <th style="width:30px">#</th>
      <th>Item Description</th>
      <th style="width:65px;text-align:right">Ordered</th>
      <th style="width:70px;text-align:right">Prev Rcvd</th>
      <th style="width:75px;text-align:right">Now Rcvd</th>
      <th style="width:60px;text-align:center">Unit</th>
      <th style="width:110px">Batch No.</th>
      <th style="width:90px">Expiry</th>
      <th style="width:80px">Condition</th>
      <th style="width:110px;text-align:right">Value</th>
    </tr></thead>
    <tbody>
      ${lines.map((it,i)=>`
      <tr>
        <td style="color:#94a3b8">${i+1}</td>
        <td style="font-weight:600">${it.itemName||it.itemId}</td>
        <td class="num">${it.qty||0}</td>
        <td class="num" style="color:#64748b">${it.alreadyRcvd}</td>
        <td class="num" style="font-weight:700;color:#059669">${it.nowRcvd}</td>
        <td style="text-align:center;color:#64748b">${it.unit||"—"}</td>
        <td style="font-family:monospace;font-size:11px">${it.batchInput||"—"}</td>
        <td style="font-family:monospace;font-size:11px">${it.expiryInput||"—"}</td>
        <td><span class="cond-${(it.condition||"Good").toLowerCase().replace(" ","-")}">${it.condition||"Good"}</span></td>
        <td class="num" style="font-weight:700">${fmt(it.nowRcvd*(Number(it.unitCost)||0))}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>
<div class="totals">
  <div class="tr"><span>Total Units Received</span><span>${totalQty}</span></div>
  <div class="tr"><span>Total Value (${cur})</span><span>${fmt(totalValue)}</span></div>
</div>
${meta.remarks?`<div class="remarks-box"><strong>Remarks:</strong> ${meta.remarks}</div>`:""}
<div style="margin-top:32px">
  <div class="sec-title">Authorization</div>
  <div class="sig-grid">
    <div class="sig-box">
      <div class="sig-name">${meta.receivedBy||"____________________"}</div>
      <div class="sig-role">Received By (Store Officer)</div>
      <div class="sig-date">Date: ${meta.receiptDate||"____________________"}</div>
    </div>
    <div class="sig-box">
      <div class="sig-name">____________________</div>
      <div class="sig-role">Verified By (Supervisor)</div>
      <div class="sig-date">Date: ____________________</div>
    </div>
    <div class="sig-box">
      <div class="sig-name">____________________</div>
      <div class="sig-role">Supplier Representative</div>
      <div class="sig-date">Date: ____________________</div>
    </div>
  </div>
</div>
<div style="margin-top:36px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between">
  <span>Generated by MediCore HMS · ${new Date().toLocaleString("en-GB")}</span>
  <span>GRN Ref: ${grnId} · PO Ref: ${po.id}</span>
</div>
</div></body></html>`;
    };

    // ── PO print document builder (shared by both print buttons) ────────────
    const buildPODoc = (po) => {
      const cur   = po.currency||"KES";
      const fmt   = (n) => `${cur} ${Number(n||0).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
      const sub   = (po.items||[]).reduce((s,it)=>s+(Number(it.qty)||0)*(Number(it.unitCost)||0),0);
      const disc  = po.discount||0;
      const vat   = po.vatRate||0;
      const ship  = Number(po.shippingCost||0);
      const aft   = sub-(sub*disc/100);
      const vatA  = aft*(vat/100);
      const grand = po.grandTotal!=null ? po.grandTotal : aft+vatA+ship;
      const sup   = procSuppliers.find(s=>s.id===po.supplierId)||{};
      return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Purchase Order – ${po.id}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#1e293b;background:#fff;padding:0}
  @media screen{body{padding:32px;max-width:860px;margin:auto}}
  @media print{body{padding:20mm 18mm}}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0b1929;padding-bottom:16px;margin-bottom:22px}
  .hdr-left h1{font-size:26px;font-weight:900;color:#0b1929;letter-spacing:-0.5px}
  .hdr-left p{font-size:11px;color:#64748b;margin-top:4px}
  .hdr-right{text-align:right}
  .po-num{font-size:18px;font-weight:800;color:#0b1929;font-family:monospace}
  .status-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:.5px;margin-top:6px;background:#dbeafe;color:#1d4ed8}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:18px}
  .sec-title{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #f1f5f9}
  .sec-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px}
  .row{display:flex;justify-content:space-between;margin-bottom:4px}
  .lbl{font-weight:700;color:#64748b;font-size:11px}
  .val{color:#0b1929;font-size:11px;text-align:right}
  table{width:100%;border-collapse:collapse;margin-bottom:4px;font-size:11px}
  thead tr{background:#0b1929;color:#fff}
  thead th{padding:8px 10px;text-align:left;font-weight:700;font-size:10px;letter-spacing:.3px}
  tbody tr:nth-child(even){background:#f8fafc}
  tbody td{padding:8px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top}
  tbody td.num{text-align:right;font-family:monospace}
  .totals{width:320px;margin-left:auto;margin-top:8px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
  .totals .tr{display:flex;justify-content:space-between;padding:7px 14px;font-size:12px;border-bottom:1px solid #f1f5f9}
  .totals .tr:last-child{background:#0b1929;color:#fff;font-weight:800;font-size:14px;border-bottom:none}
  .totals .tr.disc{color:#dc2626}
  .tc-box{border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:18px}
  .tc-row{display:flex;gap:8px;margin-bottom:6px;font-size:11px}
  .tc-lbl{font-weight:700;color:#475569;min-width:140px;flex-shrink:0}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:30px}
  .sig-box{border-top:1.5px solid #0b1929;padding-top:8px}
  .sig-name{font-weight:700;font-size:12px;color:#0b1929;margin-bottom:2px}
  .sig-role{font-size:10px;color:#94a3b8}
  .sig-date{font-size:10px;color:#64748b;margin-top:16px}
  .print-bar{display:flex;gap:10px;justify-content:flex-end;margin-bottom:24px}
  .print-bar button{padding:8px 18px;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700}
  .btn-print{background:#0b1929;color:#fff}
  .btn-close{background:#f1f5f9;color:#0b1929}
  @media print{.print-bar{display:none}}
  .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;font-weight:900;color:rgba(11,25,41,.04);pointer-events:none;white-space:nowrap;z-index:0}
  .content{position:relative;z-index:1}
</style>
</head>
<body>
<div class="watermark">PURCHASE ORDER</div>
<div class="content">
<div class="print-bar">
  <button class="btn-print" onclick="window.print()">🖨 Print</button>
  <button class="btn-close" onclick="window.close()">✕ Close</button>
</div>
<div class="hdr">
  <div class="hdr-left">
    <h1>PURCHASE ORDER</h1>
    <p>MediCore Hospital Management System · Nairobi, Kenya</p>
  </div>
  <div class="hdr-right">
    <div class="po-num">${po.id}</div>
    <div style="font-size:11px;color:#64748b;margin-top:4px">Issue Date: ${fmtDate(po.date)}</div>
    <div class="status-badge">${PO_STATUS[po.status]?.label||po.status||"DRAFT"}</div>
    ${po.priority&&po.priority!=="Normal"?`<div style="display:inline-block;margin-left:6px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;background:${po.priority==="Urgent"?"#fee2e2":po.priority==="High"?"#fef3c7":"#f0fdf4"};color:${po.priority==="Urgent"?"#dc2626":po.priority==="High"?"#d97706":"#15803d"}">${po.priority.toUpperCase()}</div>`:""}
  </div>
</div>
<div class="grid-2" style="margin-bottom:20px">
  <div>
    <div class="sec-title">Order Information</div>
    <div class="sec-box">
      <div class="row"><span class="lbl">PO Number</span><span class="val" style="font-family:monospace;font-weight:800">${po.id}</span></div>
      <div class="row"><span class="lbl">Issue Date</span><span class="val">${fmtDate(po.date)}</span></div>
      <div class="row"><span class="lbl">Requested By</span><span class="val">${po.requestedBy||po.createdBy||"—"}</span></div>
      <div class="row"><span class="lbl">Department</span><span class="val">${po.department||"—"}</span></div>
      <div class="row"><span class="lbl">Priority</span><span class="val">${po.priority||"Normal"}</span></div>
    </div>
  </div>
  <div>
    <div class="sec-title">Buyer Information</div>
    <div class="sec-box">
      <div style="font-weight:800;color:#0b1929;margin-bottom:4px">MediCore Hospital</div>
      <div style="color:#475569;line-height:1.6">Hospital Road, Westlands<br>Nairobi, Kenya<br>Tel: +254 700 000 000<br>Email: procurement@medicore.ke</div>
    </div>
  </div>
</div>
<div style="margin-bottom:20px">
  <div class="sec-title">Supplier / Vendor</div>
  <div class="sec-box">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
      <div>
        <div style="font-weight:800;font-size:13px;color:#0b1929;margin-bottom:4px">${po.supplierName||"—"}</div>
        ${sup.address?`<div style="color:#475569;font-size:11px">${sup.address}</div>`:""}
      </div>
      <div>
        ${sup.contact?`<div class="row"><span class="lbl">Contact</span><span class="val">${sup.contact}</span></div>`:""}
        ${sup.phone?`<div class="row"><span class="lbl">Phone</span><span class="val">${sup.phone}</span></div>`:""}
        ${sup.email?`<div class="row"><span class="lbl">Email</span><span class="val">${sup.email}</span></div>`:""}
      </div>
      <div>
        ${po.paymentTerms?`<div class="row"><span class="lbl">Payment Terms</span><span class="val">${po.paymentTerms}</span></div>`:""}
        ${po.paymentMethod?`<div class="row"><span class="lbl">Payment Method</span><span class="val">${po.paymentMethod}</span></div>`:""}
        ${po.currency?`<div class="row"><span class="lbl">Currency</span><span class="val">${po.currency}</span></div>`:""}
      </div>
    </div>
  </div>
</div>
<div class="grid-2" style="margin-bottom:20px">
  <div>
    <div class="sec-title">Delivery Information</div>
    <div class="sec-box">
      <div class="row"><span class="lbl">Expected Date</span><span class="val" style="font-weight:700;color:#0b1929">${fmtDate(po.expectedDate)}</span></div>
      ${po.deliveryAddress?`<div class="row"><span class="lbl">Deliver To</span><span class="val">${po.deliveryAddress}</span></div>`:""}
      ${po.shippingMethod?`<div class="row"><span class="lbl">Shipping Method</span><span class="val">${po.shippingMethod}</span></div>`:""}
      ${ship>0?`<div class="row"><span class="lbl">Shipping Cost</span><span class="val">${fmt(ship)}</span></div>`:""}
    </div>
  </div>
  <div>
    <div class="sec-title">Payment Information</div>
    <div class="sec-box">
      <div class="row"><span class="lbl">Payment Terms</span><span class="val">${po.paymentTerms||"—"}</span></div>
      <div class="row"><span class="lbl">Payment Method</span><span class="val">${po.paymentMethod||"—"}</span></div>
      <div class="row"><span class="lbl">Currency</span><span class="val">${po.currency||"KES"}</span></div>
      ${disc>0?`<div class="row"><span class="lbl">Discount</span><span class="val" style="color:#dc2626">${disc}%</span></div>`:""}
      ${vat>0?`<div class="row"><span class="lbl">VAT / Tax</span><span class="val">${vat}%</span></div>`:""}
    </div>
  </div>
</div>
<div style="margin-bottom:8px">
  <div class="sec-title">Order Details</div>
  <table>
    <thead><tr><th style="width:40px">#</th><th>Item Description</th><th style="width:60px;text-align:right">Qty</th><th style="width:60px;text-align:center">Unit</th><th style="width:110px;text-align:right">Unit Price</th><th style="width:120px;text-align:right">Line Total</th></tr></thead>
    <tbody>${(po.items||[]).map((it,i)=>`<tr><td style="color:#94a3b8">${i+1}</td><td><span style="font-weight:600">${it.itemName||it.itemId}</span></td><td class="num">${it.qty||0}</td><td style="text-align:center;color:#64748b">${it.unit||"—"}</td><td class="num">${fmt(it.unitCost||0)}</td><td class="num" style="font-weight:700">${fmt((Number(it.qty)||0)*(Number(it.unitCost)||0))}</td></tr>`).join("")}</tbody>
  </table>
</div>
<div class="totals">
  <div class="tr"><span>Subtotal</span><span>${fmt(sub)}</span></div>
  ${disc>0?`<div class="tr disc"><span>Discount (${disc}%)</span><span>− ${fmt(sub*disc/100)}</span></div>`:""}
  ${vat>0?`<div class="tr"><span>VAT / Tax (${vat}%)</span><span>${fmt(aft*vat/100)}</span></div>`:""}
  ${ship>0?`<div class="tr"><span>Shipping</span><span>${fmt(ship)}</span></div>`:""}
  <div class="tr"><span>Grand Total (${cur})</span><span>${fmt(grand)}</span></div>
</div>
${(po.returnPolicy||po.warranty||po.penalties||po.specialInstructions)?`<div style="margin-top:24px"><div class="sec-title">Terms &amp; Conditions</div><div class="tc-box">${po.returnPolicy?`<div class="tc-row"><span class="tc-lbl">Return / Refund Policy:</span><span>${po.returnPolicy}</span></div>`:""} ${po.warranty?`<div class="tc-row"><span class="tc-lbl">Warranty:</span><span>${po.warranty}</span></div>`:""} ${po.penalties?`<div class="tc-row"><span class="tc-lbl">Late Delivery Penalty:</span><span>${po.penalties}</span></div>`:""} ${po.specialInstructions?`<div class="tc-row"><span class="tc-lbl">Special Instructions:</span><span>${po.specialInstructions}</span></div>`:""}</div></div>`:""}
${po.notes?`<div style="margin-top:16px"><div class="sec-title">Notes</div><div class="tc-box" style="color:#475569">${po.notes}</div></div>`:""}
<div style="margin-top:32px">
  <div class="sec-title">Authorization</div>
  <div class="sig-grid">
    <div class="sig-box">
      <div class="sig-name">${po.requestedBy||po.createdBy||"____________________"}</div>
      <div class="sig-role">Requested By</div>
      ${po.department?`<div style="font-size:10px;color:#475569">${po.department}</div>`:""}
      <div class="sig-date">Date: ${fmtDate(po.date)}</div>
    </div>
    <div class="sig-box">
      <div class="sig-name">${po.approvedBy||"____________________"}</div>
      <div class="sig-role">Approved By</div>
      <div class="sig-date">Date: ____________________</div>
    </div>
    <div class="sig-box">
      <div class="sig-name">____________________</div>
      <div class="sig-role">Supplier Acknowledgement</div>
      <div class="sig-date">Date: ____________________</div>
    </div>
  </div>
</div>
<div style="margin-top:36px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between">
  <span>Generated by MediCore HMS · ${new Date().toLocaleString("en-GB")}</span>
  <span>This document is computer-generated and valid without a physical signature if electronically approved.</span>
</div>
</div></body></html>`;
    };

    // ── New PO form state helpers ────────────────────────────────────────────
    const poItems = procForm.items || [];
    const addPOLine = () => setProcForm(f=>({...f, items:[...(f.items||[]),{itemId:"",qty:1,unitCost:0}]}));
    const updatePOLine = (idx, field, val) => setProcForm(f=>({...f, items:(f.items||[]).map((it,i)=>i===idx?{...it,[field]:val}:it)}));
    const removePOLine = (idx) => setProcForm(f=>({...f, items:(f.items||[]).filter((_,i)=>i!==idx)}));

    const inputStyle = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontFamily:"inherit",fontSize:13,color:"#0b1929",outline:"none",background:"#fff" };
    const lblStyle   = { fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:.5,display:"block",marginBottom:4 };

    return (
      <Layout page={page} setPage={setPage} patients={patients} overlay={ToastModal}>
        <TopBar title="Procurement" subtitle="Purchase orders · Suppliers · Goods receipt"
          action={
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setProcForm({items:[]});setProcErr("");setProcModal("new_po");}} style={{padding:"8px 16px",background:"#0b1929",color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700}}>+ New PO</button>
              <button onClick={()=>{setProcForm({rating:4,paymentTerms:"Net 30",status:"active"});setProcErr("");setProcModal("new_supplier");}} style={{padding:"8px 16px",background:"#fff",color:"#0b1929",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>+ Supplier</button>
            </div>
          }/>

        {/* Tab bar */}
        <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"10px 22px",display:"flex",gap:4}}>
          {Tabs.map((t,i)=><button key={t} onClick={()=>setProcTab(i)} style={tabStyle(i)}>{t}</button>)}
        </div>

        <div style={{padding:"22px",flex:1,overflowY:"auto"}}>

          {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
          {procTab===0 && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:24}}>
                <KPI icon="🛒" label="Total Purchase Orders" value={totalPOs}        color="#0b1929"  sub="All time" />
                <KPI icon="⏳" label="Pending Approval"      value={pendingApproval} color="#d97706"  sub="Require sign-off" />
                <KPI icon="💰" label="Open Committed Value"  value={fmtMoney(openValue)} color="#7c3aed" sub="Active POs" />
                <KPI icon="✅" label="Received This Year"    value={receivedThisMonth}   color="#059669" sub="2025 completions" />
              </div>

              {/* Recent POs */}
              <Card>
                <div style={{fontSize:14,fontWeight:800,color:"#0b1929",marginBottom:14}}>Recent Purchase Orders</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"#f8fafc"}}>
                      {["PO Number","Supplier","Date","Expected","Items","Value","Status","Actions"].map(h=>(
                        <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:9,fontWeight:700,color:"#64748b",letterSpacing:.8,fontFamily:"monospace",borderBottom:"1.5px solid #e2e8f0"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...procPOs].reverse().slice(0,6).map((po,i)=>(
                      <tr key={po.id} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafafa"}}>
                        <td style={{padding:"10px 12px",fontSize:12,fontFamily:"monospace",color:"#0e7490",fontWeight:700}}>{po.id}</td>
                        <td style={{padding:"10px 12px",fontSize:12,fontWeight:600,color:"#0b1929"}}>{po.supplierName}</td>
                        <td style={{padding:"10px 12px",fontSize:11,color:"#475569",fontFamily:"monospace"}}>{fmtDate(po.date)}</td>
                        <td style={{padding:"10px 12px",fontSize:11,color:"#475569",fontFamily:"monospace"}}>{fmtDate(po.expectedDate)}</td>
                        <td style={{padding:"10px 12px",fontSize:12,color:"#475569"}}>{po.items?.length||0} line{po.items?.length!==1?"s":""}</td>
                        <td style={{padding:"10px 12px",fontSize:12,fontWeight:700,color:"#0b1929"}}>{fmtMoney(poTotal(po))}</td>
                        <td style={{padding:"10px 12px"}}><StatusBadge status={po.status}/></td>
                        <td style={{padding:"10px 12px"}}>
                          <div style={{display:"flex",gap:5}}>
                            {po.status==="draft"     && <button onClick={()=>approvePO(po.id)} style={{padding:"3px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,background:"#dbeafe",color:"#1d4ed8"}}>Approve</button>}
                            {po.status==="approved"  && <button onClick={()=>sendPO(po.id)}    style={{padding:"3px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,background:"#ede9fe",color:"#7c3aed"}}>Mark Sent</button>}
                            {["sent","partially_received"].includes(po.status) && (
                              <button onClick={()=>{setProcGRNPO(po);setProcGRN(prev=>({...prev,[po.id]:{}}));setProcTab(3);}} style={{padding:"3px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:700,background:"#dcfce7",color:"#15803d"}}>Receive</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {/* Supplier summary */}
              <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
                <Card style={{padding:"18px 20px"}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#0b1929",marginBottom:12}}>Active Suppliers ({procSuppliers.filter(s=>s.status==="active").length})</div>
                  {procSuppliers.filter(s=>s.status==="active").slice(0,4).map(s=>(
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #f1f5f9"}}>
                      <div style={{width:32,height:32,borderRadius:9,background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🏢</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#0b1929",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                        <div style={{fontSize:10,color:"#94a3b8"}}>{s.category} · {s.paymentTerms}</div>
                      </div>
                      <div style={{fontSize:12}}>{"⭐".repeat(s.rating)}</div>
                    </div>
                  ))}
                </Card>
                <Card style={{padding:"18px 20px"}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#0b1929",marginBottom:12}}>PO Status Breakdown</div>
                  {Object.entries(PO_STATUS).filter(([k])=>procPOs.some(p=>p.status===k)).map(([k,v])=>{
                    const count = procPOs.filter(p=>p.status===k).length;
                    const pct   = Math.round(count/procPOs.length*100);
                    return (
                      <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:v.dot,flexShrink:0}}/>
                        <div style={{flex:1,fontSize:12,color:"#475569"}}>{v.label}</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#0b1929"}}>{count}</div>
                        <div style={{width:64,height:6,borderRadius:3,background:"#f1f5f9",overflow:"hidden"}}>
                          <div style={{height:"100%",width:pct+"%",background:v.dot,borderRadius:3}}/>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </div>
            </div>
          )}

          {/* ── PURCHASE ORDERS ─────────────────────────────────────────────── */}
          {procTab===1 && (() => {
            const pendingCnt  = procPOs.filter(p=>p.status==="draft").length;
            const approvedCnt = procPOs.filter(p=>["approved","sent"].includes(p.status)).length;
            const totalVal    = procPOs.filter(p=>p.status!=="cancelled").reduce((s,p)=>s+poTotal(p),0);
            // buildPODoc is defined at component level above
            const printPO = (po) => {
              const w = window.open("","_blank");
              if (!w) return;
              w.document.write(buildPODoc(po));
              w.document.close();
            };
            return (
              <div>
                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
                  {[
                    {label:"Pending Approval", val:pendingCnt,  color:"#d97706"},
                    {label:"Approved / Sent",  val:approvedCnt, color:"#1d4ed8"},
                    {label:"Total Value",       val:"KES "+totalVal.toLocaleString(), color:"#0b1929"},
                  ].map(({label,val,color})=>(
                    <div key={label} style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",padding:"18px 22px",boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:6}}>{label}</div>
                      <div style={{fontSize:24,fontWeight:800,color}}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Toolbar */}
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",boxShadow:"0 1px 6px rgba(0,0,0,.04)",overflow:"hidden"}}>
                  <div style={{padding:"14px 20px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div style={{fontSize:15,fontWeight:800,color:"#0b1929",flexShrink:0}}>Purchase Orders</div>
                    <div style={{position:"relative",flex:1,minWidth:180}}>
                      <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#94a3b8"}}>🔍</span>
                      <input value={procSearch} onChange={e=>setProcSearch(e.target.value)} placeholder="Search PO or supplier…"
                        style={{paddingLeft:30,paddingRight:12,height:36,border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",color:"#0b1929"}}/>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {["all",...Object.keys(PO_STATUS)].map(s=>(
                        <button key={s} onClick={()=>setProcStatusF(s)}
                          style={{padding:"5px 11px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,
                            background:procStatusF===s?"#0b1929":"#f1f5f9",color:procStatusF===s?"#fff":"#64748b"}}>
                          {s==="all"?"All":PO_STATUS[s].label}
                        </button>
                      ))}
                    </div>
                    <button onClick={()=>{setProcForm({items:[]});setProcErr("");setProcModal("new_po");}}
                      style={{display:"flex",alignItems:"center",gap:5,padding:"8px 16px",background:"#0b1929",color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>
                      + New PO
                    </button>
                  </div>

                  {/* Table */}
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead>
                        <tr style={{background:"#f8fafc"}}>
                          {["PO Number","Supplier","Created","Expected","Lines","Total Value","Receipt %","Status","Actions"].map(h=>(
                            <th key={h} style={{padding:"11px 14px",textAlign:"left",fontWeight:700,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPOs.length===0 && (
                          <tr><td colSpan={9} style={{textAlign:"center",padding:"40px",color:"#94a3b8",fontSize:13}}>No purchase orders match your filter.</td></tr>
                        )}
                        {filteredPOs.map((po,i)=>{
                          const pct = poReceivedPct(po);
                          const poStatusIcon = {draft:"📋",approved:"✅",sent:"📤",partially_received:"📦",received:"🟢",cancelled:"❌"};
                          return (
                            <tr key={po.id} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafafa"}}>
                              <td style={{padding:"12px 14px",fontFamily:"monospace",fontWeight:700,color:"#0e7490",fontSize:12,whiteSpace:"nowrap"}}>{po.id}</td>
                              <td style={{padding:"12px 14px"}}>
                                <div style={{fontWeight:700,color:"#0b1929",fontSize:13}}>{po.supplierName}</div>
                                {po.notes && <div style={{fontSize:10,color:"#94a3b8",marginTop:2,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{po.notes}</div>}
                              </td>
                              <td style={{padding:"12px 14px",fontSize:11,color:"#64748b",whiteSpace:"nowrap"}}>{fmtDate(po.date)}</td>
                              <td style={{padding:"12px 14px",fontSize:11,color:"#64748b",whiteSpace:"nowrap"}}>{fmtDate(po.expectedDate)}</td>
                              <td style={{padding:"12px 14px",textAlign:"center"}}>
                                <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,background:"#f1f5f9",fontSize:11,fontWeight:700,color:"#475569"}}>{po.items?.length||0}</span>
                              </td>
                              <td style={{padding:"12px 14px",fontWeight:700,color:"#0b1929",whiteSpace:"nowrap"}}>{fmtMoney(poTotal(po))}</td>
                              <td style={{padding:"12px 14px",minWidth:100}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <div style={{flex:1,height:6,borderRadius:3,background:"#f1f5f9",overflow:"hidden"}}>
                                    <div style={{height:"100%",width:pct+"%",borderRadius:3,background:pct===100?"#22c55e":pct>0?"#f59e0b":"#e2e8f0",transition:"width .3s"}}/>
                                  </div>
                                  <span style={{fontSize:10,fontFamily:"monospace",color:"#64748b",width:30,flexShrink:0}}>{pct}%</span>
                                </div>
                              </td>
                              <td style={{padding:"12px 14px"}}><StatusBadge status={po.status}/></td>
                              <td style={{padding:"12px 14px"}}>
                                <div style={{display:"flex",gap:4,flexWrap:"nowrap",alignItems:"center"}}>
                                  {/* View */}
                                  <button onClick={()=>setPoDetailPO(po)}
                                    style={{display:"flex",alignItems:"center",gap:3,padding:"4px 9px",border:"1.5px solid #e2e8f0",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600,background:"#fff",color:"#475569",whiteSpace:"nowrap"}}>
                                    📄 View
                                  </button>
                                  {/* Approve */}
                                  {po.status==="draft" && <button onClick={()=>approvePO(po.id)}
                                    style={{padding:"4px 9px",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,background:"#dbeafe",color:"#1d4ed8",whiteSpace:"nowrap"}}>✅ Approve</button>}
                                  {/* Mark Sent */}
                                  {po.status==="approved" && <button onClick={()=>sendPO(po.id)}
                                    style={{padding:"4px 9px",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,background:"#ede9fe",color:"#7c3aed",whiteSpace:"nowrap"}}>📤 Sent</button>}
                                  {/* Receive */}
                                  {po.status==="approved" && (
                                    <span title="Mark as Sent before receiving" style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 9px",border:"1.5px dashed #d1d5db",borderRadius:7,fontSize:11,fontWeight:600,color:"#94a3b8",whiteSpace:"nowrap",cursor:"default"}}>
                                      📦 Receive
                                    </span>
                                  )}
                                  {["sent","partially_received"].includes(po.status) && (
                                    <button onClick={()=>{setProcGRNPO(po);setProcGRN(prev=>({...prev,[po.id]:{}}));setProcTab(3);}}
                                      style={{padding:"4px 9px",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,background:"#dcfce7",color:"#15803d",whiteSpace:"nowrap"}}>📦 Receive</button>
                                  )}
                                  {/* Cancel */}
                                  {["draft","approved"].includes(po.status) && <button onClick={()=>{if(window.confirm(`Cancel ${po.id}?`))cancelPO(po.id);}}
                                    style={{padding:"4px 9px",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,background:"#fee2e2",color:"#dc2626",whiteSpace:"nowrap"}}>✕</button>}
                                  {/* Print */}
                                  <button onClick={()=>printPO(po)}
                                    style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:26,border:"1.5px solid #e2e8f0",borderRadius:7,cursor:"pointer",background:"#fff",color:"#475569",fontSize:12}}>
                                    🖨
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── SUPPLIERS ───────────────────────────────────────────────────── */}
          {procTab===2 && (() => {
            const filteredSups = procSuppliers.filter(s => {
              const q = supSearch.toLowerCase();
              return !q || s.name?.toLowerCase().includes(q) || s.contact?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phone?.includes(q);
            });
            const activeCnt   = procSuppliers.filter(s=>s.status==="active").length;
            const inactiveCnt = procSuppliers.length - activeCnt;
            const renderStars = (rating) => {
              if (!rating) return <span style={{fontSize:11,color:"#94a3b8"}}>Not rated</span>;
              return (
                <div style={{display:"flex",alignItems:"center",gap:2}}>
                  {[1,2,3,4,5].map(n=>(
                    <svg key={n} width="12" height="12" viewBox="0 0 24 24" fill={n<=rating?"#f59e0b":"none"} stroke="#f59e0b" strokeWidth="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                  <span style={{fontSize:10,color:"#94a3b8",marginLeft:3}}>({Number(rating).toFixed(1)})</span>
                </div>
              );
            };
            return (
              <div>
                {/* Stats row */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
                  {[
                    {label:"Total Suppliers",  val:procSuppliers.length,  color:"#0b1929"},
                    {label:"Active Suppliers",  val:activeCnt,             color:"#15803d"},
                    {label:"Inactive Suppliers",val:inactiveCnt,           color:"#64748b"},
                  ].map(({label,val,color})=>(
                    <div key={label} style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",padding:"18px 22px",boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#64748b",marginBottom:6}}>{label}</div>
                      <div style={{fontSize:26,fontWeight:800,color}}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Toolbar */}
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",boxShadow:"0 1px 6px rgba(0,0,0,.04)",overflow:"hidden"}}>
                  <div style={{padding:"16px 20px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                    <div style={{fontSize:15,fontWeight:800,color:"#0b1929"}}>Supplier Directory</div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{position:"relative"}}>
                        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#94a3b8"}}>🔍</span>
                        <input
                          value={supSearch}
                          onChange={e=>setSupSearch(e.target.value)}
                          placeholder="Search suppliers..."
                          style={{paddingLeft:30,paddingRight:12,height:36,border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,fontFamily:"inherit",outline:"none",width:220,color:"#0b1929"}}
                        />
                      </div>
                      <button
                        onClick={()=>{setSupEditId(null);setProcForm({rating:0,paymentTerms:"Net 30",status:"active"});setProcErr("");setProcModal("new_supplier");}}
                        style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"#0b1929",color:"#fff",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,whiteSpace:"nowrap"}}>
                        + Add Supplier
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead>
                        <tr style={{background:"#f8fafc"}}>
                          {["Supplier","Contact Person","Contact Info","Payment Terms","Rating","Status","Actions"].map(h=>(
                            <th key={h} style={{padding:"11px 16px",textAlign:"left",fontWeight:700,fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSups.length===0 ? (
                          <tr><td colSpan={7} style={{padding:"32px",textAlign:"center",color:"#94a3b8",fontSize:13}}>No suppliers found.</td></tr>
                        ) : filteredSups.map((s,idx)=>(
                          <tr key={s.id} style={{borderBottom:"1px solid #f1f5f9",background:idx%2===0?"#fff":"#fafafa"}}>
                            {/* Supplier name + address */}
                            <td style={{padding:"14px 16px",verticalAlign:"middle"}}>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <div style={{width:34,height:34,borderRadius:9,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>🏢</div>
                                <div>
                                  <div style={{fontWeight:700,color:"#0b1929"}}>{s.name}</div>
                                  {s.address && <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>📍 {s.address}</div>}
                                </div>
                              </div>
                            </td>
                            {/* Contact person */}
                            <td style={{padding:"14px 16px",verticalAlign:"middle",color:"#475569"}}>
                              {s.contact || <span style={{color:"#cbd5e1"}}>—</span>}
                            </td>
                            {/* Contact info */}
                            <td style={{padding:"14px 16px",verticalAlign:"middle"}}>
                              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                                {s.email && <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#475569"}}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                  {s.email}
                                </div>}
                                {s.phone && <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#475569"}}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                                  {s.phone}
                                </div>}
                              </div>
                            </td>
                            {/* Payment terms */}
                            <td style={{padding:"14px 16px",verticalAlign:"middle",color:"#475569",fontSize:12}}>{s.paymentTerms||"—"}</td>
                            {/* Rating */}
                            <td style={{padding:"14px 16px",verticalAlign:"middle"}}>{renderStars(s.rating)}</td>
                            {/* Status badge */}
                            <td style={{padding:"14px 16px",verticalAlign:"middle"}}>
                              <span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,
                                background:s.status==="active"?"#dcfce7":"#f1f5f9",
                                color:s.status==="active"?"#15803d":"#64748b"}}>
                                {s.status==="active"?"Active":"Inactive"}
                              </span>
                            </td>
                            {/* Actions */}
                            <td style={{padding:"14px 16px",verticalAlign:"middle"}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"nowrap"}}>
                                <button
                                  onClick={()=>{setSupEditId(s.id);setProcForm({name:s.name,category:s.category||"",contact:s.contact||"",phone:s.phone||"",email:s.email||"",address:s.address||"",paymentTerms:s.paymentTerms||"Net 30",rating:s.rating||0,notes:s.notes||""});setProcErr("");setProcModal("new_supplier");}}
                                  style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",border:"1.5px solid #e2e8f0",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,background:"#fff",color:"#475569",whiteSpace:"nowrap"}}>
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={()=>{setProcForm({supplierId:s.id,items:[]});setProcErr("");setProcModal("new_po");}}
                                  style={{padding:"5px 10px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,background:"#f1f5f9",color:"#0b1929",whiteSpace:"nowrap"}}>
                                  New PO
                                </button>
                                <button
                                  onClick={()=>{const nxt=s.status==="active"?"inactive":"active";setProcSuppliers(prev=>prev.map(x=>x.id===s.id?{...x,status:nxt}:x));apiCall(`/hms/suppliers/${s.id}`,"PUT",{status:nxt}).catch(console.error);}}
                                  style={{padding:"5px 10px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,whiteSpace:"nowrap",
                                    background:s.status==="active"?"#fee2e2":"#dcfce7",
                                    color:s.status==="active"?"#dc2626":"#15803d"}}>
                                  {s.status==="active"?"Deactivate":"Activate"}
                                </button>
                                <button
                                  onClick={()=>{if(window.confirm(`Delete ${s.name}?`)){setProcSuppliers(prev=>prev.filter(x=>x.id!==s.id));apiCall(`/hms/suppliers/${s.id}`,"DELETE").catch(console.error);}}}
                                  style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,border:"none",borderRadius:7,cursor:"pointer",background:"#fee2e2",color:"#dc2626",fontSize:13}}>
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── RECEIVE GOODS (GRN) ─────────────────────────────────────────── */}
          {procTab===3 && (
            <div style={{maxWidth:980,margin:"0 auto"}}>

              {/* PO Selector */}
              <Card style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#0b1929"}}>Select Purchase Order to Receive Against</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>Approved, Sent & Partially-received POs shown</div>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {procPOs.filter(p=>["approved","sent","partially_received"].includes(p.status)).length===0
                    ? <div style={{padding:"24px 0",color:"#94a3b8",fontSize:13}}>No POs ready for receipt. Approve a PO first, then receive goods against it.</div>
                    : procPOs.filter(p=>["approved","sent","partially_received"].includes(p.status)).map(po=>{
                        const pct = poReceivedPct(po);
                        const sel = procGRNPO?.id===po.id;
                        return (
                          <button key={po.id}
                            onClick={()=>{setProcGRNPO(po);setProcGRN(prev=>({...prev,[po.id]:{}}));setProcErr("");}}
                            style={{display:"flex",flexDirection:"column",padding:"12px 16px",border:"2px solid",borderRadius:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",minWidth:210,
                              borderColor:sel?"#059669":"#e2e8f0",background:sel?"#059669":"#fff",color:sel?"#fff":"#0b1929"}}>
                            <div style={{fontSize:12,fontWeight:800,fontFamily:"monospace"}}>{po.id}</div>
                            <div style={{fontSize:11,marginTop:2,opacity:.8}}>{po.supplierName}</div>
                            <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6}}>
                              <StatusBadge status={po.status}/>
                            </div>
                            {pct>0 && (
                              <div style={{marginTop:8}}>
                                <div style={{height:4,borderRadius:2,background:sel?"rgba(255,255,255,.3)":"#f1f5f9",overflow:"hidden"}}>
                                  <div style={{height:"100%",width:pct+"%",borderRadius:2,background:sel?"#fff":"#059669"}}/>
                                </div>
                                <div style={{fontSize:10,marginTop:3,opacity:.75}}>{pct}% received</div>
                              </div>
                            )}
                          </button>
                        );
                      })
                  }
                </div>
              </Card>

              {procGRNPO && (
                <>
                  {/* GRN Header Metadata */}
                  <Card style={{marginBottom:18}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#0b1929",marginBottom:14}}>
                      📋 Goods Receipt — {procGRNPO.id}
                      <span style={{marginLeft:10,fontSize:11,fontWeight:500,color:"#64748b"}}>
                        Supplier: <strong>{procGRNPO.supplierName}</strong> · Expected: {fmtDate(procGRNPO.expectedDate)}
                      </span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 2fr",gap:14}}>
                      {[
                        {label:"Received By *",     field:"receivedBy",      type:"text",  ph:"Store Officer name"},
                        {label:"Delivery Note #",   field:"deliveryNoteNo",  type:"text",  ph:"DN-12345"},
                        {label:"Receipt Date *",    field:"receiptDate",     type:"date",  ph:""},
                        {label:"Vehicle / Driver",  field:"vehicleNo",       type:"text",  ph:"KBZ 123A"},
                        {label:"Remarks / Notes",   field:"remarks",         type:"text",  ph:"Any notes about this delivery"},
                      ].map(({label,field,type,ph})=>(
                        <div key={field}>
                          <div style={{fontSize:10,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:.6}}>{label}</div>
                          <input type={type} placeholder={ph}
                            value={grnMeta[field]||""}
                            onChange={e=>setGrnMeta(m=>({...m,[field]:e.target.value}))}
                            style={{width:"100%",padding:"8px 11px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",color:"#0b1929"}}/>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Line Items Table */}
                  <Card style={{marginBottom:18}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#0b1929",marginBottom:14}}>Line Items — Enter Batch No., Expiry Date, Condition, and Quantity Received</div>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
                        <thead>
                          <tr style={{background:"#0b1929",color:"#fff"}}>
                            {["#","Item","Unit","Ordered","Prev Rcvd","Outstanding","Batch No. *","Expiry Date","Condition","Qty to Receive"].map((h,i)=>(
                              <th key={h} style={{padding:"9px 10px",textAlign:i>=3&&i<=5?"center":"left",fontSize:9,fontWeight:700,letterSpacing:.8,whiteSpace:"nowrap"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {procGRNPO.items.map((it,idx)=>{
                            const outstanding = (it.qty||0)-(it.received||0);
                            const entry = getGrnEntry(procGRNPO.id, idx);
                            const isFull = outstanding === 0;
                            const inpStyle = {padding:"6px 8px",border:"1.5px solid #e2e8f0",borderRadius:7,fontFamily:"monospace",fontSize:12,outline:"none",width:"100%",color:"#0b1929"};
                            return (
                              <tr key={idx} style={{borderBottom:"1px solid #f1f5f9",background:isFull?"#f0fdf4":"#fff"}}>
                                <td style={{padding:"10px 10px",fontSize:11,color:"#94a3b8",width:30}}>{idx+1}</td>
                                <td style={{padding:"10px 10px",fontSize:12,fontWeight:700,color:"#0b1929",minWidth:160}}>{it.itemName}</td>
                                <td style={{padding:"10px 10px",fontSize:11,color:"#64748b"}}>{it.unit}</td>
                                <td style={{padding:"10px 10px",fontSize:12,fontFamily:"monospace",textAlign:"center"}}>{it.qty}</td>
                                <td style={{padding:"10px 10px",fontSize:12,fontFamily:"monospace",textAlign:"center",color:"#64748b"}}>{it.received||0}</td>
                                <td style={{padding:"10px 10px",fontSize:12,fontFamily:"monospace",fontWeight:700,textAlign:"center",color:outstanding>0?"#b45309":"#15803d"}}>{outstanding}</td>

                                {/* Batch No input */}
                                <td style={{padding:"8px 8px",minWidth:120}}>
                                  {isFull ? <span style={{fontSize:11,color:"#15803d",fontWeight:700}}>✓ Done</span>
                                    : <input type="text" placeholder="e.g. BN-2025-001"
                                        value={entry.batchNo||""}
                                        onChange={e=>setGrnEntry(procGRNPO.id,idx,"batchNo",e.target.value)}
                                        style={inpStyle}/>
                                  }
                                </td>

                                {/* Expiry Date input */}
                                <td style={{padding:"8px 8px",minWidth:130}}>
                                  {isFull ? "—"
                                    : <input type="date"
                                        value={entry.expiryDate||""}
                                        onChange={e=>setGrnEntry(procGRNPO.id,idx,"expiryDate",e.target.value)}
                                        style={inpStyle}/>
                                  }
                                </td>

                                {/* Condition dropdown */}
                                <td style={{padding:"8px 8px",minWidth:110}}>
                                  {isFull ? "—"
                                    : <select
                                        value={entry.condition||"Good"}
                                        onChange={e=>setGrnEntry(procGRNPO.id,idx,"condition",e.target.value)}
                                        style={{...inpStyle,background:"#fff"}}>
                                        <option>Good</option>
                                        <option>Damaged</option>
                                        <option>Short Delivery</option>
                                      </select>
                                  }
                                </td>

                                {/* Qty to receive input */}
                                <td style={{padding:"8px 8px",minWidth:100}}>
                                  {isFull
                                    ? <span style={{fontSize:11,color:"#15803d",fontWeight:700}}>✓ Complete</span>
                                    : <input type="number" min={0} max={outstanding} placeholder="0"
                                        value={entry.qty||""}
                                        onChange={e=>setGrnEntry(procGRNPO.id,idx,"qty",e.target.value)}
                                        style={{...inpStyle,textAlign:"center",width:90}}/>
                                  }
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Running total */}
                    {(() => {
                      const totalNow  = procGRNPO.items.reduce((s,_,idx)=>s+Math.min(Number(getGrnEntry(procGRNPO.id,idx).qty||0),(procGRNPO.items[idx].qty||0)-(procGRNPO.items[idx].received||0)),0);
                      const totalVal  = procGRNPO.items.reduce((s,it,idx)=>s+Math.min(Number(getGrnEntry(procGRNPO.id,idx).qty||0),(it.qty||0)-(it.received||0))*(it.unitCost||0),0);
                      return totalNow > 0 ? (
                        <div style={{display:"flex",justifyContent:"flex-end",gap:20,marginTop:14,padding:"12px 16px",background:"#f0fdf4",borderRadius:10,fontSize:13}}>
                          <span style={{color:"#64748b"}}>Units to receive: <strong style={{color:"#059669"}}>{totalNow}</strong></span>
                          <span style={{color:"#64748b"}}>Value: <strong style={{color:"#059669"}}>{fmtMoney(totalVal)}</strong></span>
                        </div>
                      ) : null;
                    })()}
                  </Card>

                  {/* Actions */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <button onClick={()=>{setProcGRNPO(null);setProcErr("");}}
                      style={{padding:"10px 22px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,color:"#475569",background:"#fff"}}>
                      ← Cancel
                    </button>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      {procErr && <div style={{padding:"8px 14px",background:"#fef2f2",borderRadius:8,color:"#dc2626",fontSize:12,fontWeight:600}}>{procErr}</div>}
                      <button
                        onClick={()=>{
                          const w = window.open("","_blank");
                          if (!w) return;
                          w.document.write(buildGRNDoc(procGRNPO, grnMeta, procGRN[procGRNPO.id]||{}));
                          w.document.close();
                        }}
                        style={{padding:"10px 20px",border:"1.5px solid #059669",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:"#059669",background:"#fff",display:"flex",alignItems:"center",gap:6}}>
                        🖨 Preview GRN
                      </button>
                      <button onClick={submitGRN}
                        style={{padding:"10px 26px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:800,color:"#fff",background:"#059669",display:"flex",alignItems:"center",gap:6}}>
                        ✓ Post GRN & Update Stock
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── SUPPLIER ANALYTICS ───────────────────────────────────────────── */}
          {procTab===4 && (() => {
            const getScoreColor = (s) => s>=80?"#15803d":s>=60?"#d97706":"#dc2626";
            const getScoreBg    = (s) => s>=80?"#dcfce7":s>=60?"#fef3c7":"#fee2e2";
            const renderBar = (pct) => (
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{flex:1,height:6,borderRadius:3,background:"#f1f5f9",overflow:"hidden",minWidth:60}}>
                  <div style={{height:"100%",width:Math.min(pct,100)+"%",borderRadius:3,background:pct>=80?"#22c55e":pct>=60?"#f59e0b":"#ef4444",transition:"width .3s"}}/>
                </div>
                <span style={{fontSize:11,fontFamily:"monospace",width:38,flexShrink:0,color:getScoreColor(pct),fontWeight:700}}>{pct.toFixed(1)}%</span>
              </div>
            );

            // Compute per-supplier analytics from procPOs
            const supplierStats = procSuppliers.map(sup => {
              const supPOs = procPOs.filter(p=>p.supplierId===sup.id);
              const totalOrders = supPOs.length;
              const totalValue  = supPOs.reduce((s,p)=>s+poTotal(p),0);
              const avgOrderVal = totalOrders>0 ? totalValue/totalOrders : 0;
              const received    = supPOs.filter(p=>["received","partially_received"].includes(p.status));
              // On-time: received before or on expectedDate
              const onTime = received.filter(p=>p.date&&p.expectedDate&&p.date<=p.expectedDate).length;
              const onTimeRate = received.length>0 ? (onTime/received.length)*100 : 0;
              // Fulfillment: fully received POs / total non-cancelled
              const nonCancelled = supPOs.filter(p=>p.status!=="cancelled");
              const fullyRcvd    = supPOs.filter(p=>p.status==="received").length;
              const fulfillRate  = nonCancelled.length>0 ? (fullyRcvd/nonCancelled.length)*100 : 0;
              // Performance score: avg of onTime, fulfillment, and rating
              const ratingScore  = ((sup.rating||0)/5)*100;
              const perfScore    = (onTimeRate*0.35 + fulfillRate*0.35 + ratingScore*0.30);
              const lastOrder    = supPOs.length>0 ? supPOs.sort((a,b)=>(b.date||"")>(a.date||"")?1:-1)[0].date : null;
              return { sup, totalOrders, totalValue, avgOrderVal, onTimeRate, fulfillRate, perfScore, lastOrder };
            });

            const analyticsFiltered = analyticsSupId==="all" ? supplierStats : supplierStats.filter(x=>x.sup.id===analyticsSupId);
            const totalOrdersAll    = supplierStats.reduce((s,x)=>s+x.totalOrders,0);
            const totalValueAll     = supplierStats.reduce((s,x)=>s+x.totalValue,0);
            const avgOnTime         = supplierStats.length>0 ? supplierStats.reduce((s,x)=>s+x.onTimeRate,0)/supplierStats.length : 0;
            const avgFulfill        = supplierStats.length>0 ? supplierStats.reduce((s,x)=>s+x.fulfillRate,0)/supplierStats.length : 0;
            const preferred         = supplierStats.filter(x=>x.sup.rating>=4.5&&x.sup.status==="active");
            const highPerf          = supplierStats.filter(x=>x.perfScore>=80);
            const lowOnTime         = supplierStats.filter(x=>x.totalOrders>0&&x.onTimeRate<70);
            const lowFulfill        = supplierStats.filter(x=>x.totalOrders>0&&x.fulfillRate<80);

            return (
              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                {/* Header with supplier filter */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:20,fontWeight:800,color:"#0b1929"}}>Supplier Analytics</div>
                    <div style={{fontSize:12,color:"#64748b",marginTop:2}}>Performance metrics and insights for supplier management.</div>
                  </div>
                  <select value={analyticsSupId} onChange={e=>setAnalyticsSupId(e.target.value)}
                    style={{padding:"8px 14px",border:"1.5px solid #e2e8f0",borderRadius:9,fontFamily:"inherit",fontSize:13,color:"#0b1929",outline:"none",background:"#fff",minWidth:200}}>
                    <option value="all">All Suppliers</option>
                    {procSuppliers.filter(s=>s.status==="active").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Overall KPI cards */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                  {[
                    {label:"Total Orders",       val:totalOrdersAll,               sub:`Across ${procSuppliers.length} suppliers`, color:"#0b1929"},
                    {label:"Total Value",         val:"KES "+totalValueAll.toLocaleString(), sub:"All-time procurement value",      color:"#0b1929"},
                    {label:"On-Time Delivery",    val:avgOnTime.toFixed(1)+"%",    sub:"Average across suppliers",                 color:getScoreColor(avgOnTime)},
                    {label:"Fulfillment Rate",    val:avgFulfill.toFixed(1)+"%",   sub:"Complete deliveries",                      color:getScoreColor(avgFulfill)},
                  ].map(({label,val,sub,color})=>(
                    <div key={label} style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",padding:"18px 20px",boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
                      <div style={{fontSize:11,fontWeight:600,color:"#64748b",marginBottom:6}}>{label}</div>
                      <div style={{fontSize:22,fontWeight:800,color}}>{val}</div>
                      <div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Preferred Suppliers */}
                {preferred.length>0 && (
                  <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",padding:"18px 20px",boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
                    <div style={{fontSize:14,fontWeight:800,color:"#0b1929",marginBottom:4,display:"flex",alignItems:"center",gap:6}}>⭐ Preferred Suppliers</div>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>Top-performing suppliers based on rating and fulfillment metrics.</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                      {preferred.map(x=>(
                        <span key={x.sup.id} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,background:"#0b1929",color:"#fff",fontSize:12,fontWeight:700}}>
                          ⭐ {x.sup.name}
                          <span style={{opacity:.7,fontSize:10,marginLeft:4}}>{x.perfScore.toFixed(0)}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance table */}
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
                  <div style={{padding:"16px 20px",borderBottom:"1px solid #f1f5f9",fontSize:14,fontWeight:800,color:"#0b1929"}}>Supplier Performance Comparison</div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead>
                        <tr style={{background:"#f8fafc"}}>
                          {["Supplier","Orders","Total Value","On-Time Rate","Fulfillment","Perf. Score","Rating"].map(h=>(
                            <th key={h} style={{padding:"11px 16px",textAlign:"left",fontWeight:700,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsFiltered.length===0 ? (
                          <tr><td colSpan={7} style={{padding:"32px",textAlign:"center",color:"#94a3b8",fontSize:13}}>No performance data available.</td></tr>
                        ) : analyticsFiltered.map((x,i)=>(
                          <tr key={x.sup.id} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafafa"}}>
                            <td style={{padding:"14px 16px"}}>
                              <div style={{fontWeight:700,color:"#0b1929"}}>{x.sup.name}</div>
                              {x.lastOrder && <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>Last order: {fmtDate(x.lastOrder)}</div>}
                            </td>
                            <td style={{padding:"14px 16px",fontWeight:700,color:"#0b1929"}}>{x.totalOrders}</td>
                            <td style={{padding:"14px 16px"}}>
                              <div style={{fontWeight:700,color:"#0b1929",fontSize:12}}>KES {x.totalValue.toLocaleString()}</div>
                              <div style={{fontSize:10,color:"#94a3b8"}}>Avg: KES {x.avgOrderVal.toLocaleString(undefined,{maximumFractionDigits:0})}</div>
                            </td>
                            <td style={{padding:"14px 16px",minWidth:130}}>{x.totalOrders>0 ? renderBar(x.onTimeRate) : <span style={{fontSize:11,color:"#94a3b8"}}>No data</span>}</td>
                            <td style={{padding:"14px 16px",minWidth:130}}>{x.totalOrders>0 ? renderBar(x.fulfillRate) : <span style={{fontSize:11,color:"#94a3b8"}}>No data</span>}</td>
                            <td style={{padding:"14px 16px",minWidth:130}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <span style={{fontSize:18,fontWeight:800,color:getScoreColor(x.perfScore)}}>{x.perfScore.toFixed(0)}</span>
                                <div style={{flex:1,height:6,borderRadius:3,background:"#f1f5f9",overflow:"hidden",minWidth:50}}>
                                  <div style={{height:"100%",width:Math.min(x.perfScore,100)+"%",borderRadius:3,background:x.perfScore>=80?"#22c55e":x.perfScore>=60?"#f59e0b":"#ef4444"}}/>
                                </div>
                              </div>
                            </td>
                            <td style={{padding:"14px 16px"}}>
                              <span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:getScoreBg(x.perfScore),color:getScoreColor(x.perfScore)}}>
                                {x.perfScore>=80?"⭐ Excellent":x.perfScore>=60?"👍 Good":"⚠ Improve"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detailed scorecard for selected supplier */}
                {analyticsSupId!=="all" && analyticsFiltered.length>0 && (() => {
                  const x = analyticsFiltered[0];
                  return (
                    <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",padding:"20px",boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
                      <div style={{fontSize:14,fontWeight:800,color:"#0b1929",marginBottom:4}}>Detailed Scorecard: {x.sup.name}</div>
                      <div style={{fontSize:11,color:"#64748b",marginBottom:16}}>Breakdown of performance metrics.</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
                        <div style={{display:"flex",flexDirection:"column",gap:14}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1}}>Performance Metrics</div>
                          {[["⏱ Delivery",x.onTimeRate],["📦 Fulfillment",x.fulfillRate],["⭐ Rating",((x.sup.rating||0)/5)*100]].map(([label,val])=>(
                            <div key={label}>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                                <span style={{fontWeight:600,color:"#475569"}}>{label}</span>
                                <span style={{fontWeight:700,color:getScoreColor(val)}}>{val.toFixed(1)}%</span>
                              </div>
                              <div style={{height:8,borderRadius:4,background:"#f1f5f9",overflow:"hidden"}}>
                                <div style={{height:"100%",width:Math.min(val,100)+"%",borderRadius:4,background:val>=80?"#22c55e":val>=60?"#f59e0b":"#ef4444",transition:"width .3s"}}/>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:10}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:1}}>Key Statistics</div>
                          {[["Total Orders",x.totalOrders],["Total Value","KES "+x.totalValue.toLocaleString()],["Avg Order Value","KES "+x.avgOrderVal.toLocaleString(undefined,{maximumFractionDigits:0})],["Last Order",fmtDate(x.lastOrder)]].map(([l,v])=>(
                            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#f8fafc",borderRadius:9}}>
                              <span style={{fontSize:12,color:"#475569",fontWeight:600}}>{l}</span>
                              <span style={{fontSize:14,fontWeight:800,color:"#0b1929"}}>{v}</span>
                            </div>
                          ))}
                          <div style={{marginTop:6,padding:"14px",border:"2px solid #0b1929",borderRadius:12}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <span style={{fontSize:12,fontWeight:600,color:"#475569"}}>Overall Score</span>
                              <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                                <span style={{fontSize:28,fontWeight:800,color:getScoreColor(x.perfScore)}}>{x.perfScore.toFixed(0)}</span>
                                <span style={{fontSize:12,color:"#94a3b8"}}>/100</span>
                              </div>
                            </div>
                            <div style={{marginTop:8,height:10,borderRadius:5,background:"#f1f5f9",overflow:"hidden"}}>
                              <div style={{height:"100%",width:Math.min(x.perfScore,100)+"%",borderRadius:5,background:x.perfScore>=80?"#22c55e":x.perfScore>=60?"#f59e0b":"#ef4444"}}/>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Recommendations */}
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid #e2e8f0",padding:"20px",boxShadow:"0 1px 6px rgba(0,0,0,.04)"}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#0b1929",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>🏆 Recommendations</div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {highPerf.length>0 && (
                      <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10}}>
                        <span style={{fontSize:16,flexShrink:0}}>👍</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"#15803d"}}>Excellent Performers Identified</div>
                          <div style={{fontSize:12,color:"#166534",marginTop:3}}>{highPerf.length} supplier(s) with performance scores above 80%. Consider prioritizing these for critical orders.</div>
                        </div>
                      </div>
                    )}
                    {lowOnTime.length>0 && (
                      <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10}}>
                        <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"#b45309"}}>Delivery Performance Concerns</div>
                          <div style={{fontSize:12,color:"#92400e",marginTop:3}}>{lowOnTime.length} supplier(s) with on-time delivery below 70%. Review delivery terms or consider alternatives for urgent orders.</div>
                        </div>
                      </div>
                    )}
                    {lowFulfill.length>0 && (
                      <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10}}>
                        <span style={{fontSize:16,flexShrink:0}}>🚨</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"#dc2626"}}>Fulfillment Issues Detected</div>
                          <div style={{fontSize:12,color:"#991b1b",marginTop:3}}>{lowFulfill.length} supplier(s) with fulfillment rates below 80%. Frequent partial deliveries may indicate capacity issues.</div>
                        </div>
                      </div>
                    )}
                    {highPerf.length===0 && lowOnTime.length===0 && lowFulfill.length===0 && (
                      <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10}}>
                        <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"#475569"}}>Insufficient Data</div>
                          <div style={{fontSize:12,color:"#64748b",marginTop:3}}>Not enough order history to generate recommendations. Continue placing orders to build performance data.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── NEW PO MODAL ─────────────────────────────────────────────────── */}
        {procModal==="new_po" && (()=>{
          const sup       = procSuppliers.find(s=>s.id===procForm.supplierId);
          const subtotal  = poItems.reduce((s,it)=>s+(Number(it.qty)||0)*(Number(it.unitCost)||0),0);
          const discAmt   = subtotal*(Number(procForm.discount||0)/100);
          const afterDisc = subtotal-discAmt;
          const vatAmt    = afterDisc*(Number(procForm.vatRate||0)/100);
          const ship      = Number(procForm.shippingCost||0);
          const grandTotal= afterDisc+vatAmt+ship;
          const autoPoNo  = "PO-"+new Date().getFullYear()+"-"+String(procPOs.length+1).padStart(3,"0");
          const SH = ({n})=><div style={{fontSize:11,fontWeight:800,color:"#0b1929",textTransform:"uppercase",letterSpacing:.8,padding:"14px 0 8px",borderBottom:"2px solid #f1f5f9",marginBottom:14,marginTop:4}}>{n}</div>;
          const G2 = ({children})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>{children}</div>;
          const G3 = ({children})=><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>{children}</div>;
          const Fld = ({l,children})=><div><label style={lblStyle}>{l}</label>{children}</div>;
          return (
            <div style={{position:"fixed",inset:0,background:"rgba(7,24,40,.6)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:998,overflow:"auto",padding:"24px 16px"}}>
              <div style={{background:"#fff",borderRadius:18,padding:"28px 32px",width:"100%",maxWidth:800,boxShadow:"0 32px 80px rgba(0,0,0,.3)",marginTop:16,marginBottom:24}}>

                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div>
                    <div style={{fontSize:20,fontWeight:800,color:"#0b1929"}}>New Purchase Order</div>
                    <div style={{fontSize:12,color:"#94a3b8",marginTop:3,fontFamily:"monospace"}}>{autoPoNo} · {new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
                  </div>
                  <button onClick={()=>{setProcModal(null);setProcForm({});setProcErr("");}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8",lineHeight:1,padding:4}}>✕</button>
                </div>

                {/* 1. Order Information */}
                <SH n="1. Order Information" />
                <G2>
                  <Fld l="Requested By *"><input value={procForm.requestedBy||""} onChange={e=>setProcForm(f=>({...f,requestedBy:e.target.value}))} placeholder="e.g. Dr. Amara Okonkwo" style={inputStyle}/></Fld>
                  <Fld l="Department"><select value={procForm.department||""} onChange={e=>setProcForm(f=>({...f,department:e.target.value}))} style={{...inputStyle,background:"#fff"}}>
                    <option value="">— Select department —</option>
                    {["Pharmacy","Laboratory","Ward","Theatre","ICU","Outpatient","Administration","Radiology"].map(d=><option key={d}>{d}</option>)}
                  </select></Fld>
                  <Fld l="Priority"><select value={procForm.priority||"Normal"} onChange={e=>setProcForm(f=>({...f,priority:e.target.value}))} style={{...inputStyle,background:"#fff"}}>
                    {["Low","Normal","High","Urgent"].map(p=><option key={p}>{p}</option>)}
                  </select></Fld>
                  <Fld l="Issue Date"><div style={{...inputStyle,background:"#f8fafc",color:"#64748b"}}>{new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})}</div></Fld>
                </G2>

                {/* 2. Supplier */}
                <SH n="2. Supplier / Vendor" />
                <div style={{marginBottom:14}}>
                  <label style={lblStyle}>Supplier *</label>
                  <select value={procForm.supplierId||""} onChange={e=>setProcForm(f=>({...f,supplierId:e.target.value}))} style={{...inputStyle,background:"#fff"}}>
                    <option value="">— Select active supplier —</option>
                    {procSuppliers.filter(s=>s.status==="active").map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {sup && (
                    <div style={{marginTop:8,padding:"10px 14px",background:"#f8fafc",borderRadius:9,fontSize:12,color:"#475569",display:"flex",gap:24,flexWrap:"wrap",border:"1px solid #e2e8f0"}}>
                      {sup.contact&&<span>👤 {sup.contact}</span>}
                      {sup.phone&&<span>📞 {sup.phone}</span>}
                      {sup.email&&<span>✉️ {sup.email}</span>}
                      {sup.address&&<span>📍 {sup.address}</span>}
                    </div>
                  )}
                </div>

                {/* 3. Delivery */}
                <SH n="3. Delivery Information" />
                <G2>
                  <Fld l="Expected Delivery Date *"><input type="date" value={procForm.expectedDate||""} onChange={e=>setProcForm(f=>({...f,expectedDate:e.target.value}))} style={inputStyle}/></Fld>
                  <Fld l="Shipping Method"><select value={procForm.shippingMethod||""} onChange={e=>setProcForm(f=>({...f,shippingMethod:e.target.value}))} style={{...inputStyle,background:"#fff"}}>
                    <option value="">— Select method —</option>
                    {["Supplier Delivery","Own Collection","Courier","Motorcycle","Bus / Matatu","Other"].map(m=><option key={m}>{m}</option>)}
                  </select></Fld>
                  <Fld l="Delivery Address"><input value={procForm.deliveryAddress||"MediCore Hospital"} onChange={e=>setProcForm(f=>({...f,deliveryAddress:e.target.value}))} placeholder="e.g. MediCore Hospital, Nairobi" style={inputStyle}/></Fld>
                  <Fld l="Shipping Cost (KES)"><input type="number" min={0} step={0.01} value={procForm.shippingCost||""} onChange={e=>setProcForm(f=>({...f,shippingCost:e.target.value}))} placeholder="0.00" style={inputStyle}/></Fld>
                </G2>

                {/* 4. Payment */}
                <SH n="4. Payment Information" />
                <G3>
                  <Fld l="Payment Terms"><select value={procForm.paymentTerms||sup?.paymentTerms||"Net 30"} onChange={e=>setProcForm(f=>({...f,paymentTerms:e.target.value}))} style={{...inputStyle,background:"#fff"}}>
                    {PAYMENT_TERMS.map(t=><option key={t}>{t}</option>)}
                  </select></Fld>
                  <Fld l="Payment Method"><select value={procForm.paymentMethod||"Bank Transfer"} onChange={e=>setProcForm(f=>({...f,paymentMethod:e.target.value}))} style={{...inputStyle,background:"#fff"}}>
                    {["Bank Transfer","Cash","M-Pesa","Cheque","Credit","Other"].map(m=><option key={m}>{m}</option>)}
                  </select></Fld>
                  <Fld l="Currency"><select value={procForm.currency||"KES"} onChange={e=>setProcForm(f=>({...f,currency:e.target.value}))} style={{...inputStyle,background:"#fff"}}>
                    {["KES","USD","EUR","GBP","UGX","TZS"].map(c=><option key={c}>{c}</option>)}
                  </select></Fld>
                  <Fld l="Discount (%)"><input type="number" min={0} max={100} step={0.1} value={procForm.discount||""} onChange={e=>setProcForm(f=>({...f,discount:e.target.value}))} placeholder="0" style={inputStyle}/></Fld>
                  <Fld l="VAT / Tax (%)"><input type="number" min={0} max={100} step={0.1} value={procForm.vatRate||""} onChange={e=>setProcForm(f=>({...f,vatRate:e.target.value}))} placeholder="16" style={inputStyle}/></Fld>
                </G3>

                {/* 5. Order Details / Line Items */}
                <SH n="5. Order Details" />
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontSize:12,color:"#64748b"}}>Add each item being ordered below</span>
                    <button onClick={addPOLine} style={{padding:"6px 16px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,background:"#0b1929",color:"#fff"}}>+ Add Line</button>
                  </div>
                  {poItems.length===0 && (
                    <div style={{color:"#94a3b8",fontSize:12,padding:"20px 0",textAlign:"center",border:"1.5px dashed #e2e8f0",borderRadius:10}}>
                      No line items yet. Click "+ Add Line" to begin.
                    </div>
                  )}
                  {poItems.length>0 && <>
                    <div style={{display:"grid",gridTemplateColumns:"2.5fr 0.7fr 0.6fr 1.1fr 1.1fr auto",gap:8,marginBottom:6,paddingBottom:6,borderBottom:"2px solid #f1f5f9"}}>
                      {["Item Description *","Qty *","Unit","Unit Price *","Line Total",""].map(h=>(
                        <div key={h} style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:.5,textTransform:"uppercase"}}>{h}</div>
                      ))}
                    </div>
                    {poItems.map((it,idx)=>{
                      const inv = invItems.find(i=>i.id===it.itemId);
                      const lineTotal = (Number(it.qty)||0)*(Number(it.unitCost)||0);
                      return (
                        <div key={idx} style={{display:"grid",gridTemplateColumns:"2.5fr 0.7fr 0.6fr 1.1fr 1.1fr auto",gap:8,marginBottom:8,alignItems:"center"}}>
                          <select value={it.itemId||""} onChange={e=>updatePOLine(idx,"itemId",e.target.value)} style={{...inputStyle,fontSize:12}}>
                            <option value="">— Select item —</option>
                            {invItems.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                          <input type="number" min={1} value={it.qty||""} onChange={e=>updatePOLine(idx,"qty",e.target.value)} placeholder="0" style={{...inputStyle,fontSize:12}}/>
                          <div style={{padding:"9px 8px",background:"#f8fafc",borderRadius:9,fontSize:12,color:"#64748b",border:"1.5px solid #e2e8f0",textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv?.unit||"—"}</div>
                          <input type="number" min={0} step={0.01} value={it.unitCost||""} onChange={e=>updatePOLine(idx,"unitCost",e.target.value)} placeholder="0.00" style={{...inputStyle,fontSize:12}}/>
                          <div style={{padding:"9px 10px",background:"#f0fdf4",borderRadius:9,fontSize:12,fontWeight:700,color:"#166534",border:"1.5px solid #bbf7d0",fontFamily:"monospace"}}>{fmtMoney(lineTotal)}</div>
                          <button onClick={()=>removePOLine(idx)} style={{padding:"7px 10px",border:"none",borderRadius:7,cursor:"pointer",background:"#fee2e2",color:"#dc2626",fontSize:13,fontWeight:700}}>✕</button>
                        </div>
                      );
                    })}
                    <div style={{marginTop:14,padding:"14px 18px",background:"#f8fafc",borderRadius:10,border:"1.5px solid #e2e8f0"}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b",marginBottom:6}}><span>Subtotal</span><span style={{fontFamily:"monospace"}}>{fmtMoney(subtotal)}</span></div>
                      {Number(procForm.discount||0)>0 && <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#dc2626",marginBottom:6}}><span>Discount ({procForm.discount}%)</span><span style={{fontFamily:"monospace"}}>− {fmtMoney(discAmt)}</span></div>}
                      {Number(procForm.vatRate||0)>0 && <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b",marginBottom:6}}><span>VAT ({procForm.vatRate}%)</span><span style={{fontFamily:"monospace"}}>{fmtMoney(vatAmt)}</span></div>}
                      {ship>0 && <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b",marginBottom:6}}><span>Shipping</span><span style={{fontFamily:"monospace"}}>{fmtMoney(ship)}</span></div>}
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800,color:"#0b1929",borderTop:"1.5px solid #e2e8f0",paddingTop:10,marginTop:6}}>
                        <span>Grand Total ({procForm.currency||"KES"})</span>
                        <span style={{fontFamily:"monospace"}}>{fmtMoney(grandTotal)}</span>
                      </div>
                    </div>
                  </>}
                </div>

                {/* 6. Terms & Conditions */}
                <SH n="6. Terms & Conditions" />
                <G2>
                  <Fld l="Return / Refund Policy"><input value={procForm.returnPolicy||""} onChange={e=>setProcForm(f=>({...f,returnPolicy:e.target.value}))} placeholder="e.g. Returns accepted within 7 days" style={inputStyle}/></Fld>
                  <Fld l="Warranty"><input value={procForm.warranty||""} onChange={e=>setProcForm(f=>({...f,warranty:e.target.value}))} placeholder="e.g. 12-month manufacturer warranty" style={inputStyle}/></Fld>
                  <Fld l="Late Delivery Penalty"><input value={procForm.penalties||""} onChange={e=>setProcForm(f=>({...f,penalties:e.target.value}))} placeholder="e.g. 2% of order value per week" style={inputStyle}/></Fld>
                  <Fld l="Special Instructions"><input value={procForm.specialInstructions||""} onChange={e=>setProcForm(f=>({...f,specialInstructions:e.target.value}))} placeholder="e.g. Cold-chain required for vaccines" style={inputStyle}/></Fld>
                </G2>

                {/* 7. Notes */}
                <SH n="7. Notes" />
                <div style={{marginBottom:20}}>
                  <textarea value={procForm.notes||""} onChange={e=>setProcForm(f=>({...f,notes:e.target.value}))} rows={3} placeholder="Any additional context, purpose, or instructions for this order..." style={{...inputStyle,height:"auto",resize:"vertical",paddingTop:10}}/>
                </div>

                {procErr && <div style={{marginBottom:14,padding:"10px 14px",background:"#fef2f2",borderRadius:8,color:"#dc2626",fontSize:12,fontWeight:600}}>{procErr}</div>}
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={()=>{setProcModal(null);setProcForm({});setProcErr("");}} style={{padding:"10px 22px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,color:"#475569",background:"#fff"}}>Cancel</button>
                  <button onClick={submitPO} style={{padding:"10px 28px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:"#fff",background:"#0b1929"}}>Create Purchase Order</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── NEW SUPPLIER MODAL ───────────────────────────────────────────── */}
        {procModal==="new_supplier" && (
          <div style={{position:"fixed",inset:0,background:"rgba(7,24,40,.55)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:998,overflow:"auto",padding:"24px 16px"}}>
            <div style={{background:"#fff",borderRadius:18,padding:"28px",width:"100%",maxWidth:600,boxShadow:"0 32px 80px rgba(0,0,0,.3)",marginTop:16}}>
              <div style={{fontSize:18,fontWeight:800,color:"#0b1929",marginBottom:20}}>
                {supEditId ? "Edit Supplier" : "Add New Supplier"}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {/* Supplier Name — full width */}
                <div style={{gridColumn:"1/-1"}}>
                  <label style={lblStyle}>Supplier Name *</label>
                  <input value={procForm.name||""} onChange={e=>setProcForm(f=>({...f,name:e.target.value}))} placeholder="e.g. MediSupply Kenya Ltd" style={inputStyle}/>
                </div>
                {/* Contact Person */}
                <div>
                  <label style={lblStyle}>Contact Person</label>
                  <input value={procForm.contact||""} onChange={e=>setProcForm(f=>({...f,contact:e.target.value}))} placeholder="e.g. John Kamau" style={inputStyle}/>
                </div>
                {/* Email */}
                <div>
                  <label style={lblStyle}>Email</label>
                  <input type="email" value={procForm.email||""} onChange={e=>setProcForm(f=>({...f,email:e.target.value}))} placeholder="e.g. john@supplier.co.ke" style={inputStyle}/>
                </div>
                {/* Phone */}
                <div>
                  <label style={lblStyle}>Phone *</label>
                  <input value={procForm.phone||""} onChange={e=>setProcForm(f=>({...f,phone:e.target.value}))} placeholder="e.g. +254722111222" style={inputStyle}/>
                </div>
                {/* Payment Terms */}
                <div>
                  <label style={lblStyle}>Payment Terms</label>
                  <select value={procForm.paymentTerms||"Net 30"} onChange={e=>setProcForm(f=>({...f,paymentTerms:e.target.value}))} style={{...inputStyle,background:"#fff"}}>
                    {PAYMENT_TERMS.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {/* Category */}
                <div>
                  <label style={lblStyle}>Category</label>
                  <select value={procForm.category||""} onChange={e=>setProcForm(f=>({...f,category:e.target.value}))} style={{...inputStyle,background:"#fff"}}>
                    <option value="">— Select —</option>
                    {SUP_CATS.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {/* Address — full width */}
                <div style={{gridColumn:"1/-1"}}>
                  <label style={lblStyle}>Address</label>
                  <input value={procForm.address||""} onChange={e=>setProcForm(f=>({...f,address:e.target.value}))} placeholder="e.g. Industrial Area, Nairobi" style={inputStyle}/>
                </div>
                {/* Rating */}
                <div>
                  <label style={lblStyle}>Rating (0–5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={procForm.rating||""} onChange={e=>setProcForm(f=>({...f,rating:parseFloat(e.target.value)||0}))} placeholder="0" style={inputStyle}/>
                </div>
                {/* Notes — full width */}
                <div style={{gridColumn:"1/-1"}}>
                  <label style={lblStyle}>Notes</label>
                  <textarea value={procForm.notes||""} onChange={e=>setProcForm(f=>({...f,notes:e.target.value}))} rows={3} placeholder="Additional notes about the supplier..." style={{...inputStyle,height:"auto",resize:"vertical",paddingTop:8}}/>
                </div>
              </div>
              {procErr && <div style={{margin:"14px 0 0",padding:"9px 14px",background:"#fef2f2",borderRadius:8,color:"#dc2626",fontSize:12,fontWeight:600}}>{procErr}</div>}
              <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:22}}>
                <button onClick={()=>{setSupEditId(null);setProcModal(null);setProcForm({});setProcErr("");}} style={{padding:"10px 22px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,color:"#475569",background:"#fff"}}>Cancel</button>
                <button onClick={submitSupplier} style={{padding:"10px 24px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:"#fff",background:"#0b1929"}}>
                  {supEditId ? "Update Supplier" : "Add Supplier"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PO DETAIL MODAL ──────────────────────────────────────────────── */}
        {poDetailPO && (
          <div style={{position:"fixed",inset:0,background:"rgba(7,24,40,.6)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:999,overflow:"auto",padding:"24px 16px"}}>
            <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:760,boxShadow:"0 32px 80px rgba(0,0,0,.35)",marginTop:16,overflow:"hidden"}}>
              {/* Header */}
              <div style={{background:"#0b1929",padding:"22px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Purchase Order</div>
                  <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"monospace"}}>{poDetailPO.id}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {(() => {
                    const s = (PO_STATUS[poDetailPO.status]||PO_STATUS.draft);
                    return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,background:"rgba(255,255,255,.12)",color:"#fff",fontSize:12,fontWeight:700}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:s.dot,flexShrink:0}}/>{s.label}
                    </span>;
                  })()}
                  <button onClick={()=>{
                    const w = window.open("","_blank");
                    if (!w) return;
                    w.document.write(buildPODoc(poDetailPO));
                    w.document.close();
                  }} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"rgba(255,255,255,.12)",border:"none",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:700,color:"#fff"}}>
                    🖨 Print
                  </button>
                  <button onClick={()=>setPoDetailPO(null)} style={{width:32,height:32,border:"none",borderRadius:8,cursor:"pointer",background:"rgba(255,255,255,.12)",color:"#fff",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>
              </div>

              <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:18}}>
                {/* Meta info */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                  {[
                    ["Supplier",   poDetailPO.supplierName||"—"],
                    ["Created",    (()=>{const d=poDetailPO.date;return d?new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"})()],
                    ["Expected",   (()=>{const d=poDetailPO.expectedDate;return d?new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"})()],
                    ["Total Value",(()=>"KES "+((poDetailPO.items||[]).reduce((s,it)=>s+(it.qty||0)*(it.unitCost||0),0)).toLocaleString())()],
                  ].map(([label,val])=>(
                    <div key={label} style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:4}}>{label}</div>
                      <div style={{fontSize:14,fontWeight:700,color:"#0b1929"}}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Items table */}
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>Line Items</div>
                  <div style={{borderRadius:10,overflow:"hidden",border:"1.5px solid #e2e8f0"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead>
                        <tr style={{background:"#f8fafc"}}>
                          {["Item","Batch No","Qty Ordered","Unit","Unit Cost","Line Total","Received","Status"].map(h=>(
                            <th key={h} style={{padding:"9px 12px",textAlign:"left",fontWeight:700,fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(poDetailPO.items||[]).length===0 && (
                          <tr><td colSpan={8} style={{padding:"24px",textAlign:"center",color:"#94a3b8"}}>No line items.</td></tr>
                        )}
                        {(poDetailPO.items||[]).map((it,i)=>{
                          const rcvd    = it.received||0;
                          const ordered = it.qty||0;
                          const pct     = ordered>0 ? Math.round(rcvd/ordered*100) : 0;
                          const done    = rcvd>=ordered;
                          return (
                            <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafafa"}}>
                              <td style={{padding:"11px 12px",fontWeight:600,color:"#0b1929"}}>{it.itemName||it.itemId}</td>
                              <td style={{padding:"11px 12px",fontFamily:"monospace",color:"#475569"}}>{it.batchNo||"—"}</td>
                              <td style={{padding:"11px 12px",textAlign:"right",fontWeight:700,color:"#0b1929"}}>{ordered}</td>
                              <td style={{padding:"11px 12px",color:"#64748b"}}>{it.unit||"—"}</td>
                              <td style={{padding:"11px 12px",textAlign:"right",color:"#475569"}}>KES {Number(it.unitCost||0).toFixed(2)}</td>
                              <td style={{padding:"11px 12px",textAlign:"right",fontWeight:700,color:"#0b1929"}}>KES {((ordered)*(it.unitCost||0)).toFixed(2)}</td>
                              <td style={{padding:"11px 12px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <span style={{fontFamily:"monospace",fontWeight:700,color:done?"#15803d":"#d97706"}}>{rcvd}/{ordered}</span>
                                  <div style={{width:50,height:5,borderRadius:3,background:"#f1f5f9",overflow:"hidden"}}>
                                    <div style={{height:"100%",width:pct+"%",borderRadius:3,background:done?"#22c55e":rcvd>0?"#f59e0b":"#e2e8f0"}}/>
                                  </div>
                                </div>
                              </td>
                              <td style={{padding:"11px 12px"}}>
                                {done
                                  ? <span style={{fontSize:10,fontWeight:700,color:"#15803d",background:"#dcfce7",padding:"2px 8px",borderRadius:20}}>✓ Complete</span>
                                  : rcvd>0
                                    ? <span style={{fontSize:10,fontWeight:700,color:"#d97706",background:"#fef3c7",padding:"2px 8px",borderRadius:20}}>Partial</span>
                                    : <span style={{fontSize:10,fontWeight:700,color:"#64748b",background:"#f1f5f9",padding:"2px 8px",borderRadius:20}}>Pending</span>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{background:"#f8fafc",borderTop:"2px solid #e2e8f0"}}>
                          <td colSpan={5} style={{padding:"10px 12px",fontSize:13,fontWeight:700,color:"#475569",textAlign:"right"}}>Order Total:</td>
                          <td colSpan={3} style={{padding:"10px 12px",fontSize:14,fontWeight:800,color:"#0b1929"}}>KES {((poDetailPO.items||[]).reduce((s,it)=>s+(it.qty||0)*(it.unitCost||0),0)).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Notes + Audit Trail */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div style={{background:"#f8fafc",borderRadius:10,padding:"14px 16px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Notes</div>
                    <div style={{fontSize:13,color:poDetailPO.notes?"#0b1929":"#94a3b8"}}>{poDetailPO.notes||"No notes for this order."}</div>
                  </div>
                  <div style={{background:"#f8fafc",borderRadius:10,padding:"14px 16px"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Audit Trail</div>
                    <div style={{display:"flex",flexDirection:"column",gap:7}}>
                      {[["Created by",poDetailPO.createdBy||"—"],["Approved by",poDetailPO.approvedBy||"Pending"]].map(([l,v])=>(
                        <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                          <span style={{color:"#64748b"}}>{l}</span>
                          <span style={{fontWeight:700,color:v==="Pending"||v==="—"?"#94a3b8":"#0b1929"}}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions footer */}
                <div style={{display:"flex",justifyContent:"flex-end",gap:8,paddingTop:4,borderTop:"1px solid #f1f5f9",marginTop:4}}>
                  {poDetailPO.status==="draft" && (
                    <button onClick={()=>{approvePO(poDetailPO.id);setPoDetailPO(prev=>({...prev,status:"approved",approvedBy:"Admin User"}));}}
                      style={{padding:"9px 18px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,background:"#dbeafe",color:"#1d4ed8"}}>✅ Approve PO</button>
                  )}
                  {["draft","approved"].includes(poDetailPO.status) && (
                    <button onClick={()=>{if(window.confirm(`Cancel ${poDetailPO.id}?`)){cancelPO(poDetailPO.id);setPoDetailPO(null);}}}
                      style={{padding:"9px 18px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,background:"#fee2e2",color:"#dc2626"}}>✕ Cancel PO</button>
                  )}
                  <button onClick={()=>setPoDetailPO(null)}
                    style={{padding:"9px 22px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,background:"#fff",color:"#475569"}}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </Layout>
    );


  // ============================================================
  // PATIENT HISTORY PAGE
  // ============================================================

}
