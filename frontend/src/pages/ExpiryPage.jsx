import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function ExpiryPage(props) {
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


    const EXP_TABS = [
      { key:"dashboard", label:"Dashboard",        icon:"📊" },
      { key:"reports",   label:"Expiry Reports",   icon:"📋" },
      { key:"disposal",  label:"Disposal Workflow", icon:"🗑" },
      { key:"financials",label:"Financial Impact",  icon:"💰" },
      { key:"analytics", label:"Analytics",         icon:"📈" },
    ];
    const DISPOSAL_METHODS = ["Incineration","Landfill Disposal","Return to Supplier","Chemical Neutralization","Secure Pharmacy Bin"];
    const PHARMACY_STAFF = [
      { name:"Dr. Amara Osei",  role:"Chief Pharmacist",   email:"a.osei@medicore.ke",    phone:"+254700111001" },
      { name:"Nancy Njeri",     role:"Pharmacy Manager",    email:"n.njeri@medicore.ke",   phone:"+254700111002" },
      { name:"Paul Kamau",      role:"Store Keeper",        email:"p.kamau@medicore.ke",   phone:"+254700111003" },
      { name:"Grace Muthoni",   role:"Pharmacy Technician", email:"g.muthoni@medicore.ke", phone:"+254700111004" },
    ];
    const EXP_CATS = ["All","Drugs","Consumables","Lab Reagents","Equipment"];
    const fmtMoney = (n) => "KES "+Number(n||0).toLocaleString("en-KE",{minimumFractionDigits:2,maximumFractionDigits:2});
    const fmtDate  = (d) => d?new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—";

    // ── Flatten all active batches with expiry data ────────────────
    const expToday = new Date(); expToday.setHours(0,0,0,0);
    const allExpiryBatches = [];
    for (const item of invItems) {
      for (const b of (item.batches||[])) {
        if (b.recalled||!b.expiryDate||b.qty<=0) continue;
        const expDate = new Date(b.expiryDate);
        const daysLeft = Math.ceil((expDate-expToday)/86400000);
        const value = b.qty*(b.unitCost||0);
        const urgency = daysLeft<=0?"expired":daysLeft<=30?"critical":daysLeft<=60?"warning":"caution";
        allExpiryBatches.push({ item, batch:b, daysLeft, value, urgency, expDate });
      }
    }
    // All ≤90 days plus expired
    const trackingBatches = allExpiryBatches.filter(d=>d.daysLeft<=90).sort((a,b)=>a.daysLeft-b.daysLeft);

    const expiredBatches  = trackingBatches.filter(d=>d.urgency==="expired");
    const criticalBatches = trackingBatches.filter(d=>d.urgency==="critical");
    const warningBatches  = trackingBatches.filter(d=>d.urgency==="warning");
    const cautionBatches  = trackingBatches.filter(d=>d.urgency==="caution");
    const totalValueAtRisk = trackingBatches.reduce((s,d)=>s+d.value,0);

    // ── Filter for Reports tab ─────────────────────────────────────
    const filteredExpiry = trackingBatches.filter(d=>{
      const matchCat  = expiryCat==="All"||d.item.category===expiryCat;
      const matchSrch = !expirySearch.trim()||d.item.name.toLowerCase().includes(expirySearch.toLowerCase())||d.batch.batchNo.toLowerCase().includes(expirySearch.toLowerCase());
      return matchCat&&matchSrch;
    });

    // ── Countdown badge renderer ───────────────────────────────────
    const CountdownBadge = ({ daysLeft }) => {
      if (daysLeft<=0) return <span style={{ fontSize:11,fontWeight:800,padding:"3px 9px",borderRadius:20,background:"#7f1d1d",color:"#fca5a5",letterSpacing:.3 }}>EXPIRED</span>;
      const bg  = daysLeft<=30?"#fef2f2":daysLeft<=60?"#fff7ed":"#fefce8";
      const col = daysLeft<=30?"#dc2626":daysLeft<=60?"#c2410c":"#a16207";
      return <span style={{ fontSize:11,fontWeight:800,padding:"3px 9px",borderRadius:20,background:bg,color:col,fontFamily:"monospace" }}>{daysLeft}d</span>;
    };

    // ── Send Alerts ────────────────────────────────────────────────
    const sendAlerts = (threshold) => {
      const items = threshold===0?expiredBatches:threshold===30?criticalBatches:threshold===60?warningBatches:cautionBatches;
      if (!items.length) return;
      const now = new Date().toISOString();
      const newLogs = [];
      for (const staff of PHARMACY_STAFF) {
        newLogs.push({ id:`ALT-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, type:"email", recipient:staff.name, email:staff.email, itemCount:items.length, threshold, sentAt:now });
        newLogs.push({ id:`ALT-${Date.now()}-${Math.random().toString(36).slice(2,6)}x`, type:"sms", recipient:staff.name, phone:staff.phone, itemCount:items.length, threshold, sentAt:now });
      }
      setAlertLog(prev=>[...newLogs,...prev]);
      showToast("Alerts Sent", `Email & SMS alerts dispatched to ${PHARMACY_STAFF.length} pharmacy staff for ${items.length} item(s) with ${threshold<=0?"expired":threshold+"d"} threshold.`, "⏰");
    };

    // ── Disposal actions ──────────────────────────────────────────
    const submitDisposal = () => {
      setDispErr("");
      const { itemId, batchNo, qty, reason, disposalMethod, requestedBy } = dispForm;
      if (!itemId)                              { setDispErr("Select an item."); return; }
      if (!batchNo)                             { setDispErr("Select a batch."); return; }
      if (!qty||isNaN(qty)||Number(qty)<=0)     { setDispErr("Enter a valid quantity."); return; }
      if (!reason?.trim())                      { setDispErr("Reason is required."); return; }
      if (!disposalMethod)                      { setDispErr("Select a disposal method."); return; }
      if (!requestedBy?.trim())                 { setDispErr("Requested by is required."); return; }
      const item = invItems.find(x=>(x.id||x.itemId)===itemId);
      const batch = (item?.batches||[]).find(b=>b.batchNo===batchNo);
      if (!batch)                               { setDispErr("Batch not found."); return; }
      if (Number(qty)>batch.qty)               { setDispErr(`Only ${batch.qty} units available in this batch.`); return; }
      const dispId = "DISP-"+String(disposals.length+1).padStart(4,"0");
      setDisposals(prev=>[...prev,{
        id:dispId, itemId, itemName:item?.name||"Unknown", batchNo, qty:Number(qty), reason, disposalMethod,
        requestedBy, requestedAt:new Date().toISOString(), status:"requested",
        unitCost:batch.unitCost||0, expiryDate:batch.expiryDate||"",
        history:[{ action:"requested", by:requestedBy, at:new Date().toISOString(), note:"Disposal requested" }]
      }]);
      setDispModal(null); setDispForm({}); setDispErr("");
    };
    const approveDisposal = () => {
      if (!dispDetail||!dispForm.approvedBy?.trim()) { setDispErr("Approver name required."); return; }
      setDisposals(prev=>prev.map(d=>d.id!==dispDetail.id?d:{
        ...d, status:"approved", approvedBy:dispForm.approvedBy, approvedAt:new Date().toISOString(),
        approvalNotes:dispForm.approvalNotes||"",
        history:[...d.history,{ action:"approved", by:dispForm.approvedBy, at:new Date().toISOString(), note:`Approved. ${dispForm.approvalNotes||""}` }]
      }));
      setDispModal(null); setDispForm({}); setDispErr(""); setDispDetail(null);
    };
    const completeDisposal = () => {
      if (!dispDetail)              return;
      if (!dispForm.certNo?.trim()) { setDispErr("Certificate number required."); return; }
      if (!dispForm.witnessedBy?.trim()) { setDispErr("Witness name required."); return; }
      const d = dispDetail;
      // Zero out batch in invItems
      setInvItems(prev=>prev.map(it=>{
        if ((it.id||it.itemId)!==d.itemId) return it;
        const newBatches = it.batches.map(b=>{
          if (b.batchNo!==d.batchNo) return b;
          const newQty = Math.max(0, b.qty-d.qty);
          return { ...b, qty:newQty, recalled:newQty===0?true:b.recalled };
        });
        return { ...it, batches:newBatches };
      }));
      // Log write-off transaction
      const woId = "WO-"+d.id;
      setInvTxns(prev=>[...prev,{ id:woId, type:"write-off", itemId:d.itemId, qty:d.qty, batchNo:d.batchNo, date:new Date().toISOString().split("T")[0], reference:dispForm.certNo, department:"Pharmacy", notes:`Disposal: ${d.reason} (${d.disposalMethod})`, performedBy:dispForm.witnessedBy }]);
      setDisposals(prev=>prev.map(x=>x.id!==d.id?x:{
        ...x, status:"completed", certNo:dispForm.certNo, witnessedBy:dispForm.witnessedBy, completedAt:new Date().toISOString(),
        history:[...x.history,{ action:"completed", by:dispForm.witnessedBy, at:new Date().toISOString(), note:`Disposed. Cert: ${dispForm.certNo}` }]
      }));
      setDispModal(null); setDispForm({}); setDispErr(""); setDispDetail(null);
    };

    // ── Analytics helpers ──────────────────────────────────────────
    const getActBatches = (item) => (item.batches||[]).filter(b=>!b.recalled);
    const getStockFn    = (item) => getActBatches(item).reduce((s,b)=>s+b.qty,0);
    const slowMoving = invItems.filter(item=>{
      if (getStockFn(item)<=0) return false;
      const id = item.id||item.itemId;
      const lastOut = [...invTxns].filter(t=>t.itemId===id&&(t.type==="out"||t.type==="write-off")).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
      if (!lastOut) return true;
      return Math.floor((Date.now()-new Date(lastOut.date))/86400000) > 60;
    });

    // Monthly wastage from write-off transactions
    const writeoffs = invTxns.filter(t=>t.type==="write-off");
    const monthlyWastageMap = {};
    for (const tx of writeoffs) {
      const mk = (tx.date||"").slice(0,7);
      if (!mk) continue;
      const it = invItems.find(x=>(x.id||x.itemId)===tx.itemId);
      const cost = it?(it.batches||[]).find(b=>b.batchNo===tx.batchNo)?.unitCost||0:0;
      monthlyWastageMap[mk] = (monthlyWastageMap[mk]||0) + tx.qty*cost;
    }
    const wastageMonths = Object.keys(monthlyWastageMap).sort().slice(-6);
    const maxWastage = Math.max(...Object.values(monthlyWastageMap),1);

    // Category expiry breakdown
    const catBreakdown = EXP_CATS.filter(c=>c!=="All").map(cat=>{
      const batches = trackingBatches.filter(d=>d.item.category===cat);
      return { cat, count:batches.length, value:batches.reduce((s,d)=>s+d.value,0) };
    }).filter(c=>c.count>0).sort((a,b)=>b.value-a.value);

    // ── Print expiry report ────────────────────────────────────────
    const printExpiryReport = () => {
      const rows = filteredExpiry.map(d=>{
        const sc = d.urgency==="expired"?"color:#dc2626":d.urgency==="critical"?"color:#ea580c":d.urgency==="warning"?"color:#d97706":"color:#65a30d";
        return `<tr><td>${d.item.name}</td><td style="font-family:monospace">${d.batch.batchNo}</td><td>${d.item.category}</td><td style="text-align:right">${d.batch.qty} ${d.item.unit}</td><td>${fmtDate(d.batch.expiryDate)}</td><td style="font-weight:700;${sc}">${d.daysLeft<=0?"EXPIRED":d.daysLeft+" days"}</td><td style="text-align:right">KES ${d.value.toLocaleString()}</td><td>${d.item.location||"—"}</td></tr>`;
      }).join("");
      const html = `<!DOCTYPE html><html><head><title>Expiry Report</title><style>body{font-family:Arial,sans-serif;margin:36px;color:#111;}h1{font-size:18px;}table{width:100%;border-collapse:collapse;margin-top:16px;}th{background:#f1f5f9;padding:8px;font-size:11px;text-align:left;border-bottom:2px solid #e2e8f0;}td{padding:7px 8px;font-size:12px;border-bottom:1px solid #f1f5f9;}@media print{button{display:none}}</style></head><body><h1>⏰ MediCore HMS — Expiry Report</h1><p style="font-size:12px;color:#666">Generated: ${new Date().toLocaleString("en-GB")} · Total items: ${filteredExpiry.length} · Total value at risk: KES ${filteredExpiry.reduce((s,d)=>s+d.value,0).toLocaleString()}</p><table><thead><tr><th>Item</th><th>Batch No.</th><th>Category</th><th>Qty</th><th>Expiry Date</th><th>Days Left</th><th>Value at Risk</th><th>Location</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=()=>window.print();</script></body></html>`;
      const w=window.open("","_blank"); w.document.write(html); w.document.close();
    };

    const DISP_SC = { requested:{color:"#92400e",bg:"#fef3c7"}, approved:{color:"#1d4ed8",bg:"#dbeafe"}, completed:{color:"#166534",bg:"#dcfce7"}, rejected:{color:"#991b1b",bg:"#fee2e2"} };

    return (
      <Layout page={page} setPage={p=>{setExpiryTab("dashboard");setPage(p);}} patients={patients} overlay={ToastModal}>
        <TopBar
          title="Medication Expiry Management"
          sub={`${expiredBatches.length} expired · ${criticalBatches.length} critical (≤30d) · ${warningBatches.length} warning (≤60d) · KES ${totalValueAtRisk.toLocaleString()} total at risk`}
          action={
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>sendAlerts(0)} disabled={!expiredBatches.length}
                style={{ padding:"8px 14px",border:"none",borderRadius:8,cursor:expiredBatches.length?"pointer":"not-allowed",fontFamily:"inherit",fontSize:11,fontWeight:700,background:expiredBatches.length?"#7f1d1d":"#f1f5f9",color:expiredBatches.length?"#fca5a5":"#94a3b8",opacity:expiredBatches.length?1:.6 }}>📧 Alert Expired</button>
              <button onClick={()=>sendAlerts(30)} disabled={!criticalBatches.length}
                style={{ padding:"8px 14px",border:"none",borderRadius:8,cursor:criticalBatches.length?"pointer":"not-allowed",fontFamily:"inherit",fontSize:11,fontWeight:700,background:criticalBatches.length?"#fef2f2":"#f1f5f9",color:criticalBatches.length?"#dc2626":"#94a3b8" }}>📧 Alert ≤30d</button>
              <button onClick={()=>sendAlerts(60)} disabled={!warningBatches.length}
                style={{ padding:"8px 14px",border:"none",borderRadius:8,cursor:warningBatches.length?"pointer":"not-allowed",fontFamily:"inherit",fontSize:11,fontWeight:700,background:warningBatches.length?"#fff7ed":"#f1f5f9",color:warningBatches.length?"#c2410c":"#94a3b8" }}>📧 Alert ≤60d</button>
            </div>
          }
        />
        <div style={{ padding:"0 24px 8px" }}>
          <div style={{ display:"flex",gap:6,marginBottom:20,borderBottom:"1px solid #e2e8f0",paddingBottom:0 }}>
            {EXP_TABS.map(t=>(
              <button key={t.key} onClick={()=>setExpiryTab(t.key)}
                style={{ padding:"9px 16px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:expiryTab===t.key?700:500,
                  color:expiryTab===t.key?"#dc2626":"#64748b",background:"transparent",borderBottom:expiryTab===t.key?"2px solid #dc2626":"2px solid transparent",
                  marginBottom:-1,transition:"all .15s" }}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding:"0 24px 32px" }}>

          {/* ── DASHBOARD ───────────────────────────────────────────── */}
          {expiryTab==="dashboard" && (
            <div>
              {/* KPI cards */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20 }}>
                {[
                  { label:"Expired Now",   val:expiredBatches.length,  color:"#dc2626", bg:"#fee2e2", icon:"💀", value:expiredBatches.reduce((s,d)=>s+d.value,0) },
                  { label:"Critical ≤30d", val:criticalBatches.length, color:"#ea580c", bg:"#fff7ed", icon:"🔴", value:criticalBatches.reduce((s,d)=>s+d.value,0) },
                  { label:"Warning ≤60d",  val:warningBatches.length,  color:"#d97706", bg:"#fefce8", icon:"🟡", value:warningBatches.reduce((s,d)=>s+d.value,0) },
                  { label:"Caution ≤90d",  val:cautionBatches.length,  color:"#65a30d", bg:"#f7fee7", icon:"🟢", value:cautionBatches.reduce((s,d)=>s+d.value,0) },
                  { label:"Total at Risk",  val:fmtMoney(totalValueAtRisk), color:"#7c3aed", bg:"#f5f3ff", icon:"💰", value:null },
                ].map((s,i)=>(
                  <div key={i} style={{ background:"#fff",border:`2px solid ${s.bg}`,borderRadius:12,padding:"14px 16px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                      <div style={{ width:36,height:36,borderRadius:9,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize:20,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                        <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{s.label}</div>
                      </div>
                    </div>
                    {s.value!==null && <div style={{ fontSize:10,color:"#64748b" }}>Value: <span style={{ fontWeight:700,color:s.color }}>{fmtMoney(s.value)}</span></div>}
                  </div>
                ))}
              </div>

              {/* Most urgent items */}
              <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:20 }}>
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
                  <div style={{ padding:"13px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <span style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>🚨 Most Urgent — Requiring Immediate Action</span>
                    <span style={{ fontSize:11,color:"#94a3b8" }}>{[...expiredBatches,...criticalBatches].length} items</span>
                  </div>
                  {[...expiredBatches,...criticalBatches].length===0 ? (
                    <div style={{ textAlign:"center",padding:"40px",color:"#94a3b8" }}>
                      <div style={{ fontSize:28,marginBottom:8 }}>✅</div>
                      <div>No items expired or expiring within 30 days</div>
                    </div>
                  ) : (
                    <table style={{ width:"100%",borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ background:"#f8fafc" }}>
                          {["Item","Batch","Qty","Expiry","Countdown","Value","Action"].map(h=>(
                            <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0",textTransform:"uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...expiredBatches,...criticalBatches].slice(0,10).map((d,i)=>(
                          <tr key={i} style={{ borderBottom:"1px solid #f1f5f9",background:d.urgency==="expired"?"#fff7f7":"#fff" }}>
                            <td style={{ padding:"9px 12px" }}>
                              <div style={{ fontSize:12,fontWeight:600,color:"#0b1929" }}>{d.item.name}</div>
                              <div style={{ fontSize:10,color:"#94a3b8" }}>{d.item.category} · {d.item.location||"—"}</div>
                            </td>
                            <td style={{ padding:"9px 12px",fontSize:11,fontFamily:"monospace",color:"#6366f1" }}>{d.batch.batchNo}</td>
                            <td style={{ padding:"9px 12px",fontSize:12,fontWeight:700,color:"#0b1929" }}>{d.batch.qty} {d.item.unit}</td>
                            <td style={{ padding:"9px 12px",fontSize:11,color:"#64748b" }}>{fmtDate(d.batch.expiryDate)}</td>
                            <td style={{ padding:"9px 12px" }}><CountdownBadge daysLeft={d.daysLeft} /></td>
                            <td style={{ padding:"9px 12px",fontSize:12,fontWeight:700,color:"#0b1929" }}>{fmtMoney(d.value)}</td>
                            <td style={{ padding:"9px 12px" }}>
                              <button onClick={()=>{ setDispForm({itemId:d.item.id||d.item.itemId,batchNo:d.batch.batchNo,qty:String(d.batch.qty),reason:"Expired stock"}); setDispErr(""); setDispModal("new"); setExpiryTab("disposal"); }}
                                style={{ padding:"4px 10px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,background:"#fee2e2",color:"#dc2626" }}>Request Disposal</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Alert log */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
                  <div style={{ padding:"13px 18px",borderBottom:"1px solid #f1f5f9" }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>📧 Alert Log</div>
                    <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>Simulated email & SMS dispatch</div>
                  </div>
                  {alertLog.length===0 ? (
                    <div style={{ padding:"32px 18px",textAlign:"center",color:"#94a3b8" }}>
                      <div style={{ fontSize:24,marginBottom:6 }}>📭</div>
                      <div style={{ fontSize:12 }}>No alerts sent yet</div>
                      <div style={{ fontSize:10,marginTop:4 }}>Use the "Alert" buttons above</div>
                    </div>
                  ) : (
                    <div style={{ maxHeight:320,overflowY:"auto" }}>
                      {alertLog.slice(0,20).map((a,i)=>(
                        <div key={i} style={{ padding:"10px 16px",borderBottom:"1px solid #f8fafc",display:"flex",alignItems:"center",gap:10 }}>
                          <span style={{ fontSize:14 }}>{a.type==="email"?"📧":"💬"}</span>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontSize:11,fontWeight:600,color:"#0b1929",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.recipient}</div>
                            <div style={{ fontSize:9,color:"#94a3b8",marginTop:1 }}>{a.type==="email"?a.email:a.phone} · {a.itemCount} items · {a.threshold<=0?"Expired":a.threshold+"d threshold"}</div>
                          </div>
                          <span style={{ fontSize:9,color:"#94a3b8",flexShrink:0 }}>{new Date(a.sentAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Warning + Caution items */}
              {warningBatches.length>0 && (
                <div style={{ background:"#fff",border:"1px solid #fde68a",borderRadius:14,overflow:"hidden" }}>
                  <div style={{ padding:"11px 18px",borderBottom:"1px solid #fde68a",background:"#fffbeb",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontSize:13,fontWeight:700,color:"#92400e" }}>🟡 Warning — Expiring in 31–60 Days ({warningBatches.length} items · {fmtMoney(warningBatches.reduce((s,d)=>s+d.value,0))})</span>
                    <button onClick={()=>sendAlerts(60)} style={{ padding:"5px 12px",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,background:"#d97706",color:"#fff" }}>📧 Send Alerts</button>
                  </div>
                  <div style={{ display:"flex",gap:12,padding:"12px 18px",flexWrap:"wrap" }}>
                    {warningBatches.slice(0,6).map((d,i)=>(
                      <div key={i} style={{ padding:"8px 12px",background:"#fffbeb",borderRadius:9,border:"1px solid #fde68a",minWidth:160 }}>
                        <div style={{ fontSize:11,fontWeight:700,color:"#92400e" }}>{d.item.name}</div>
                        <div style={{ fontSize:10,color:"#b45309",marginTop:2 }}>Batch {d.batch.batchNo} · <b>{d.daysLeft}d</b> remaining</div>
                        <div style={{ fontSize:10,color:"#78350f",marginTop:1 }}>{d.batch.qty} {d.item.unit} · {fmtMoney(d.value)}</div>
                      </div>
                    ))}
                    {warningBatches.length>6 && <div style={{ display:"flex",alignItems:"center",color:"#94a3b8",fontSize:12 }}>+{warningBatches.length-6} more</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS ─────────────────────────────────────────────── */}
          {expiryTab==="reports" && (
            <div>
              <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
                <input value={expirySearch} onChange={e=>setExpirySearch(e.target.value)} placeholder="Search item name or batch no…"
                  style={{ flex:"1 1 200px",padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:12,fontFamily:"inherit",outline:"none",background:"#fff" }} />
                <div style={{ display:"flex",gap:4 }}>
                  {EXP_CATS.map(c=>(
                    <button key={c} onClick={()=>setExpiryCat(c)}
                      style={{ padding:"7px 12px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:expiryCat===c?700:500,background:expiryCat===c?"#7f1d1d":"#f1f5f9",color:expiryCat===c?"#fca5a5":"#64748b" }}>{c}</button>
                  ))}
                </div>
                <button onClick={printExpiryReport} style={{ padding:"8px 16px",border:"none",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:700,background:"#0b1929",color:"#00e5ff" }}>🖨 Print Report</button>
              </div>
              {/* Summary by urgency */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16 }}>
                {[
                  { label:"Expired",   items:filteredExpiry.filter(d=>d.urgency==="expired"),  color:"#dc2626", bg:"#fee2e2" },
                  { label:"Critical",  items:filteredExpiry.filter(d=>d.urgency==="critical"), color:"#ea580c", bg:"#fff7ed" },
                  { label:"Warning",   items:filteredExpiry.filter(d=>d.urgency==="warning"),  color:"#d97706", bg:"#fefce8" },
                  { label:"Caution",   items:filteredExpiry.filter(d=>d.urgency==="caution"),  color:"#65a30d", bg:"#f7fee7" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:s.bg,borderRadius:10,padding:"10px 14px" }}>
                    <div style={{ fontSize:11,fontWeight:700,color:s.color }}>{s.label}</div>
                    <div style={{ fontSize:16,fontWeight:800,color:s.color }}>{s.items.length} batches</div>
                    <div style={{ fontSize:10,color:s.color,opacity:.8 }}>{fmtMoney(s.items.reduce((x,d)=>x+d.value,0))}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
                <div style={{ padding:"12px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",gap:8,alignItems:"center" }}>
                  <span style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>Full Expiry Report</span>
                  <span style={{ fontSize:11,color:"#94a3b8",background:"#f1f5f9",padding:"2px 8px",borderRadius:20 }}>{filteredExpiry.length} batches</span>
                  <span style={{ marginLeft:"auto",fontSize:12,fontWeight:700,color:"#7c3aed" }}>Total: {fmtMoney(filteredExpiry.reduce((s,d)=>s+d.value,0))}</span>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",minWidth:860 }}>
                    <thead>
                      <tr style={{ background:"#f8fafc" }}>
                        {["Item","Category","Batch No.","Location","Qty","Expiry Date","Countdown","Unit Cost","Value at Risk",""].map(h=>(
                          <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpiry.length===0 ? (
                        <tr><td colSpan={10} style={{ textAlign:"center",padding:"40px",color:"#94a3b8" }}>No expiring items match filter</td></tr>
                      ) : filteredExpiry.map((d,i)=>(
                        <tr key={i} style={{ borderBottom:"1px solid #f1f5f9",background:d.urgency==="expired"?"#fff7f7":"#fff" }}
                          onMouseEnter={e=>e.currentTarget.style.background=d.urgency==="expired"?"#fef2f2":"#f8fafc"}
                          onMouseLeave={e=>e.currentTarget.style.background=d.urgency==="expired"?"#fff7f7":"#fff"}>
                          <td style={{ padding:"9px 12px" }}>
                            <div style={{ fontSize:12,fontWeight:600,color:"#0b1929" }}>{d.item.name}</div>
                            <div style={{ fontSize:9,color:"#94a3b8",fontFamily:"monospace" }}>{d.item.id||d.item.itemId}</div>
                          </td>
                          <td style={{ padding:"9px 12px",fontSize:11,color:"#475569" }}>{d.item.category}</td>
                          <td style={{ padding:"9px 12px",fontSize:11,fontFamily:"monospace",color:"#6366f1" }}>{d.batch.batchNo}</td>
                          <td style={{ padding:"9px 12px",fontSize:11,color:"#64748b" }}>{d.item.location||"—"}</td>
                          <td style={{ padding:"9px 12px",fontSize:12,fontWeight:700,color:"#0b1929" }}>{d.batch.qty} <span style={{ fontSize:10,fontWeight:400,color:"#94a3b8" }}>{d.item.unit}</span></td>
                          <td style={{ padding:"9px 12px",fontSize:11,color:"#64748b" }}>{fmtDate(d.batch.expiryDate)}</td>
                          <td style={{ padding:"9px 12px" }}><CountdownBadge daysLeft={d.daysLeft} /></td>
                          <td style={{ padding:"9px 12px",fontSize:11,color:"#475569" }}>{fmtMoney(d.batch.unitCost||0)}</td>
                          <td style={{ padding:"9px 12px",fontSize:12,fontWeight:700,color:"#dc2626" }}>{fmtMoney(d.value)}</td>
                          <td style={{ padding:"9px 12px" }}>
                            <button onClick={()=>{ setDispForm({itemId:d.item.id||d.item.itemId,batchNo:d.batch.batchNo,qty:String(d.batch.qty),reason:d.urgency==="expired"?"Expired stock":"Expiring soon"}); setDispErr(""); setDispModal("new"); setExpiryTab("disposal"); }}
                              style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,background:"#fee2e2",color:"#dc2626" }}>Dispose</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── DISPOSAL WORKFLOW ────────────────────────────────────── */}
          {expiryTab==="disposal" && (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:"#0b1929" }}>Disposal Workflow</div>
                  <div style={{ fontSize:12,color:"#64748b",marginTop:2 }}>Request → Approve → Complete with full documentation</div>
                </div>
                <button onClick={()=>{ setDispForm({}); setDispErr(""); setDispModal("new"); }}
                  style={{ padding:"9px 18px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,background:"#7f1d1d",color:"#fff" }}>+ New Disposal Request</button>
              </div>
              {/* Approval chain status */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16 }}>
                {[
                  { label:"Requested",  val:disposals.filter(d=>d.status==="requested").length,  color:"#92400e", bg:"#fef3c7", icon:"📝" },
                  { label:"Approved",   val:disposals.filter(d=>d.status==="approved").length,   color:"#1d4ed8", bg:"#dbeafe", icon:"✅" },
                  { label:"Completed",  val:disposals.filter(d=>d.status==="completed").length,  color:"#166534", bg:"#dcfce7", icon:"🗑" },
                  { label:"Total Disposals", val:disposals.length, color:"#475569", bg:"#f1f5f9", icon:"📋" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:36,height:36,borderRadius:9,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:20,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
                <div style={{ padding:"12px 18px",borderBottom:"1px solid #f1f5f9",fontSize:13,fontWeight:700,color:"#0b1929" }}>Disposal Register</div>
                {disposals.length===0 ? (
                  <div style={{ textAlign:"center",padding:"60px",color:"#94a3b8" }}>
                    <div style={{ fontSize:36,marginBottom:10 }}>🗑</div>
                    <div style={{ fontSize:13,fontWeight:600,color:"#64748b",marginBottom:4 }}>No disposal requests yet</div>
                    <div style={{ fontSize:12 }}>Click "+ New Disposal Request" to document expired or expiring stock disposal</div>
                  </div>
                ) : (
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"#f8fafc" }}>
                        {["Disposal ID","Item","Batch","Qty","Method","Expiry","Status","Requested By","Actions"].map(h=>(
                          <th key={h} style={{ padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {disposals.map((d,i)=>{
                        const sc = DISP_SC[d.status]||{color:"#475569",bg:"#f1f5f9"};
                        return (
                          <tr key={d.id} style={{ borderBottom:"1px solid #f1f5f9" }}
                            onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <td style={{ padding:"9px 12px",fontSize:11,fontFamily:"monospace",fontWeight:700,color:"#6366f1" }}>{d.id}</td>
                            <td style={{ padding:"9px 12px",fontSize:12,fontWeight:600,color:"#0b1929" }}>{d.itemName}</td>
                            <td style={{ padding:"9px 12px",fontSize:11,fontFamily:"monospace",color:"#64748b" }}>{d.batchNo}</td>
                            <td style={{ padding:"9px 12px",fontSize:12,fontWeight:700,color:"#0b1929" }}>{d.qty}</td>
                            <td style={{ padding:"9px 12px",fontSize:11,color:"#475569" }}>{d.disposalMethod}</td>
                            <td style={{ padding:"9px 12px",fontSize:11,color:"#64748b" }}>{fmtDate(d.expiryDate)}</td>
                            <td style={{ padding:"9px 12px" }}>
                              <span style={{ fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:sc.bg,color:sc.color,textTransform:"capitalize" }}>{d.status}</span>
                            </td>
                            <td style={{ padding:"9px 12px",fontSize:11,color:"#475569" }}>{d.requestedBy}</td>
                            <td style={{ padding:"9px 12px" }}>
                              <div style={{ display:"flex",gap:4 }}>
                                {d.status==="requested" && (
                                  <button onClick={()=>{ setDispDetail(d); setDispForm({}); setDispErr(""); setDispModal("approve"); }}
                                    style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,background:"#dbeafe",color:"#1d4ed8" }}>Approve</button>
                                )}
                                {d.status==="approved" && (
                                  <button onClick={()=>{ setDispDetail(d); setDispForm({}); setDispErr(""); setDispModal("complete"); }}
                                    style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,background:"#dcfce7",color:"#166534" }}>Complete</button>
                                )}
                                <button onClick={()=>{ setDispDetail(d); setDispModal("view"); }}
                                  style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:600,background:"#f1f5f9",color:"#475569" }}>View</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── FINANCIAL IMPACT ─────────────────────────────────────── */}
          {expiryTab==="financials" && (
            <div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
                {[
                  { label:"Total Value at Risk",     val:fmtMoney(totalValueAtRisk), color:"#7c3aed", bg:"#f5f3ff", icon:"⚠️" },
                  { label:"Expired Stock Value",      val:fmtMoney(expiredBatches.reduce((s,d)=>s+d.value,0)), color:"#dc2626", bg:"#fee2e2", icon:"💀" },
                  { label:"Total Write-offs (All)",   val:fmtMoney(writeoffs.reduce((s,t)=>{const it=invItems.find(x=>(x.id||x.itemId)===t.itemId);const c=(it?.batches||[]).find(b=>b.batchNo===t.batchNo)?.unitCost||0;return s+t.qty*c;},0)), color:"#991b1b", bg:"#fee2e2", icon:"📉" },
                  { label:"Disposal Requests Value",  val:fmtMoney(disposals.reduce((s,d)=>s+d.qty*(d.unitCost||0),0)), color:"#0369a1", bg:"#dbeafe", icon:"🗑" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:"#fff",border:`2px solid ${s.bg}`,borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}>
                    <div style={{ width:42,height:42,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:16,fontWeight:800,color:s.color,lineHeight:1.2 }}>{s.val}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                {/* Monthly wastage chart */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:16 }}>📉 Monthly Wastage Trend (Write-offs)</div>
                  {wastageMonths.length===0 ? (
                    <div style={{ textAlign:"center",padding:"40px 0",color:"#94a3b8" }}>
                      <div style={{ fontSize:28,marginBottom:8 }}>📊</div>
                      <div style={{ fontSize:12 }}>No write-off transactions recorded yet</div>
                      <div style={{ fontSize:11,marginTop:4,color:"#cbd5e1" }}>Wastage data appears here when disposals are completed</div>
                    </div>
                  ) : (
                    <div style={{ display:"flex",alignItems:"flex-end",gap:8,height:160 }}>
                      {wastageMonths.map(mk=>{
                        const val = monthlyWastageMap[mk]||0;
                        const pct = maxWastage>0?Math.max(4,(val/maxWastage)*140):4;
                        const [yr,mo] = mk.split("-");
                        const label = new Date(Number(yr),Number(mo)-1).toLocaleDateString("en-GB",{month:"short",year:"2-digit"});
                        return (
                          <div key={mk} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                            <div style={{ fontSize:9,fontWeight:700,color:"#dc2626" }}>{fmtMoney(val).replace("KES ","")}</div>
                            <div style={{ width:"100%",height:pct,background:"linear-gradient(180deg,#dc2626,#991b1b)",borderRadius:"4px 4px 0 0",minHeight:4 }} />
                            <div style={{ fontSize:9,color:"#94a3b8",textAlign:"center" }}>{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Category breakdown */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:16 }}>🗂 Value at Risk by Category</div>
                  {catBreakdown.length===0 ? (
                    <div style={{ textAlign:"center",padding:"40px 0",color:"#94a3b8" }}>
                      <div>No expiring items in the tracked window</div>
                    </div>
                  ) : catBreakdown.map((c,i)=>{
                    const pct = totalValueAtRisk>0?Math.round(c.value/totalValueAtRisk*100):0;
                    return (
                      <div key={c.cat} style={{ marginBottom:14 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                          <span style={{ fontSize:12,fontWeight:600,color:"#0b1929" }}>{c.cat} <span style={{ fontSize:10,color:"#94a3b8",fontWeight:400 }}>({c.count} batches)</span></span>
                          <span style={{ fontSize:11,fontWeight:700,color:"#dc2626" }}>{fmtMoney(c.value)} <span style={{ color:"#94a3b8",fontWeight:400 }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
                          <div style={{ height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#dc2626,#ea580c)",borderRadius:4 }} />
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop:16,paddingTop:12,borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between" }}>
                    <span style={{ fontSize:12,fontWeight:700,color:"#0b1929" }}>Total at Risk</span>
                    <span style={{ fontSize:13,fontWeight:800,color:"#dc2626" }}>{fmtMoney(totalValueAtRisk)}</span>
                  </div>
                </div>
                {/* Completed disposals log */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px",gridColumn:"1 / -1" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:14 }}>🗑 Disposal Financial Summary</div>
                  {disposals.length===0 ? (
                    <div style={{ textAlign:"center",padding:"20px",color:"#94a3b8",fontSize:12 }}>No disposals recorded</div>
                  ) : (
                    <table style={{ width:"100%",borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ background:"#f8fafc" }}>
                          {["Disposal ID","Item","Batch","Qty","Unit Cost","Write-off Value","Disposal Method","Status","Date"].map(h=>(
                            <th key={h} style={{ padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {disposals.map((d,i)=>{
                          const sc=DISP_SC[d.status]||{color:"#475569",bg:"#f1f5f9"};
                          return (
                            <tr key={d.id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                              <td style={{ padding:"8px 12px",fontSize:11,fontFamily:"monospace",color:"#6366f1",fontWeight:700 }}>{d.id}</td>
                              <td style={{ padding:"8px 12px",fontSize:12,fontWeight:600,color:"#0b1929" }}>{d.itemName}</td>
                              <td style={{ padding:"8px 12px",fontSize:11,fontFamily:"monospace",color:"#64748b" }}>{d.batchNo}</td>
                              <td style={{ padding:"8px 12px",fontSize:12,fontWeight:700 }}>{d.qty}</td>
                              <td style={{ padding:"8px 12px",fontSize:11,color:"#475569" }}>{fmtMoney(d.unitCost||0)}</td>
                              <td style={{ padding:"8px 12px",fontSize:12,fontWeight:700,color:"#dc2626" }}>{fmtMoney(d.qty*(d.unitCost||0))}</td>
                              <td style={{ padding:"8px 12px",fontSize:11,color:"#475569" }}>{d.disposalMethod}</td>
                              <td style={{ padding:"8px 12px" }}><span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:sc.bg,color:sc.color,textTransform:"capitalize" }}>{d.status}</span></td>
                              <td style={{ padding:"8px 12px",fontSize:11,color:"#94a3b8" }}>{fmtDate(d.requestedAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ background:"#f8fafc" }}>
                          <td colSpan={5} style={{ padding:"10px 12px",fontSize:12,fontWeight:700,color:"#0b1929" }}>Total Write-off Value</td>
                          <td style={{ padding:"10px 12px",fontSize:13,fontWeight:800,color:"#dc2626" }}>{fmtMoney(disposals.reduce((s,d)=>s+d.qty*(d.unitCost||0),0))}</td>
                          <td colSpan={3} />
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ───────────────────────────────────────────── */}
          {expiryTab==="analytics" && (
            <div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20 }}>
                {[
                  { label:"Slow-Moving Items",   val:slowMoving.length, sub:"No stock-out in 60+ days", color:"#d97706", bg:"#fefce8", icon:"🐌" },
                  { label:"Expiry Rate",          val:`${invItems.length>0?Math.round(trackingBatches.length/invItems.length*100):0}%`, sub:"of SKUs expiring ≤90d", color:"#dc2626", bg:"#fee2e2", icon:"📉" },
                  { label:"Forecasting Adjusted", val:trackingBatches.filter(d=>d.daysLeft>0&&d.daysLeft<=60).length, sub:"items flagged for reduced reorder", color:"#0369a1", bg:"#dbeafe", icon:"📊" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:"#fff",border:`2px solid ${s.bg}`,borderRadius:12,padding:"16px 20px",display:"flex",alignItems:"center",gap:16 }}>
                    <div style={{ width:46,height:46,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:24,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                      <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{s.label}</div>
                      <div style={{ fontSize:10,color:"#cbd5e1",marginTop:1 }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Slow-moving items */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
                  <div style={{ padding:"13px 18px",borderBottom:"1px solid #f1f5f9" }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>🐌 Slow-Moving Items</div>
                    <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>In-stock items with no outgoing transactions in 60+ days — high expiry risk</div>
                  </div>
                  {slowMoving.length===0 ? (
                    <div style={{ textAlign:"center",padding:"36px",color:"#94a3b8" }}>
                      <div style={{ fontSize:28,marginBottom:8 }}>✅</div>
                      <div>No slow-moving items detected</div>
                    </div>
                  ) : (
                    <table style={{ width:"100%",borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ background:"#f8fafc" }}>
                          {["Item","Category","Stock","Nearest Expiry","Recommendation"].map(h=>(
                            <th key={h} style={{ padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {slowMoving.slice(0,12).map((it,i)=>{
                          const stock = getStockFn(it);
                          const activeBs = getActBatches(it).filter(b=>b.expiryDate&&b.qty>0);
                          const nearest = activeBs.sort((a,b)=>a.expiryDate>b.expiryDate?1:-1)[0];
                          const daysToExp = nearest ? Math.ceil((new Date(nearest.expiryDate)-expToday)/86400000) : null;
                          return (
                            <tr key={it.id||it.itemId||i} style={{ borderBottom:"1px solid #f1f5f9" }}>
                              <td style={{ padding:"8px 12px" }}>
                                <div style={{ fontSize:12,fontWeight:600,color:"#0b1929" }}>{it.name}</div>
                                <div style={{ fontSize:9,fontFamily:"monospace",color:"#94a3b8" }}>{it.id||it.itemId}</div>
                              </td>
                              <td style={{ padding:"8px 12px",fontSize:11,color:"#475569" }}>{it.category}</td>
                              <td style={{ padding:"8px 12px",fontSize:12,fontWeight:700,color:"#d97706" }}>{stock} {it.unit}</td>
                              <td style={{ padding:"8px 12px" }}>
                                {nearest ? <CountdownBadge daysLeft={daysToExp} /> : <span style={{ color:"#94a3b8",fontSize:11 }}>—</span>}
                              </td>
                              <td style={{ padding:"8px 12px",fontSize:10,color:"#475569" }}>
                                {daysToExp!==null&&daysToExp<=60 ? <span style={{ color:"#dc2626",fontWeight:700 }}>🚨 Promote / Transfer</span> : <span style={{ color:"#d97706" }}>Reduce reorder qty</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
                {/* Forecasting integration */}
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:4 }}>📊 Forecasting Integration</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginBottom:16 }}>Recommended reorder adjustments based on expiry trends</div>
                  {trackingBatches.filter(d=>d.daysLeft>0&&d.daysLeft<=60).length===0 ? (
                    <div style={{ textAlign:"center",padding:"36px 0",color:"#94a3b8" }}>
                      <div style={{ fontSize:28,marginBottom:8 }}>✅</div>
                      <div>No reorder adjustments needed</div>
                    </div>
                  ) : (
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {[...new Map(trackingBatches.filter(d=>d.daysLeft>0&&d.daysLeft<=60).map(d=>[d.item.id||d.item.itemId,d])).values()].slice(0,8).map((d,i)=>{
                        const currentStock = getStockFn(d.item);
                        const pctExpiring = d.batch.qty / Math.max(currentStock,1) * 100;
                        return (
                          <div key={i} style={{ padding:"10px 12px",background:pctExpiring>50?"#fff7f7":"#fffbeb",borderRadius:9,borderLeft:`3px solid ${pctExpiring>50?"#dc2626":"#d97706"}` }}>
                            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                              <span style={{ fontSize:12,fontWeight:700,color:"#0b1929" }}>{d.item.name}</span>
                              <CountdownBadge daysLeft={d.daysLeft} />
                            </div>
                            <div style={{ fontSize:10,color:"#64748b",marginBottom:4 }}>Expiring: {d.batch.qty} of {currentStock} total units ({Math.round(pctExpiring)}%)</div>
                            <div style={{ fontSize:11,fontWeight:600,color:pctExpiring>50?"#dc2626":"#d97706" }}>
                              Recommendation: {pctExpiring>50 ? "⬇ Reduce next order by 50%" : "⬇ Reduce next order by 25%"}
                            </div>
                            <div style={{ marginTop:6,height:5,background:"#f1f5f9",borderRadius:3,overflow:"hidden" }}>
                              <div style={{ height:"100%",width:`${Math.min(pctExpiring,100)}%`,background:pctExpiring>50?"#dc2626":"#d97706",borderRadius:3 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ marginTop:16,padding:"12px",background:"#f0fdf4",borderRadius:9,border:"1px solid #bbf7d0" }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"#166534",marginBottom:4 }}>💡 Ordering Tip</div>
                    <div style={{ fontSize:10,color:"#15803d" }}>Items with ≥50% stock expiring within 60 days should have next order quantity reduced by 50%. Use the Forecasting page to update reorder levels accordingly.</div>
                    <button onClick={()=>setPage("forecast")} style={{ marginTop:8,padding:"5px 12px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,background:"#166534",color:"#fff" }}>→ Open Forecasting</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── NEW DISPOSAL MODAL ─────────────────────────────────────── */}
        {dispModal==="new" && (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999 }}>
            <div style={{ background:"#fff",borderRadius:18,width:"100%",maxWidth:520,boxShadow:"0 24px 80px rgba(0,0,0,.28)",overflow:"hidden" }}>
              <div style={{ background:"linear-gradient(135deg,#7f1d1d,#991b1b)",padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:15,fontWeight:800,color:"#fff" }}>🗑 New Disposal Request</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.6)",marginTop:2 }}>Document expired or expiring stock for disposal</div>
                </div>
                <button onClick={()=>{ setDispModal(null); setDispErr(""); }} style={{ background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:22 }}>×</button>
              </div>
              <div style={{ padding:"22px 24px" }}>
                {dispErr && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"9px 14px",borderRadius:8,fontSize:12,marginBottom:14,fontWeight:600 }}>{dispErr}</div>}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                  <div style={{ gridColumn:"1 / -1" }}>
                    <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Item *</label>
                    <select value={dispForm.itemId||""} onChange={e=>setDispForm(p=>({...p,itemId:e.target.value,batchNo:""}))}
                      style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",background:"#fff" }}>
                      <option value="">Select item…</option>
                      {invItems.map(it=><option key={it.id||it.itemId} value={it.id||it.itemId}>{it.name}</option>)}
                    </select>
                  </div>
                  {dispForm.itemId && (() => {
                    const it = invItems.find(x=>(x.id||x.itemId)===dispForm.itemId);
                    const bs = (it?.batches||[]).filter(b=>!b.recalled&&b.qty>0);
                    return (
                      <div>
                        <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Batch *</label>
                        <select value={dispForm.batchNo||""} onChange={e=>setDispForm(p=>({...p,batchNo:e.target.value}))}
                          style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",background:"#fff" }}>
                          <option value="">Select batch…</option>
                          {bs.map(b=><option key={b.batchNo} value={b.batchNo}>{b.batchNo} · {b.qty} units{b.expiryDate?` · Exp: ${b.expiryDate}`:""}</option>)}
                        </select>
                      </div>
                    );
                  })()}
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Quantity *</label>
                    <input type="number" min="1" value={dispForm.qty||""} onChange={e=>setDispForm(p=>({...p,qty:e.target.value}))}
                      style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Disposal Method *</label>
                    <select value={dispForm.disposalMethod||""} onChange={e=>setDispForm(p=>({...p,disposalMethod:e.target.value}))}
                      style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",background:"#fff" }}>
                      <option value="">Select method…</option>
                      {DISPOSAL_METHODS.map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Reason for Disposal *</label>
                  <textarea value={dispForm.reason||""} onChange={e=>setDispForm(p=>({...p,reason:e.target.value}))} rows={2}
                    placeholder="e.g. Expired, contaminated, damaged packaging…"
                    style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box" }} />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Requested By *</label>
                  <input value={dispForm.requestedBy||""} onChange={e=>setDispForm(p=>({...p,requestedBy:e.target.value}))} placeholder="Staff name"
                    style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={submitDisposal} style={{ flex:1,padding:"11px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,background:"#7f1d1d",color:"#fff" }}>Submit Request</button>
                  <button onClick={()=>{ setDispModal(null); setDispErr(""); }} style={{ padding:"11px 20px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,background:"#fff",color:"#475569" }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── APPROVE MODAL ─────────────────────────────────────────── */}
        {dispModal==="approve" && dispDetail && (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999 }}>
            <div style={{ background:"#fff",borderRadius:16,padding:"28px 30px",width:420,boxShadow:"0 24px 80px rgba(0,0,0,.28)" }}>
              <div style={{ fontSize:15,fontWeight:800,color:"#0b1929",marginBottom:4 }}>✅ Approve Disposal</div>
              <div style={{ fontSize:12,color:"#64748b",marginBottom:20 }}>{dispDetail.itemName} · Batch {dispDetail.batchNo} · {dispDetail.qty} units</div>
              {dispErr && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"9px 14px",borderRadius:8,fontSize:12,marginBottom:14 }}>{dispErr}</div>}
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Approved By *</label>
                <input value={dispForm.approvedBy||""} onChange={e=>setDispForm(p=>({...p,approvedBy:e.target.value}))} placeholder="Authorising officer name" autoFocus
                  style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Approval Notes</label>
                <textarea value={dispForm.approvalNotes||""} onChange={e=>setDispForm(p=>({...p,approvalNotes:e.target.value}))} rows={2} placeholder="Optional notes…"
                  style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box" }} />
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <button onClick={approveDisposal} style={{ flex:1,padding:"10px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,background:"#1d4ed8",color:"#fff" }}>Approve Disposal</button>
                <button onClick={()=>{ setDispModal(null); setDispErr(""); setDispDetail(null); }} style={{ padding:"10px 18px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,background:"#fff",color:"#475569" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPLETE MODAL ────────────────────────────────────────── */}
        {dispModal==="complete" && dispDetail && (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999 }}>
            <div style={{ background:"#fff",borderRadius:16,padding:"28px 30px",width:420,boxShadow:"0 24px 80px rgba(0,0,0,.28)" }}>
              <div style={{ fontSize:15,fontWeight:800,color:"#0b1929",marginBottom:4 }}>🗑 Complete Disposal</div>
              <div style={{ fontSize:12,color:"#64748b",marginBottom:20 }}>{dispDetail.itemName} · Batch {dispDetail.batchNo} · {dispDetail.qty} units · {dispDetail.disposalMethod}</div>
              {dispErr && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"9px 14px",borderRadius:8,fontSize:12,marginBottom:14 }}>{dispErr}</div>}
              <div style={{ background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:9,padding:"10px 14px",marginBottom:16,fontSize:11,color:"#92400e" }}>
                ⚠️ Completing this disposal will permanently deduct <b>{dispDetail.qty} units</b> of batch <b>{dispDetail.batchNo}</b> from inventory and log a write-off transaction.
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Disposal Certificate No. *</label>
                <input value={dispForm.certNo||""} onChange={e=>setDispForm(p=>({...p,certNo:e.target.value}))} placeholder="e.g. CERT-2026-001" autoFocus
                  style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Witnessed By *</label>
                <input value={dispForm.witnessedBy||""} onChange={e=>setDispForm(p=>({...p,witnessedBy:e.target.value}))} placeholder="Witness name"
                  style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <button onClick={completeDisposal} style={{ flex:1,padding:"10px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,background:"#166534",color:"#fff" }}>Confirm Disposal</button>
                <button onClick={()=>{ setDispModal(null); setDispErr(""); setDispDetail(null); }} style={{ padding:"10px 18px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,background:"#fff",color:"#475569" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW MODAL ────────────────────────────────────────────── */}
        {dispModal==="view" && dispDetail && (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999 }}>
            <div style={{ background:"#fff",borderRadius:18,width:"100%",maxWidth:480,boxShadow:"0 24px 80px rgba(0,0,0,.28)",overflow:"hidden",maxHeight:"88vh",display:"flex",flexDirection:"column" }}>
              <div style={{ background:"linear-gradient(135deg,#7f1d1d,#991b1b)",padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:800,color:"#fff" }}>Disposal {dispDetail.id}</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.6)",marginTop:2 }}>{dispDetail.itemName}</div>
                </div>
                <button onClick={()=>{ setDispModal(null); setDispDetail(null); }} style={{ background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:22 }}>×</button>
              </div>
              <div style={{ overflowY:"auto",padding:"20px 22px" }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16 }}>
                  {[
                    { label:"Item",           val:dispDetail.itemName },
                    { label:"Batch No.",      val:dispDetail.batchNo },
                    { label:"Quantity",       val:dispDetail.qty },
                    { label:"Disposal Method",val:dispDetail.disposalMethod },
                    { label:"Reason",         val:dispDetail.reason },
                    { label:"Requested By",   val:dispDetail.requestedBy },
                    { label:"Expiry Date",    val:fmtDate(dispDetail.expiryDate) },
                    { label:"Write-off Value",val:fmtMoney(dispDetail.qty*(dispDetail.unitCost||0)) },
                    { label:"Certificate No.",val:dispDetail.certNo||"—" },
                    { label:"Witnessed By",   val:dispDetail.witnessedBy||"—" },
                  ].map((f,i)=>(
                    <div key={i} style={{ padding:"9px 11px",background:"#f8fafc",borderRadius:8 }}>
                      <div style={{ fontSize:9,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.8,marginBottom:2 }}>{f.label}</div>
                      <div style={{ fontSize:12,fontWeight:600,color:"#0b1929" }}>{f.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:12,fontWeight:700,color:"#0b1929",marginBottom:8 }}>Approval Chain</div>
                <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:16 }}>
                  {(dispDetail.history||[]).map((h,i)=>(
                    <div key={i} style={{ padding:"9px 12px",background:i===dispDetail.history.length-1?"#f0fdf4":"#f8fafc",borderRadius:9,borderLeft:`3px solid ${i===dispDetail.history.length-1?"#22c55e":"#cbd5e1"}` }}>
                      <div style={{ fontSize:11,fontWeight:700,color:"#0b1929",textTransform:"capitalize" }}>{h.action} <span style={{ fontSize:10,fontWeight:400,color:"#64748b" }}>by {h.by}</span></div>
                      <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{h.note} · {new Date(h.at).toLocaleString("en-GB")}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{ setDispModal(null); setDispDetail(null); }} style={{ width:"100%",padding:"10px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,color:"#475569",background:"#fff" }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    );


  // ============================================================
  // PATIENT ANALYTICS PAGE
  // ============================================================

}
