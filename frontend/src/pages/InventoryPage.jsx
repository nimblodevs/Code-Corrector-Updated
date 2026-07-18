import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function InventoryPage(props) {
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


    const today = new Date();
    const in90  = new Date(today); in90.setDate(in90.getDate()+90);
    const INV_CATS  = ["All","Drugs","Consumables","Lab Reagents","Equipment","Office Supplies"];
    const DEPARTMENTS = ["Pharmacy","OPD","Ward A","Ward B","Ward C","Lab","Theatre","Emergency","Admin"];

    // ── Batch & stock helpers ───────────────────────────────────────────────
    const activeBatches = (item) => (item.batches||[]).filter(b=>!b.recalled);
    const getStock      = (item) => activeBatches(item).reduce((s,b)=>s+b.qty,0);
    const getUnitCost   = (item) => { const bs=activeBatches(item); return bs.length?bs[bs.length-1].unitCost:0; };

    // Sort batches per issuing strategy
    const sortedBatches = (item, mode) => {
      const bs = activeBatches(item).filter(b=>b.qty>0);
      if (mode==="FEFO") return [...bs].sort((a,b)=>(a.expiryDate||"9999")>(b.expiryDate||"9999")?1:-1);
      return [...bs].sort((a,b)=>(a.receivedAt||"")>(b.receivedAt||"")?1:-1); // FIFO
    };

    // Calculate which batches will be consumed for a given qty
    const getAllocation = (item, qty, mode) => {
      const ordered = sortedBatches(item, mode);
      const alloc = []; let rem = qty;
      for (const b of ordered) {
        if (rem<=0) break;
        const take = Math.min(b.qty, rem);
        alloc.push({...b, take});
        rem -= take;
      }
      return alloc;
    };

    const stockStatus = (item) => {
      const s = getStock(item);
      if (s===0) return { label:"Out of Stock", color:"#991b1b", bg:"#fee2e2", dot:"#dc2626" };
      if (s<item.reorderLevel) return { label:"Low Stock", color:"#92400e", bg:"#fef3c7", dot:"#d97706" };
      return { label:"In Stock", color:"#166534", bg:"#dcfce7", dot:"#22c55e" };
    };
    const expiryStatus = (item) => {
      const batches = activeBatches(item).filter(b=>b.expiryDate&&b.qty>0);
      if (!batches.length) return null;
      const nearest = batches.reduce((m,b)=>b.expiryDate<m.expiryDate?b:m, batches[0]);
      const exp = new Date(nearest.expiryDate);
      if (exp < today) return { label:"Expired", color:"#991b1b", bg:"#fee2e2", batch:nearest.batchNo };
      if (exp <= in90) return { label:"Expiring Soon", color:"#92400e", bg:"#fef3c7", batch:nearest.batchNo };
      return null;
    };
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";

    const totalValue     = invItems.reduce((s,it)=>s+getStock(it)*getUnitCost(it),0);
    const lowStockItems  = invItems.filter(it=>{ const s=getStock(it); return s>0&&s<it.reorderLevel; });
    const outOfStockItems= invItems.filter(it=>getStock(it)===0);
    const expiredItems   = invItems.filter(it=>activeBatches(it).some(b=>b.qty>0&&b.expiryDate&&new Date(b.expiryDate)<today));
    const expiringSoon   = invItems.filter(it=>activeBatches(it).some(b=>b.qty>0&&b.expiryDate&&new Date(b.expiryDate)>=today&&new Date(b.expiryDate)<=in90));
    const activeRecalls  = invRecalls.filter(r=>r.status==="active");

    const filteredItems = invItems.filter(it=>{
      const matchCat  = invCat==="All"||it.category===invCat;
      const matchSrch = !invSearch||it.name.toLowerCase().includes(invSearch.toLowerCase())||it.id.toLowerCase().includes(invSearch.toLowerCase())||it.supplier?.toLowerCase().includes(invSearch.toLowerCase());
      return matchCat&&matchSrch;
    });
    const recentTxns = [...invTxns].reverse().slice(0,10);

    // ── Submit handlers ─────────────────────────────────────────────────────
    const handleStockIn = () => {
      const { itemId,qty,reference,department,batchNo,expiryDate,unitCost,performedBy,notes } = invForm;
      if (!itemId)                               { setInvErr("Select an item."); return; }
      if (!qty||isNaN(qty)||Number(qty)<=0)      { setInvErr("Enter a valid quantity."); return; }
      if (!batchNo?.trim())                      { setInvErr("Batch / Lot number is required."); return; }
      if (!performedBy?.trim())                  { setInvErr("Performed by is required."); return; }
      const newTxn = { id:"TXN"+String(invTxns.length+1).padStart(3,"0"), type:"in", itemId, qty:Number(qty), batchNo, date:new Date().toISOString().split("T")[0], reference:reference||"", department:department||"Pharmacy", expiryDate:expiryDate||"", unitCost:Number(unitCost)||0, performedBy, notes:notes||"" };
      setInvTxns(prev=>[...prev,newTxn]);
      setInvItems(prev=>prev.map(it=>{
        if (it.id!==itemId) return it;
        const existingBatch = it.batches.find(b=>b.batchNo===batchNo);
        const newBatches = existingBatch
          ? it.batches.map(b=>b.batchNo===batchNo?{...b,qty:b.qty+Number(qty)}:b)
          : [...it.batches, { batchNo, qty:Number(qty), receivedAt:new Date().toISOString().split("T")[0], expiryDate:expiryDate||"", unitCost:Number(unitCost)||0, recalled:false }];
        return {...it, batches:newBatches};
      }));
      apiCall(`/hms/inventory/${itemId}/transaction`, "POST", { type:"in", qty:Number(qty), batchNo, expiryDate:expiryDate||"", unitCost:Number(unitCost)||0, reference:reference||"", department:department||"Pharmacy", notes:notes||"", performedBy, receivedAt:new Date().toISOString().split("T")[0] }).catch(console.error);
      setInvModal(null); setInvForm({}); setInvErr("");
    };

    const handleStockOut = () => {
      const { itemId,qty,reference,department,performedBy,notes } = invForm;
      if (!itemId)                               { setInvErr("Select an item."); return; }
      if (!qty||isNaN(qty)||Number(qty)<=0)      { setInvErr("Enter a valid quantity."); return; }
      if (!performedBy?.trim())                  { setInvErr("Performed by is required."); return; }
      const item = invItems.find(it=>it.id===itemId);
      if (!item)                                 { setInvErr("Item not found."); return; }
      const avail = getStock(item);
      if (Number(qty)>avail)                     { setInvErr(`Only ${avail} ${item.unit}(s) available.`); return; }
      const alloc = getAllocation(item, Number(qty), invMode);
      const newTxn = { id:"TXN"+String(invTxns.length+1).padStart(3,"0"), type:"out", itemId, qty:Number(qty), batchNo:alloc.map(a=>a.batchNo).join(", "), date:new Date().toISOString().split("T")[0], reference:reference||"", department:department||"OPD", issueMode:invMode, unitCost:getUnitCost(item), performedBy, notes:notes||"" };
      setInvTxns(prev=>[...prev,newTxn]);
      setInvItems(prev=>prev.map(it=>{
        if (it.id!==itemId) return it;
        let rem = Number(qty);
        const ordered = sortedBatches(it, invMode);
        const deductions = {};
        for (const b of ordered) { if(rem<=0)break; const take=Math.min(b.qty,rem); deductions[b.batchNo]=take; rem-=take; }
        return {...it, batches:it.batches.map(b=>deductions[b.batchNo]?{...b,qty:b.qty-deductions[b.batchNo]}:b)};
      }));
      apiCall(`/hms/inventory/${itemId}/transaction`, "POST", { type:"out", qty:Number(qty), batchNo:alloc.map(a=>a.batchNo).join(", "), reference:reference||"", department:department||"OPD", notes:notes||"", performedBy, unitCost:getUnitCost(item) }).catch(console.error);
      setInvModal(null); setInvForm({}); setInvErr("");
    };

    const handleAddItem = () => {
      const { name,category,unit,currentStock,reorderLevel,unitCost,location,supplier,batchNo,expiryDate } = invForm;
      if (!name?.trim())  { setInvErr("Item name is required."); return; }
      if (!category)      { setInvErr("Category is required."); return; }
      if (!unit?.trim())  { setInvErr("Unit is required."); return; }
      const newId = "INV"+String(invItems.length+1).padStart(3,"0");
      const openingQty = Number(currentStock)||0;
      const batches = openingQty>0&&batchNo ? [{ batchNo, qty:openingQty, receivedAt:new Date().toISOString().split("T")[0], expiryDate:expiryDate||"", unitCost:Number(unitCost)||0, recalled:false }] : [];
      const newItem = { id:newId, name:name.trim(), category, unit:unit.trim(), reorderLevel:Number(reorderLevel)||0, location:location||"", supplier:supplier||"", batches };
      setInvItems(prev=>[...prev,newItem]);
      apiCall("/hms/inventory", "POST", { itemId:newId, name:name.trim(), category, unit:unit.trim(), reorderLevel:Number(reorderLevel)||0, location:location||"", supplier:supplier||"", batches }).catch(console.error);
      setInvModal(null); setInvForm({}); setInvErr("");
    };

    const handleRecall = () => {
      const { recallBatchNo, recallItemId, recallReason, recalledBy } = invForm;
      if (!recallBatchNo?.trim()) { setInvErr("Batch number is required."); return; }
      if (!recallReason?.trim())  { setInvErr("Recall reason is required."); return; }
      if (!recalledBy?.trim())    { setInvErr("Recalled by is required."); return; }
      const item = recallItemId ? invItems.find(i=>i.id===recallItemId) : invItems.find(i=>i.batches?.some(b=>b.batchNo===recallBatchNo));
      if (!item) { setInvErr("No item found with that batch number."); return; }
      const batch = item.batches.find(b=>b.batchNo===recallBatchNo);
      if (!batch) { setInvErr(`Batch ${recallBatchNo} not found on ${item.name}.`); return; }
      if (batch.recalled) { setInvErr("This batch is already recalled."); return; }
      const affectedQty = batch.qty;
      const recallId = "RCL"+String(invRecalls.length+1).padStart(3,"0");
      const newRecall = { id:recallId, batchNo:recallBatchNo, itemId:item.id, itemName:item.name, reason:recallReason, recalledAt:new Date().toISOString().split("T")[0], recalledBy, affectedQty, status:"active" };
      setInvRecalls(prev=>[...prev,newRecall]);
      setInvItems(prev=>prev.map(it=>it.id===item.id?{...it,batches:it.batches.map(b=>b.batchNo===recallBatchNo?{...b,recalled:true}:b)}:it));
      const newTxn = { id:"TXN"+String(invTxns.length+1).padStart(3,"0"), type:"recall", itemId:item.id, qty:affectedQty, batchNo:recallBatchNo, date:new Date().toISOString().split("T")[0], reference:recallId, department:"QA", notes:"Batch recalled: "+recallReason, unitCost:batch.unitCost, performedBy:recalledBy };
      setInvTxns(prev=>[...prev,newTxn]);
      setInvModal(null); setInvForm({}); setInvErr("");
    };

    const resolveRecall = (rclId) => {
      setInvRecalls(prev=>prev.map(r=>r.id===rclId?{...r,status:"resolved"}:r));
    };

    const SS2 = { width:"100%",padding:"8px 10px",border:"1px solid #e2e8f0",borderRadius:8,fontFamily:"inherit",fontSize:13,outline:"none",background:"#fff" };
    const FL2 = ({label,ch,half,third})=>(
      <div style={{marginBottom:12,width:third?"31%":half?"48%":"100%"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#475569",marginBottom:4,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8}}>{label}</div>
        {ch}
      </div>
    );

    const TABS = [
      { key:"overview", label:"Overview",  icon:"📊" },
      { key:"items",    label:"All Items", icon:"📦" },
      { key:"stockin",  label:"Stock In",  icon:"⬇️" },
      { key:"stockout", label:"Stock Out", icon:"⬆️" },
      { key:"alerts",   label:"Alerts",    icon:"🔔", badge:lowStockItems.length+outOfStockItems.length+expiredItems.length },
      { key:"recalls",  label:"Recalls",   icon:"🚨", badge:activeRecalls.length },
    ];

    const printStockReport = () => {
      const rows = filteredItems.map(it=>{ const st=stockStatus(it); const ex=expiryStatus(it); const s=getStock(it); return `<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${it.id}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-weight:600">${it.name}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${it.category}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700">${s} ${it.unit}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:center">${it.reorderLevel}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:right">KES ${getUnitCost(it).toLocaleString()}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;text-align:right">KES ${(s*getUnitCost(it)).toLocaleString()}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;color:${st.color};font-weight:700">${st.label}${ex?` / ${ex.label}`:""}</td></tr>`; }).join("");
      const html = `<!DOCTYPE html><html><head><title>Inventory Report</title><style>body{font-family:'Palatino Linotype',serif;margin:40px;color:#1e293b}table{width:100%;border-collapse:collapse}th{background:#f8fafc;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:2px solid #e2e8f0}@media print{button{display:none}}</style></head><body><div style="display:flex;justify-content:space-between;border-bottom:3px solid #0e7490;padding-bottom:14px;margin-bottom:20px"><div><h1 style="margin:0;font-size:20px">🏥 MediCore HMS — Inventory Report</h1><div style="font-size:12px;color:#64748b;margin-top:4px">Generated: ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})}</div></div><div style="text-align:right;font-size:12px"><div>Total Items: ${filteredItems.length}</div><div>Total Value: KES ${totalValue.toLocaleString()}</div></div></div><table><thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Stock</th><th>Reorder Lvl</th><th>Unit Cost</th><th>Value</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
      const w=window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
    };

    // Compute batch allocation preview for stock out form
    const outAlloc = (invForm.itemId && invForm.qty && Number(invForm.qty)>0)
      ? getAllocation(invItems.find(i=>i.id===invForm.itemId)||{batches:[]}, Number(invForm.qty), invMode)
      : [];

    return (
      <Layout page={page} setPage={setPage} patients={patients} overlay={ToastModal}>
        <TopBar title="Inventory Management"
          subtitle={`${invItems.length} items · KES ${totalValue.toLocaleString()} total value · ${activeRecalls.length>0?`🚨 ${activeRecalls.length} active recall(s)`:""}`}
          action={
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {/* FIFO/FEFO toggle */}
              <div style={{display:"flex",background:"#f1f5f9",borderRadius:8,padding:3,gap:2}}>
                {["FEFO","FIFO"].map(m=>(
                  <button key={m} onClick={()=>setInvMode(m)} style={{padding:"5px 14px",border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:invMode===m?"#fff":"#64748b",background:invMode===m?"#0e7490":"transparent",transition:"all .15s"}}>
                    {m==="FEFO"?"🗓 FEFO":"📅 FIFO"}
                  </button>
                ))}
              </div>
              <button onClick={()=>{setInvForm({});setInvErr("");setInvModal({type:"add-item"});}} style={{padding:"8px 16px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"#0e7490"}}>+ Add Item</button>
              <button onClick={()=>{setInvForm({});setInvErr("");setInvModal({type:"recall"});}} style={{padding:"8px 16px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"#dc2626"}}>🚨 Issue Recall</button>
              <button onClick={printStockReport} style={BtnGhost}>🖨 Print</button>
            </div>
          } />

        <div style={{padding:"20px 26px"}}>
          {/* FIFO/FEFO info banner */}
          <div style={{background:invMode==="FEFO"?"#f0fdf4":"#f0f9ff",border:`1px solid ${invMode==="FEFO"?"#86efac":"#7dd3fc"}`,borderRadius:9,padding:"9px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>{invMode==="FEFO"?"🗓":"📅"}</span>
            <div>
              <span style={{fontSize:12,fontWeight:700,color:invMode==="FEFO"?"#166534":"#0369a1"}}>{invMode} Mode Active — </span>
              <span style={{fontSize:12,color:"#475569"}}>{invMode==="FEFO"?"Stock is issued with the nearest expiry date first (First Expired, First Out) — minimises wastage from expired stock.":"Stock is issued in order of receipt date (First In, First Out) — oldest stock issued first."}</span>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{display:"flex",gap:4,background:"#fff",borderRadius:12,padding:5,boxShadow:"0 1px 8px rgba(0,0,0,.07)",marginBottom:22,flexWrap:"wrap"}}>
            {TABS.map(t=>{
              const active=invTab===t.key;
              return (
                <button key={t.key} onClick={()=>setInvTab(t.key)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:active?700:500,color:active?"#fff":"#64748b",background:active?(t.key==="recalls"?"#dc2626":"#0e7490"):"transparent",transition:"all .15s",position:"relative"}}>
                  {t.icon} {t.label}
                  {t.badge>0&&<span style={{background:t.key==="recalls"?"#fff":"#dc2626",color:t.key==="recalls"?"#dc2626":"#fff",borderRadius:"50%",width:17,height:17,fontSize:9,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center",marginLeft:4}}>{t.badge}</span>}
                </button>
              );
            })}
          </div>

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          {invTab==="overview" && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:24}}>
                {[
                  ["Total SKUs",       invItems.length,                                              "#0e7490","#cffafe","📦"],
                  ["In Stock",         invItems.filter(i=>getStock(i)>=i.reorderLevel).length,       "#166534","#dcfce7","✅"],
                  ["Low / Out",        lowStockItems.length+outOfStockItems.length,                  "#92400e","#fef3c7","⚠️"],
                  ["Expiring ≤90d",   expiredItems.length+expiringSoon.length,                      "#7e22ce","#f3e8ff","📅"],
                  ["Active Recalls",   activeRecalls.length,                                         "#991b1b","#fee2e2","🚨"],
                ].map(([l,n,col,bg,icon])=>(
                  <div key={l} style={{background:"#fff",borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 8px rgba(0,0,0,.07)",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:42,height:42,background:bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
                    <div><div style={{fontSize:24,fontWeight:800,color:col,lineHeight:1}}>{n}</div><div style={{fontSize:10,color:"#64748b",fontFamily:"monospace",marginTop:2}}>{l}</div></div>
                  </div>
                ))}
              </div>
              {/* ── Expiry Alert Banner ──────────────────────────────────── */}
              {(() => {
                const _today = new Date(); _today.setHours(0,0,0,0);
                const _in30  = new Date(_today); _in30.setDate(_in30.getDate()+30);
                const urgentBatches = [];
                for (const it of invItems) {
                  for (const b of (it.batches||[])) {
                    if (b.recalled||!b.expiryDate||b.qty<=0) continue;
                    const exp = new Date(b.expiryDate);
                    const days = Math.ceil((exp-_today)/86400000);
                    if (days<=30) urgentBatches.push({ name:it.name, batchNo:b.batchNo, days, qty:b.qty, val:b.qty*(b.unitCost||0) });
                  }
                }
                if (!urgentBatches.length) return null;
                urgentBatches.sort((a,b)=>a.days-b.days);
                const expiredCnt = urgentBatches.filter(d=>d.days<=0).length;
                const criticalCnt = urgentBatches.filter(d=>d.days>0&&d.days<=30).length;
                const totalVal = urgentBatches.reduce((s,d)=>s+d.val,0);
                return (
                  <div style={{ marginBottom:20,borderRadius:12,overflow:"hidden",border:"2px solid #fca5a5" }}>
                    <div style={{ background:"linear-gradient(90deg,#7f1d1d,#991b1b)",padding:"11px 18px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <span style={{ fontSize:18 }}>⏰</span>
                        <div>
                          <div style={{ fontSize:13,fontWeight:800,color:"#fff" }}>Expiry Alert — Immediate Action Required</div>
                          <div style={{ fontSize:11,color:"rgba(255,255,255,.7)" }}>{expiredCnt} expired · {criticalCnt} expiring in ≤30 days · KES {totalVal.toLocaleString()} at risk</div>
                        </div>
                      </div>
                      <button onClick={()=>setPage("expiry")} style={{ padding:"7px 16px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,background:"#fff",color:"#991b1b" }}>View Expiry Dashboard →</button>
                    </div>
                    <div style={{ background:"#fff7f7",padding:"10px 18px",display:"flex",gap:24,flexWrap:"wrap" }}>
                      {urgentBatches.slice(0,4).map((d,i)=>(
                        <div key={i} style={{ display:"flex",alignItems:"center",gap:8,fontSize:12 }}>
                          <span style={{ fontWeight:700,padding:"2px 8px",borderRadius:20,background:d.days<=0?"#fee2e2":"#fef3c7",color:d.days<=0?"#dc2626":"#92400e",fontFamily:"monospace",fontSize:11 }}>{d.days<=0?"EXPIRED":`${d.days}d`}</span>
                          <span style={{ color:"#0b1929",fontWeight:600 }}>{d.name}</span>
                          <span style={{ color:"#94a3b8" }}>Batch {d.batchNo} · {d.qty} units</span>
                        </div>
                      ))}
                      {urgentBatches.length>4 && <span style={{ fontSize:12,color:"#94a3b8",alignSelf:"center" }}>+{urgentBatches.length-4} more</span>}
                    </div>
                  </div>
                );
              })()}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                <Card mb={0}>
                  <Sec accent="#0e7490">Stock Value by Category</Sec>
                  {["Drugs","Consumables","Lab Reagents","Equipment","Office Supplies"].map(cat=>{
                    const val=invItems.filter(i=>i.category===cat).reduce((s,i)=>s+getStock(i)*getUnitCost(i),0);
                    const pct=totalValue>0?Math.round(val/totalValue*100):0;
                    return (
                      <div key={cat} style={{marginBottom:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{cat}</span><span style={{fontSize:12,fontFamily:"monospace",color:"#0e7490",fontWeight:700}}>KES {val.toLocaleString()} <span style={{color:"#94a3b8",fontWeight:400}}>({pct}%)</span></span></div>
                        <div style={{height:7,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:"#0e7490",borderRadius:4}}/></div>
                      </div>
                    );
                  })}
                  <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#0b1929"}}>Total Stock Value</span>
                    <span style={{fontSize:14,fontWeight:800,color:"#0e7490",fontFamily:"monospace"}}>KES {totalValue.toLocaleString()}</span>
                  </div>
                </Card>
                <Card mb={0}>
                  <Sec accent="#0e7490">Recent Transactions</Sec>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>{["Date","Item","Type","Qty","Batch","By"].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",fontSize:9,fontWeight:700,color:"#94a3b8",fontFamily:"monospace",letterSpacing:.8,borderBottom:"1px solid #f1f5f9"}}>{h}</th>)}</tr></thead>
                      <tbody>
                        {recentTxns.map(tx=>{
                          const it=invItems.find(i=>i.id===tx.itemId);
                          const isRecall=tx.type==="recall";
                          return (
                            <tr key={tx.id} style={{borderBottom:"1px solid #f8fafc",background:isRecall?"#fff7f7":"#fff"}}>
                              <td style={{padding:"7px 8px",fontSize:11,color:"#64748b",fontFamily:"monospace"}}>{fmtDate(tx.date)}</td>
                              <td style={{padding:"7px 8px",fontSize:11,fontWeight:600,color:"#1e293b",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it?.name||tx.itemId}</td>
                              <td style={{padding:"7px 8px"}}><span style={{padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:700,color:isRecall?"#991b1b":tx.type==="in"?"#166534":"#991b1b",background:isRecall?"#fee2e2":tx.type==="in"?"#dcfce7":"#fee2e2"}}>{isRecall?"🚨 RECALL":tx.type==="in"?"▼ IN":"▲ OUT"}</span></td>
                              <td style={{padding:"7px 8px",fontSize:12,fontWeight:700,fontFamily:"monospace",color:isRecall?"#991b1b":tx.type==="in"?"#166534":"#991b1b"}}>{tx.type==="in"?"+":"-"}{tx.qty}</td>
                              <td style={{padding:"7px 8px",fontSize:10,color:"#94a3b8",fontFamily:"monospace"}}>{tx.batchNo||"—"}</td>
                              <td style={{padding:"7px 8px",fontSize:11,color:"#475569"}}>{tx.performedBy}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ── ALL ITEMS ────────────────────────────────────────────────── */}
          {invTab==="items" && (
            <div>
              <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
                <input value={invSearch} onChange={e=>setInvSearch(e.target.value)} placeholder="Search by name, ID, supplier…" style={{padding:"9px 14px",border:"1px solid #e2e8f0",borderRadius:9,fontFamily:"inherit",fontSize:13,outline:"none",width:280}} />
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {INV_CATS.map(cat=>(
                    <button key={cat} onClick={()=>setInvCat(cat)} style={{padding:"6px 14px",border:`1.5px solid ${invCat===cat?"#0e7490":"#e2e8f0"}`,borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:invCat===cat?700:500,color:invCat===cat?"#0e7490":"#64748b",background:invCat===cat?"#f0fdff":"#fff"}}>{cat}</button>
                  ))}
                </div>
                <span style={{marginLeft:"auto",fontSize:12,color:"#94a3b8",fontFamily:"monospace"}}>{filteredItems.length} item{filteredItems.length!==1?"s":""}</span>
              </div>
              <div style={{background:"#fff",borderRadius:13,boxShadow:"0 1px 8px rgba(0,0,0,.07)",overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#f8fafc"}}>
                    {["ID","Name","Category","Batches","Total Stock","Reorder Lvl","Next Expiry","Status","Actions"].map(h=>(
                      <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:9,fontWeight:700,color:"#94a3b8",fontFamily:"monospace",letterSpacing:.8,borderBottom:"1px solid #e2e8f0"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filteredItems.length===0
                      ? <tr><td colSpan={9} style={{padding:"40px",textAlign:"center",color:"#94a3b8"}}>No items found</td></tr>
                      : filteredItems.map((item,i)=>{
                        const st=stockStatus(item); const ex=expiryStatus(item);
                        const stock=getStock(item);
                        const ab=activeBatches(item);
                        const nearestExp=ab.filter(b=>b.expiryDate&&b.qty>0).sort((a,b)=>a.expiryDate>b.expiryDate?1:-1)[0];
                        const recalledBatches=(item.batches||[]).filter(b=>b.recalled);
                        return (
                          <tr key={item.id} style={{background:i%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #f1f5f9"}}>
                            <td style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace",color:"#64748b"}}>{item.id}</td>
                            <td style={{padding:"10px 12px",fontSize:12,fontWeight:700,color:"#0b1929",maxWidth:170}}>
                              {item.name}
                              {recalledBatches.length>0&&<span style={{display:"block",fontSize:9,color:"#dc2626",fontFamily:"monospace",marginTop:2}}>🚨 {recalledBatches.length} recalled batch{recalledBatches.length>1?"es":""}</span>}
                            </td>
                            <td style={{padding:"10px 12px",fontSize:11,color:"#475569"}}>{item.category}</td>
                            <td style={{padding:"10px 12px"}}><span style={{background:"#f0f9ff",color:"#0369a1",borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700}}>{ab.length} active</span></td>
                            <td style={{padding:"10px 12px",fontSize:13,fontWeight:800,fontFamily:"monospace",color:st.color}}>{stock.toLocaleString()} <span style={{fontSize:10,fontWeight:400,color:"#94a3b8"}}>{item.unit}</span></td>
                            <td style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace",color:"#64748b"}}>{item.reorderLevel.toLocaleString()}</td>
                            <td style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace",color:ex?.color||"#64748b"}}>{nearestExp?fmtDate(nearestExp.expiryDate):"—"}</td>
                            <td style={{padding:"10px 12px"}}>
                              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                                <span style={{padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,color:st.color,background:st.bg}}>{st.label}</span>
                                {ex&&<span style={{padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,color:ex.color,background:ex.bg}}>{ex.label}</span>}
                              </div>
                            </td>
                            <td style={{padding:"10px 12px"}}>
                              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                                <button onClick={()=>{setInvForm({itemId:item.id});setInvErr("");setInvModal({type:"stock-in",item});}} style={{padding:"4px 10px",border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,color:"#fff",background:"#166534"}}>▼ In</button>
                                <button onClick={()=>{setInvForm({itemId:item.id});setInvErr("");setInvModal({type:"stock-out",item});}} style={{padding:"4px 10px",border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,color:"#fff",background:"#dc2626"}} disabled={stock===0}>▲ Out</button>
                                <button onClick={()=>setInvModal({type:"batches",item})} style={{padding:"4px 10px",border:"1px solid #e2e8f0",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,color:"#0e7490",background:"#f0fdff"}}>Batches</button>
                                <button onClick={()=>setInvModal({type:"history",item})} style={{padding:"4px 10px",border:"1px solid #e2e8f0",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,color:"#475569",background:"#fff"}}>History</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── STOCK IN ─────────────────────────────────────────────────── */}
          {invTab==="stockin" && (
            <div style={{maxWidth:700}}>
              <Card mb={0}>
                <Sec accent="#166534">Receive Stock</Sec>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0 4%"}}>
                  <FL2 label="Item *" ch={<select value={invForm.itemId||""} onChange={e=>setInvForm(p=>({...p,itemId:e.target.value}))} style={SS2}><option value="">-- Select item --</option>{invItems.map(it=><option key={it.id} value={it.id}>{it.name} ({it.unit}) — Stock: {getStock(it)}</option>)}</select>} />
                  <FL2 label="Batch / Lot No. *" half ch={<input value={invForm.batchNo||""} onChange={e=>setInvForm(p=>({...p,batchNo:e.target.value}))} style={SS2} placeholder="e.g. BP2025001" />} />
                  <FL2 label="Quantity *" half ch={<input type="number" min="1" value={invForm.qty||""} onChange={e=>setInvForm(p=>({...p,qty:e.target.value}))} style={SS2} placeholder="0" />} />
                  <FL2 label="Unit Cost (KES)" third ch={<input type="number" min="0" value={invForm.unitCost||""} onChange={e=>setInvForm(p=>({...p,unitCost:e.target.value}))} style={SS2} placeholder="0.00" />} />
                  <FL2 label="Expiry Date" third ch={<input type="date" value={invForm.expiryDate||""} onChange={e=>setInvForm(p=>({...p,expiryDate:e.target.value}))} style={SS2} />} />
                  <FL2 label="Supplier / Source" third ch={<input value={invForm.supplier||""} onChange={e=>setInvForm(p=>({...p,supplier:e.target.value}))} style={SS2} placeholder="Supplier name" />} />
                  <FL2 label="Purchase Order / Ref" half ch={<input value={invForm.reference||""} onChange={e=>setInvForm(p=>({...p,reference:e.target.value}))} style={SS2} placeholder="PO-2025-XXX" />} />
                  <FL2 label="Store / Department" half ch={<select value={invForm.department||"Pharmacy"} onChange={e=>setInvForm(p=>({...p,department:e.target.value}))} style={SS2}>{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</select>} />
                  <FL2 label="Performed By *" ch={<input value={invForm.performedBy||""} onChange={e=>setInvForm(p=>({...p,performedBy:e.target.value}))} style={SS2} placeholder="Store manager name" />} />
                  <FL2 label="Notes" ch={<textarea value={invForm.notes||""} onChange={e=>setInvForm(p=>({...p,notes:e.target.value}))} style={{...SS2,minHeight:60,resize:"vertical"}} />} />
                </div>
                {invErr&&<div style={{color:"#dc2626",fontSize:12,marginBottom:12,padding:"8px 12px",background:"#fef2f2",borderRadius:7}}>{invErr}</div>}
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={()=>{setInvForm({});setInvErr("");}} style={BtnGhost}>Clear</button>
                  <button onClick={handleStockIn} style={{padding:"10px 28px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:"#fff",background:"#166534"}}>⬇️ Confirm Stock In</button>
                </div>
              </Card>
            </div>
          )}

          {/* ── STOCK OUT ────────────────────────────────────────────────── */}
          {invTab==="stockout" && (
            <div style={{maxWidth:760,display:"grid",gridTemplateColumns:"1fr 320px",gap:18,alignItems:"start"}}>
              <Card mb={0}>
                <Sec accent="#dc2626">Issue Stock ({invMode})</Sec>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0 4%"}}>
                  <FL2 label="Item *" ch={<select value={invForm.itemId||""} onChange={e=>setInvForm(p=>({...p,itemId:e.target.value,qty:""}))} style={SS2}><option value="">-- Select item --</option>{invItems.filter(i=>getStock(i)>0).map(it=><option key={it.id} value={it.id}>{it.name} ({it.unit}) — Stock: {getStock(it)}</option>)}</select>} />
                  <FL2 label="Quantity *" half ch={<input type="number" min="1" max={invForm.itemId?getStock(invItems.find(i=>i.id===invForm.itemId)||{batches:[]}):undefined} value={invForm.qty||""} onChange={e=>setInvForm(p=>({...p,qty:e.target.value}))} style={SS2} placeholder="0" />} />
                  <FL2 label="Issuing Department *" half ch={<select value={invForm.department||"OPD"} onChange={e=>setInvForm(p=>({...p,department:e.target.value}))} style={SS2}>{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</select>} />
                  <FL2 label="Requisition / Ref No." half ch={<input value={invForm.reference||""} onChange={e=>setInvForm(p=>({...p,reference:e.target.value}))} style={SS2} placeholder="REQ-2025-XXX" />} />
                  <FL2 label="Performed By *" half ch={<input value={invForm.performedBy||""} onChange={e=>setInvForm(p=>({...p,performedBy:e.target.value}))} style={SS2} placeholder="Nurse / Staff name" />} />
                  <FL2 label="Notes / Purpose" ch={<textarea value={invForm.notes||""} onChange={e=>setInvForm(p=>({...p,notes:e.target.value}))} style={{...SS2,minHeight:60,resize:"vertical"}} />} />
                </div>
                {invErr&&<div style={{color:"#dc2626",fontSize:12,marginBottom:12,padding:"8px 12px",background:"#fef2f2",borderRadius:7}}>{invErr}</div>}
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button onClick={()=>{setInvForm({});setInvErr("");}} style={BtnGhost}>Clear</button>
                  <button onClick={handleStockOut} style={{padding:"10px 28px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:"#fff",background:"#dc2626"}}>⬆️ Confirm Issue</button>
                </div>
              </Card>
              {/* FIFO/FEFO live allocation preview */}
              <div style={{position:"sticky",top:70}}>
                <Card mb={0}>
                  <Sec accent={invMode==="FEFO"?"#166534":"#0369a1"}>{invMode} Batch Allocation Preview</Sec>
                  {outAlloc.length===0
                    ? <div style={{textAlign:"center",padding:"24px 12px",color:"#94a3b8",fontSize:12}}>Select an item and quantity to see which batches will be issued.</div>
                    : (<>
                        <div style={{fontSize:11,color:"#475569",marginBottom:10}}>The following batches will be consumed ({invMode}):</div>
                        {outAlloc.map((b,i)=>(
                          <div key={b.batchNo} style={{background:i%2===0?"#f8fafc":"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <div>
                                <div style={{fontSize:12,fontWeight:700,color:"#0b1929",fontFamily:"monospace"}}>{b.batchNo}</div>
                                <div style={{fontSize:10,color:"#64748b",marginTop:2}}>Exp: {fmtDate(b.expiryDate)} · Rcv: {fmtDate(b.receivedAt)}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontSize:16,fontWeight:800,color:"#dc2626",fontFamily:"monospace"}}>-{b.take}</div>
                                <div style={{fontSize:10,color:"#94a3b8"}}>of {b.qty} avail.</div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",fontSize:12}}>
                          <span style={{color:"#475569"}}>Total issued:</span>
                          <span style={{fontWeight:800,color:"#dc2626",fontFamily:"monospace"}}>{outAlloc.reduce((s,b)=>s+b.take,0)}</span>
                        </div>
                      </>)
                  }
                </Card>
              </div>
            </div>
          )}

          {/* ── ALERTS ───────────────────────────────────────────────────── */}
          {invTab==="alerts" && (
            <div>
              {outOfStockItems.length>0&&<div style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:800,color:"#991b1b",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>❌ Out of Stock <span style={{background:"#fee2e2",color:"#991b1b",borderRadius:6,padding:"2px 10px",fontSize:11}}>{outOfStockItems.length}</span></div>
                {outOfStockItems.map(item=>(
                  <div key={item.id} style={{background:"#fff",border:"1.5px solid #fca5a5",borderRadius:11,padding:"14px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontWeight:700,fontSize:13,color:"#0b1929"}}>{item.name}</div><div style={{fontSize:11,color:"#64748b",fontFamily:"monospace",marginTop:2}}>{item.id} · {item.category} · Reorder level: {item.reorderLevel} {item.unit}</div></div>
                    <button onClick={()=>{setInvForm({itemId:item.id});setInvErr("");setInvTab("stockin");}} style={{padding:"7px 16px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"#166534"}}>+ Restock</button>
                  </div>
                ))}
              </div>}
              {lowStockItems.length>0&&<div style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:800,color:"#92400e",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>⚠️ Low Stock <span style={{background:"#fef3c7",color:"#92400e",borderRadius:6,padding:"2px 10px",fontSize:11}}>{lowStockItems.length}</span></div>
                {lowStockItems.map(item=>{
                  const pct=Math.round(getStock(item)/item.reorderLevel*100);
                  return (
                    <div key={item.id} style={{background:"#fff",border:"1.5px solid #fcd34d",borderRadius:11,padding:"14px 18px",marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div><div style={{fontWeight:700,fontSize:13,color:"#0b1929"}}>{item.name}</div><div style={{fontSize:11,color:"#64748b",fontFamily:"monospace",marginTop:2}}>{item.id} · Supplier: {item.supplier||"-"}</div></div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:900,color:"#d97706",fontFamily:"monospace"}}>{getStock(item)} <span style={{fontSize:12,fontWeight:400}}>{item.unit}</span></div><div style={{fontSize:10,color:"#94a3b8"}}>of {item.reorderLevel} reorder level</div></div>
                          <button onClick={()=>{setInvForm({itemId:item.id});setInvErr("");setInvTab("stockin");}} style={{padding:"7px 14px",border:"none",borderRadius:7,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,color:"#fff",background:"#166634"}}>+ Restock</button>
                        </div>
                      </div>
                      <div style={{height:6,background:"#f1f5f9",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:pct<50?"#ef4444":"#f59e0b",borderRadius:3}}/></div>
                    </div>
                  );
                })}
              </div>}
              {expiredItems.length>0&&<div style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:800,color:"#991b1b",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>🗑️ Items with Expired Batches <span style={{background:"#fee2e2",color:"#991b1b",borderRadius:6,padding:"2px 10px",fontSize:11}}>{expiredItems.length}</span></div>
                {expiredItems.map(item=>{
                  const expBatches=activeBatches(item).filter(b=>b.qty>0&&b.expiryDate&&new Date(b.expiryDate)<today);
                  return (
                    <div key={item.id} style={{background:"#fff",border:"1.5px solid #fca5a5",borderRadius:11,padding:"14px 18px",marginBottom:10}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#0b1929",marginBottom:6}}>{item.name}</div>
                      {expBatches.map(b=>(
                        <div key={b.batchNo} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fff5f5",borderRadius:7,padding:"7px 12px",marginBottom:4}}>
                          <span style={{fontSize:11,fontFamily:"monospace",color:"#7f1d1d"}}>Batch {b.batchNo} · Qty: {b.qty} · Expired: {fmtDate(b.expiryDate)}</span>
                          <button onClick={()=>{setInvForm({recallBatchNo:b.batchNo,recallItemId:item.id});setInvErr("");setInvModal({type:"recall"});}} style={{padding:"3px 10px",border:"none",borderRadius:5,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:700,color:"#fff",background:"#dc2626"}}>🚨 Issue Recall</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>}
              {expiringSoon.length>0&&<div>
                <div style={{fontSize:13,fontWeight:800,color:"#7e22ce",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>📅 Expiring Within 90 Days <span style={{background:"#f3e8ff",color:"#7e22ce",borderRadius:6,padding:"2px 10px",fontSize:11}}>{expiringSoon.length}</span></div>
                {expiringSoon.map(item=>{
                  const soonBatches=activeBatches(item).filter(b=>b.qty>0&&b.expiryDate&&new Date(b.expiryDate)>=today&&new Date(b.expiryDate)<=in90);
                  return (
                    <div key={item.id} style={{background:"#fff",border:"1.5px solid #d8b4fe",borderRadius:11,padding:"14px 18px",marginBottom:10}}>
                      <div style={{fontWeight:700,fontSize:13,color:"#0b1929",marginBottom:6}}>{item.name} <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>({item.unit})</span></div>
                      {soonBatches.map(b=>{
                        const daysLeft=Math.ceil((new Date(b.expiryDate)-today)/(1000*60*60*24));
                        return (
                          <div key={b.batchNo} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#faf5ff",borderRadius:7,padding:"7px 12px",marginBottom:4}}>
                            <span style={{fontSize:11,fontFamily:"monospace",color:"#581c87"}}>Batch {b.batchNo} · Qty: {b.qty} · Exp: {fmtDate(b.expiryDate)}</span>
                            <span style={{fontSize:12,fontWeight:800,color:"#7e22ce"}}>{daysLeft}d left</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>}
              {outOfStockItems.length===0&&lowStockItems.length===0&&expiredItems.length===0&&expiringSoon.length===0&&(
                <div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:48,marginBottom:12}}>✅</div><div style={{fontSize:16,fontWeight:700,color:"#475569"}}>All items are well stocked</div><div style={{fontSize:13,color:"#94a3b8",marginTop:4}}>No low stock, expiry, or batch alerts.</div></div>
              )}
            </div>
          )}

          {/* ── RECALLS ──────────────────────────────────────────────────── */}
          {invTab==="recalls" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontSize:13,color:"#475569"}}>Manage batch recalls and quarantine. Recalled stock is excluded from {invMode} dispensing.</div>
                <button onClick={()=>{setInvForm({});setInvErr("");setInvModal({type:"recall"});}} style={{padding:"8px 18px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"#dc2626"}}>🚨 Issue New Recall</button>
              </div>
              {activeRecalls.length>0&&(
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:13,fontWeight:800,color:"#991b1b",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>🚨 Active Recalls <span style={{background:"#fee2e2",color:"#991b1b",borderRadius:6,padding:"2px 10px",fontSize:11}}>{activeRecalls.length}</span></div>
                  {activeRecalls.map(r=>{
                    // Build patient list: seed log + live-session dispensed patients, matched by drug keyword
                    const keyword = (invItems.find(i=>i.id===r.itemId)?.name||r.itemName).split(/\s+/)[0].toLowerCase();
                    const fromLog = dispenseLog.filter(d=>d.drugName.toLowerCase().includes(keyword));
                    const fromSession = patients.filter(p=>
                      p.clerking?.dispensed &&
                      (p.clerking?.orders?.rx?.drugs||[]).some(d=>d.name.toLowerCase().includes(keyword))
                    ).map(p=>({
                      id: p.clerking.rxNo+"-s",
                      patientId: p.id, patientName:(p.firstName||p.name)+" "+(p.lastName||""),
                      mrn:p.mrn||p.id, queueNo:p.queueNo,
                      drugName:((p.clerking.orders.rx.drugs||[]).find(d=>d.name.toLowerCase().includes(keyword))||{name:""}).name,
                      dose:((p.clerking.orders.rx.drugs||[]).find(d=>d.name.toLowerCase().includes(keyword))||{}).dose||"",
                      rxNo:p.clerking.rxNo, dispensedAt:p.clerking.dispensedAt,
                      dispensedBy:p.clerking.pharmacist, notes:""
                    }));
                    const allPts = [...fromLog, ...fromSession];
                    const seenRx = new Set();
                    const pts = allPts.filter(d=>{ const k=d.rxNo||d.id; if(seenRx.has(k))return false; seenRx.add(k); return true; });
                    return (
                    <div key={r.id} style={{background:"#fff",border:"2px solid #fca5a5",borderRadius:12,padding:"16px 20px",marginBottom:12,boxShadow:"0 2px 8px rgba(220,38,38,.1)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
                            <span style={{background:"#fee2e2",color:"#991b1b",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:800}}>🚨 RECALL ACTIVE</span>
                            <span style={{fontSize:12,fontFamily:"monospace",fontWeight:700,color:"#0b1929"}}>{r.id}</span>
                          </div>
                          <div style={{fontSize:15,fontWeight:800,color:"#0b1929"}}>{r.itemName}</div>
                          <div style={{fontSize:12,fontFamily:"monospace",color:"#dc2626",fontWeight:700,marginTop:2}}>Batch: {r.batchNo} · Qty Quarantined: {r.affectedQty}</div>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"flex-start",flexShrink:0}}>
                          {/* Patient count badge — clickable */}
                          <button
                            onClick={()=>setInvRecallModal({recall:r, patients:pts, keyword})}
                            title="View patients issued this batch"
                            style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 14px",border:"2px solid #fca5a5",borderRadius:10,cursor:"pointer",fontFamily:"inherit",background:"#fff5f5",gap:2}}>
                            <span style={{fontSize:22,fontWeight:900,color:"#991b1b",lineHeight:1}}>{pts.length}</span>
                            <span style={{fontSize:9,fontWeight:700,color:"#dc2626",textTransform:"uppercase",letterSpacing:.5}}>Patient{pts.length!==1?"s":""} Issued</span>
                          </button>
                          <button onClick={()=>resolveRecall(r.id)} style={{padding:"7px 16px",border:"1.5px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#166534",background:"#f0fdf4",alignSelf:"flex-start"}}>✓ Mark Resolved</button>
                        </div>
                      </div>
                      <div style={{background:"#fff5f5",borderRadius:8,padding:"10px 14px",marginBottom:10}}>
                        <div style={{fontSize:11,color:"#991b1b",fontWeight:700,marginBottom:4}}>Recall Reason:</div>
                        <div style={{fontSize:12,color:"#7f1d1d"}}>{r.reason}</div>
                      </div>
                      {/* Mini patient preview (up to 3) */}
                      {pts.length>0&&(
                        <div style={{background:"#fef2f2",borderRadius:8,padding:"10px 14px"}}>
                          <div style={{fontSize:11,fontWeight:700,color:"#991b1b",marginBottom:6}}>Recent patients issued {keyword.charAt(0).toUpperCase()+keyword.slice(1)} from this batch:</div>
                          {pts.slice(0,3).map(p=>(
                            <div key={p.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderBottom:"1px solid #fca5a5"}}>
                              <span style={{fontWeight:600,color:"#7f1d1d"}}>{p.patientName}</span>
                              <span style={{fontFamily:"monospace",color:"#94a3b8"}}>{p.mrn} · {p.dispensedAt?new Date(p.dispensedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"-"}</span>
                            </div>
                          ))}
                          {pts.length>3&&(
                            <button onClick={()=>setInvRecallModal({recall:r,patients:pts,keyword})} style={{marginTop:6,background:"none",border:"none",color:"#dc2626",fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:"pointer",padding:0}}>
                              + {pts.length-3} more patient{pts.length-3>1?"s":""} — View all →
                            </button>
                          )}
                        </div>
                      )}
                      {pts.length===0&&(
                        <div style={{background:"#f0fdf4",borderRadius:8,padding:"8px 14px",fontSize:11,color:"#166534"}}>✓ No dispensing records found for this batch in the system.</div>
                      )}
                      <div style={{display:"flex",gap:20,marginTop:10,flexWrap:"wrap"}}>
                        {[["Recalled By",r.recalledBy],["Recall Date",fmtDate(r.recalledAt)],["Affected Qty",`${r.affectedQty} units`]].map(([l,v])=>(
                          <div key={l}><div style={{fontSize:9,color:"#94a3b8",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:.8}}>{l}</div><div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{v}</div></div>
                        ))}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
              {invRecalls.filter(r=>r.status==="resolved").length>0&&(
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>✓ Resolved Recalls <span style={{background:"#f1f5f9",color:"#64748b",borderRadius:6,padding:"2px 8px",fontSize:11}}>{invRecalls.filter(r=>r.status==="resolved").length}</span></div>
                  {invRecalls.filter(r=>r.status==="resolved").map(r=>(
                    <div key={r.id} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"12px 16px",marginBottom:8,opacity:.75}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div><span style={{background:"#dcfce7",color:"#166534",borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:700}}>✓ RESOLVED</span> <span style={{fontSize:12,fontWeight:700,color:"#0b1929",marginLeft:8}}>{r.itemName}</span> <span style={{fontSize:11,fontFamily:"monospace",color:"#64748b"}}>Batch {r.batchNo}</span></div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>{fmtDate(r.recalledAt)}</div>
                      </div>
                      <div style={{fontSize:11,color:"#64748b",marginTop:4}}>{r.reason}</div>
                    </div>
                  ))}
                </div>
              )}
              {invRecalls.length===0&&(
                <div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:48,marginBottom:12}}>✅</div><div style={{fontSize:16,fontWeight:700,color:"#475569"}}>No recalls on record</div></div>
              )}
            </div>
          )}
        </div>

        {/* ── MODALS ──────────────────────────────────────────────────────── */}
        {invModal&&["stock-in","stock-out","add-item","recall"].includes(invModal.type)&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>{setInvModal(null);setInvForm({});setInvErr("");}}>
            <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:580,maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
              <div style={{background:invModal.type==="stock-in"?"linear-gradient(135deg,#166534,#15803d)":invModal.type==="stock-out"?"linear-gradient(135deg,#991b1b,#dc2626)":invModal.type==="recall"?"linear-gradient(135deg,#7f1d1d,#b91c1c)":"linear-gradient(135deg,#0e7490,#0369a1)",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{invModal.type==="stock-in"?"⬇️ Stock In":invModal.type==="stock-out"?"⬆️ Stock Out":invModal.type==="recall"?"🚨 Issue Recall":"📦 Add New Item"}</div>
                  {invModal.item&&<div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>{invModal.item.name}</div>}
                  {invModal.type==="stock-out"&&<div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>Mode: {invMode} — batches sorted by {invMode==="FEFO"?"nearest expiry":"receipt date"}</div>}
                </div>
                <button onClick={()=>{setInvModal(null);setInvForm({});setInvErr("");}} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:7,padding:"6px 10px",cursor:"pointer",color:"#fff",fontSize:16}}>✕</button>
              </div>
              <div style={{padding:"20px 22px",overflowY:"auto",flex:1}}>
                {invModal.type==="add-item"&&(<div style={{display:"flex",flexWrap:"wrap",gap:"0 4%"}}>
                  <FL2 label="Item Name *" ch={<input value={invForm.name||""} onChange={e=>setInvForm(p=>({...p,name:e.target.value}))} style={SS2} placeholder="e.g. Paracetamol 500mg Tablets" />} />
                  <FL2 label="Category *" half ch={<select value={invForm.category||""} onChange={e=>setInvForm(p=>({...p,category:e.target.value}))} style={SS2}><option value="">Select…</option>{INV_CATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select>} />
                  <FL2 label="Unit *" half ch={<input value={invForm.unit||""} onChange={e=>setInvForm(p=>({...p,unit:e.target.value}))} style={SS2} placeholder="Tablet, Vial, Box…" />} />
                  <FL2 label="Reorder Level" half ch={<input type="number" min="0" value={invForm.reorderLevel||""} onChange={e=>setInvForm(p=>({...p,reorderLevel:e.target.value}))} style={SS2} placeholder="0" />} />
                  <FL2 label="Opening Stock" half ch={<input type="number" min="0" value={invForm.currentStock||""} onChange={e=>setInvForm(p=>({...p,currentStock:e.target.value}))} style={SS2} placeholder="0" />} />
                  <FL2 label="Opening Batch No." third ch={<input value={invForm.batchNo||""} onChange={e=>setInvForm(p=>({...p,batchNo:e.target.value}))} style={SS2} placeholder="BP2025XXX" />} />
                  <FL2 label="Expiry Date" third ch={<input type="date" value={invForm.expiryDate||""} onChange={e=>setInvForm(p=>({...p,expiryDate:e.target.value}))} style={SS2} />} />
                  <FL2 label="Unit Cost (KES)" third ch={<input type="number" min="0" value={invForm.unitCost||""} onChange={e=>setInvForm(p=>({...p,unitCost:e.target.value}))} style={SS2} placeholder="0.00" />} />
                  <FL2 label="Storage Location" half ch={<input value={invForm.location||""} onChange={e=>setInvForm(p=>({...p,location:e.target.value}))} style={SS2} placeholder="Pharmacy Store A…" />} />
                  <FL2 label="Supplier" half ch={<input value={invForm.supplier||""} onChange={e=>setInvForm(p=>({...p,supplier:e.target.value}))} style={SS2} placeholder="Supplier name" />} />
                </div>)}
                {invModal.type==="stock-in"&&(<div style={{display:"flex",flexWrap:"wrap",gap:"0 4%"}}>
                  <FL2 label="Item" ch={<input value={invModal.item?.name||""} disabled style={{...SS2,background:"#f8fafc",color:"#64748b"}} />} />
                  <FL2 label="Batch / Lot No. *" half ch={<input value={invForm.batchNo||""} onChange={e=>setInvForm(p=>({...p,batchNo:e.target.value}))} style={SS2} placeholder="BP2025XXX" />} />
                  <FL2 label="Quantity *" half ch={<input type="number" min="1" value={invForm.qty||""} onChange={e=>setInvForm(p=>({...p,qty:e.target.value}))} style={SS2} placeholder="0" />} />
                  <FL2 label="Unit Cost (KES)" third ch={<input type="number" min="0" value={invForm.unitCost||invModal.item?.batches?.slice(-1)[0]?.unitCost||""} onChange={e=>setInvForm(p=>({...p,unitCost:e.target.value}))} style={SS2} placeholder="0.00" />} />
                  <FL2 label="Expiry Date" third ch={<input type="date" value={invForm.expiryDate||""} onChange={e=>setInvForm(p=>({...p,expiryDate:e.target.value}))} style={SS2} />} />
                  <FL2 label="Supplier" third ch={<input value={invForm.supplier||""} onChange={e=>setInvForm(p=>({...p,supplier:e.target.value}))} style={SS2} placeholder="Supplier" />} />
                  <FL2 label="PO / Reference" half ch={<input value={invForm.reference||""} onChange={e=>setInvForm(p=>({...p,reference:e.target.value}))} style={SS2} placeholder="PO-2025-XXX" />} />
                  <FL2 label="Performed By *" half ch={<input value={invForm.performedBy||""} onChange={e=>setInvForm(p=>({...p,performedBy:e.target.value}))} style={SS2} placeholder="Store manager" />} />
                  <FL2 label="Notes" ch={<textarea value={invForm.notes||""} onChange={e=>setInvForm(p=>({...p,notes:e.target.value}))} style={{...SS2,minHeight:56,resize:"vertical"}} />} />
                </div>)}
                {invModal.type==="stock-out"&&(<div style={{display:"flex",flexWrap:"wrap",gap:"0 4%"}}>
                  <FL2 label="Item" ch={<input value={invModal.item?.name||""} disabled style={{...SS2,background:"#f8fafc",color:"#64748b"}} />} />
                  <FL2 label={`Available Stock (${invMode} mode)`} ch={<input value={`${getStock(invModal.item||{batches:[]})} ${invModal.item?.unit||""} · ${activeBatches(invModal.item||{batches:[]}).length} batch(es)`} disabled style={{...SS2,background:"#f8fafc",color:stockStatus(invModal.item||{batches:[],reorderLevel:0}).color,fontWeight:700,fontFamily:"monospace"}} />} />
                  <FL2 label="Quantity to Issue *" half ch={<input type="number" min="1" value={invForm.qty||""} onChange={e=>setInvForm(p=>({...p,qty:e.target.value}))} style={SS2} placeholder="0" />} />
                  <FL2 label="Issuing Department *" half ch={<select value={invForm.department||"OPD"} onChange={e=>setInvForm(p=>({...p,department:e.target.value}))} style={SS2}>{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</select>} />
                  <FL2 label="Requisition / Ref No." half ch={<input value={invForm.reference||""} onChange={e=>setInvForm(p=>({...p,reference:e.target.value}))} style={SS2} placeholder="REQ-2025-XXX" />} />
                  <FL2 label="Performed By *" half ch={<input value={invForm.performedBy||""} onChange={e=>setInvForm(p=>({...p,performedBy:e.target.value}))} style={SS2} placeholder="Nurse / Staff name" />} />
                  <FL2 label="Notes" ch={<textarea value={invForm.notes||""} onChange={e=>setInvForm(p=>({...p,notes:e.target.value}))} style={{...SS2,minHeight:56,resize:"vertical"}} />} />
                  {invModal.item&&invForm.qty&&Number(invForm.qty)>0&&(()=>{
                    const alloc=getAllocation(invModal.item,Number(invForm.qty),invMode);
                    return (<div style={{width:"100%",background:"#f8fafc",borderRadius:9,padding:"12px 14px",marginBottom:8}}>
                      <div style={{fontSize:11,fontWeight:700,color:invMode==="FEFO"?"#166534":"#0369a1",marginBottom:8}}>{invMode} Allocation:</div>
                      {alloc.map(b=><div key={b.batchNo} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderBottom:"1px solid #f1f5f9"}}><span style={{fontFamily:"monospace",color:"#475569"}}>{b.batchNo} (exp: {fmtDate(b.expiryDate)})</span><span style={{fontWeight:700,color:"#dc2626"}}>-{b.take}</span></div>)}
                    </div>);
                  })()}
                </div>)}
                {invModal.type==="recall"&&(<div style={{display:"flex",flexWrap:"wrap",gap:"0 4%"}}>
                  <div style={{width:"100%",background:"#fff5f5",border:"1.5px solid #fca5a5",borderRadius:9,padding:"12px 16px",marginBottom:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#991b1b",marginBottom:4}}>⚠️ Recall Notice</div>
                    <div style={{fontSize:11,color:"#7f1d1d"}}>Issuing a recall will immediately quarantine all stock in the specified batch. Recalled items are removed from {invMode} dispensing and cannot be issued until the recall is resolved.</div>
                  </div>
                  <FL2 label="Batch / Lot No. *" half ch={<input value={invForm.recallBatchNo||""} onChange={e=>setInvForm(p=>({...p,recallBatchNo:e.target.value}))} style={SS2} placeholder="e.g. BP2025001" />} />
                  <FL2 label="Item (auto-detected)" half ch={<input value={(()=>{ const it=invItems.find(i=>i.batches?.some(b=>b.batchNo===invForm.recallBatchNo)); return it?it.name:"Enter batch no. above…"; })()} disabled style={{...SS2,background:"#f8fafc",color:"#475569"}} />} />
                  <FL2 label="Recall Reason *" ch={<textarea value={invForm.recallReason||""} onChange={e=>setInvForm(p=>({...p,recallReason:e.target.value}))} style={{...SS2,minHeight:80,resize:"vertical"}} placeholder="Describe the reason for recall (e.g. contamination, substandard quality, wrong labelling)…" />} />
                  <FL2 label="Recalled By *" half ch={<input value={invForm.recalledBy||""} onChange={e=>setInvForm(p=>({...p,recalledBy:e.target.value}))} style={SS2} placeholder="Pharmacy Manager / QA Officer" />} />
                  <FL2 label="Recall Date" half ch={<input type="date" value={invForm.recallDate||new Date().toISOString().split("T")[0]} onChange={e=>setInvForm(p=>({...p,recallDate:e.target.value}))} style={SS2} />} />
                </div>)}
                {invErr&&<div style={{color:"#dc2626",fontSize:12,marginTop:8,padding:"8px 12px",background:"#fef2f2",borderRadius:7}}>{invErr}</div>}
              </div>
              <div style={{padding:"12px 22px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:10}}>
                <button onClick={()=>{setInvModal(null);setInvForm({});setInvErr("");}} style={BtnGhost}>Cancel</button>
                <button onClick={invModal.type==="stock-in"?handleStockIn:invModal.type==="stock-out"?handleStockOut:invModal.type==="recall"?handleRecall:handleAddItem}
                  style={{padding:"9px 24px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:"#fff",background:invModal.type==="recall"?"#dc2626":invModal.type==="stock-in"?"#166534":invModal.type==="stock-out"?"#dc2626":"#0e7490"}}>
                  {invModal.type==="stock-in"?"Confirm Stock In":invModal.type==="stock-out"?"Confirm Issue":invModal.type==="recall"?"🚨 Issue Recall":"Add Item"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BATCHES MODAL ──────────────────────────────────────────────── */}
        {invModal?.type==="batches"&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setInvModal(null)}>
            <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:720,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
              <div style={{background:"linear-gradient(135deg,#0e7490,#0369a1)",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:16,fontWeight:800,color:"#fff"}}>Batch Register — {invMode}</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>{invModal.item.name} · {activeBatches(invModal.item).length} active batch(es)</div></div>
                <button onClick={()=>setInvModal(null)} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:7,padding:"6px 10px",cursor:"pointer",color:"#fff",fontSize:16}}>✕</button>
              </div>
              <div style={{overflowY:"auto",flex:1,padding:20}}>
                <div style={{fontSize:11,fontWeight:700,color:invMode==="FEFO"?"#166534":"#0369a1",marginBottom:10}}>Batches sorted by {invMode==="FEFO"?"Nearest Expiry (FEFO)":"Receipt Date (FIFO)"} — top batch will be issued first:</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#f8fafc"}}>{["Priority","Batch No.","Qty Available","Received","Expiry","Unit Cost","Status"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:9,fontWeight:700,color:"#94a3b8",fontFamily:"monospace",letterSpacing:.8,borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(()=>{
                      const sorted = sortedBatches(invModal.item, invMode);
                      const allBatches = invModal.item.batches||[];
                      const recalled = allBatches.filter(b=>b.recalled);
                      return [...sorted.map((b,i)=>(
                        <tr key={b.batchNo} style={{borderBottom:"1px solid #f1f5f9",background:i===0?"#f0fdf4":"#fff"}}>
                          <td style={{padding:"10px 12px"}}><span style={{background:i===0?"#166534":"#f1f5f9",color:i===0?"#fff":"#64748b",borderRadius:"50%",width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800}}>{i+1}</span></td>
                          <td style={{padding:"10px 12px",fontSize:12,fontWeight:700,fontFamily:"monospace",color:"#0b1929"}}>{b.batchNo}</td>
                          <td style={{padding:"10px 12px",fontSize:13,fontWeight:800,fontFamily:"monospace",color:"#0e7490"}}>{b.qty}</td>
                          <td style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace",color:"#475569"}}>{fmtDate(b.receivedAt)}</td>
                          <td style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace",color:b.expiryDate&&new Date(b.expiryDate)<today?"#dc2626":b.expiryDate&&new Date(b.expiryDate)<=in90?"#d97706":"#475569",fontWeight:b.expiryDate&&new Date(b.expiryDate)<=in90?700:400}}>{fmtDate(b.expiryDate)}</td>
                          <td style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace",color:"#64748b"}}>KES {b.unitCost?.toLocaleString()||"—"}</td>
                          <td style={{padding:"10px 12px"}}>{i===0?<span style={{background:"#dcfce7",color:"#166534",borderRadius:6,padding:"2px 9px",fontSize:10,fontWeight:700}}>▶ Issue Next</span>:<span style={{background:"#f1f5f9",color:"#64748b",borderRadius:6,padding:"2px 9px",fontSize:10}}>Queued</span>}</td>
                        </tr>
                      )), ...recalled.map(b=>(
                        <tr key={b.batchNo} style={{borderBottom:"1px solid #f1f5f9",background:"#fff5f5",opacity:.7}}>
                          <td style={{padding:"10px 12px"}}><span style={{background:"#fee2e2",color:"#dc2626",borderRadius:"50%",width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🚨</span></td>
                          <td style={{padding:"10px 12px",fontSize:12,fontWeight:700,fontFamily:"monospace",color:"#991b1b"}}>{b.batchNo}</td>
                          <td style={{padding:"10px 12px",fontSize:13,fontWeight:800,fontFamily:"monospace",color:"#dc2626"}}>{b.qty} <span style={{fontSize:9,color:"#dc2626"}}>(quarantined)</span></td>
                          <td style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace",color:"#94a3b8"}}>{fmtDate(b.receivedAt)}</td>
                          <td style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace",color:"#94a3b8"}}>{fmtDate(b.expiryDate)}</td>
                          <td style={{padding:"10px 12px",fontSize:11,fontFamily:"monospace",color:"#94a3b8"}}>KES {b.unitCost?.toLocaleString()||"—"}</td>
                          <td style={{padding:"10px 12px"}}><span style={{background:"#fee2e2",color:"#991b1b",borderRadius:6,padding:"2px 9px",fontSize:10,fontWeight:700}}>🚨 Recalled</span></td>
                        </tr>
                      ))];
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY MODAL ──────────────────────────────────────────────── */}
        {invModal?.type==="history"&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setInvModal(null)}>
            <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:720,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
              <div style={{background:"linear-gradient(135deg,#0e7490,#0369a1)",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:16,fontWeight:800,color:"#fff"}}>Transaction History</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>{invModal.item.name} · Stock: {getStock(invModal.item)} {invModal.item.unit}</div></div>
                <button onClick={()=>setInvModal(null)} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:7,padding:"6px 10px",cursor:"pointer",color:"#fff",fontSize:16}}>✕</button>
              </div>
              <div style={{overflowY:"auto",flex:1,padding:20}}>
                {(()=>{
                  const txns=[...invTxns].filter(tx=>tx.itemId===invModal.item.id).reverse();
                  if(!txns.length) return <div style={{textAlign:"center",padding:"40px",color:"#94a3b8"}}>No transactions recorded.</div>;
                  return <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr style={{background:"#f8fafc"}}>{["Date","Type","Qty","Batch","Dept","Reference","By","Notes"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:9,fontWeight:700,color:"#94a3b8",fontFamily:"monospace",letterSpacing:.8,borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {txns.map(tx=>{
                        const isRecall=tx.type==="recall";
                        return (
                          <tr key={tx.id} style={{borderBottom:"1px solid #f1f5f9",background:isRecall?"#fff5f5":"#fff"}}>
                            <td style={{padding:"9px 10px",fontSize:11,color:"#64748b",fontFamily:"monospace"}}>{fmtDate(tx.date)}</td>
                            <td style={{padding:"9px 10px"}}><span style={{padding:"2px 7px",borderRadius:5,fontSize:10,fontWeight:700,color:isRecall?"#991b1b":tx.type==="in"?"#166534":"#991b1b",background:isRecall?"#fee2e2":tx.type==="in"?"#dcfce7":"#fee2e2"}}>{isRecall?"🚨":tx.type==="in"?"▼":"▲"} {tx.type.toUpperCase()}</span></td>
                            <td style={{padding:"9px 10px",fontSize:13,fontWeight:800,fontFamily:"monospace",color:isRecall?"#991b1b":tx.type==="in"?"#166534":"#991b1b"}}>{tx.type==="in"?"+":"-"}{tx.qty}</td>
                            <td style={{padding:"9px 10px",fontSize:10,color:"#94a3b8",fontFamily:"monospace"}}>{tx.batchNo||"—"}</td>
                            <td style={{padding:"9px 10px",fontSize:11,color:"#475569"}}>{tx.department||"—"}</td>
                            <td style={{padding:"9px 10px",fontSize:11,fontFamily:"monospace",color:"#64748b"}}>{tx.reference||"—"}</td>
                            <td style={{padding:"9px 10px",fontSize:11,color:"#475569"}}>{tx.performedBy}</td>
                            <td style={{padding:"9px 10px",fontSize:11,color:"#64748b"}}>{tx.notes||"—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>;
                })()}
              </div>
            </div>
          </div>
        )}
        {/* ── RECALL PATIENT LIST MODAL ──────────────────────────────────── */}
        {invRecallModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:9100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setInvRecallModal(null)}>
            <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:780,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
              {/* Header */}
              <div style={{background:"linear-gradient(135deg,#7f1d1d,#b91c1c)",padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <span style={{background:"rgba(255,255,255,.2)",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:800,color:"#fff"}}>🚨 {invRecallModal.recall.id}</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.65)",fontFamily:"monospace"}}>Batch {invRecallModal.recall.batchNo}</span>
                  </div>
                  <div style={{fontSize:17,fontWeight:800,color:"#fff"}}>{invRecallModal.recall.itemName} — Patients Issued</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.65)",marginTop:2}}>
                    {invRecallModal.patients.length} patient{invRecallModal.patients.length!==1?"s":""} received {invRecallModal.keyword.charAt(0).toUpperCase()+invRecallModal.keyword.slice(1)} · Recall date: {fmtDate(invRecallModal.recall.recalledAt)}
                  </div>
                </div>
                <button onClick={()=>setInvRecallModal(null)} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:7,padding:"7px 11px",cursor:"pointer",color:"#fff",fontSize:16,flexShrink:0}}>✕</button>
              </div>
              {/* Recall reason strip */}
              <div style={{background:"#fff5f5",borderBottom:"1px solid #fca5a5",padding:"10px 22px",fontSize:12,color:"#7f1d1d"}}>
                <strong>Recall reason:</strong> {invRecallModal.recall.reason}
              </div>
              {/* Action bar */}
              <div style={{padding:"10px 22px",borderBottom:"1px solid #f1f5f9",background:"#fafafa",display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:12,color:"#475569",flex:1}}>Contact each patient to retrieve unused medication and advise them on the recall.</div>
                <button onClick={()=>{
                  const rows = invRecallModal.patients.map(p=>`<tr><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${p.mrn}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-weight:600">${p.patientName}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;font-family:monospace">${p.rxNo||"-"}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${p.drugName} ${p.dose}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${p.dispensedAt?new Date(p.dispensedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"-"}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0">${p.dispensedBy||"-"}</td><td style="padding:7px 10px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-weight:700">PENDING CONTACT</td></tr>`).join("");
                  const html=`<!DOCTYPE html><html><head><title>Recall Patient List</title><style>body{font-family:'Palatino Linotype',serif;margin:40px;color:#1e293b}table{width:100%;border-collapse:collapse}th{background:#fee2e2;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#991b1b}@media print{button{display:none}}</style></head><body><div style="border-bottom:3px solid #b91c1c;padding-bottom:12px;margin-bottom:16px"><h2 style="margin:0;color:#7f1d1d">🚨 MediCore HMS — Recall Patient List</h2><div style="font-size:12px;color:#64748b;margin-top:4px">Recall: ${invRecallModal.recall.id} · Item: ${invRecallModal.recall.itemName} · Batch: ${invRecallModal.recall.batchNo}</div><div style="font-size:12px;color:#7f1d1d;margin-top:2px">Reason: ${invRecallModal.recall.reason}</div><div style="font-size:11px;color:#64748b;margin-top:4px">Generated: ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})}</div></div><table><thead><tr><th>MRN</th><th>Patient Name</th><th>Rx No.</th><th>Drug / Dose</th><th>Dispensed</th><th>By</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
                  const w=window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
                }} style={{padding:"7px 16px",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#fff",background:"#dc2626",flexShrink:0}}>🖨 Print List</button>
              </div>
              {/* Patient table */}
              <div style={{overflowY:"auto",flex:1}}>
                {invRecallModal.patients.length===0
                  ? <div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:36,marginBottom:10}}>✅</div><div style={{fontSize:14,fontWeight:700,color:"#475569"}}>No dispensing records found for this batch.</div><div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>No patients in the system received this drug from batch {invRecallModal.recall.batchNo}.</div></div>
                  : <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{background:"#fef2f2",position:"sticky",top:0}}>
                          {["#","Patient Name","MRN","Rx No.","Drug / Dose","Date Dispensed","Dispensed By","Notes"].map(h=>(
                            <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:700,color:"#991b1b",fontFamily:"monospace",letterSpacing:.8,borderBottom:"2px solid #fca5a5"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {invRecallModal.patients.map((p,i)=>(
                          <tr key={p.id} style={{borderBottom:"1px solid #fef2f2",background:i%2===0?"#fff":"#fffafa"}}>
                            <td style={{padding:"11px 14px",fontSize:11,fontFamily:"monospace",color:"#94a3b8",fontWeight:700}}>{i+1}</td>
                            <td style={{padding:"11px 14px"}}>
                              <div style={{fontSize:13,fontWeight:700,color:"#0b1929"}}>{p.patientName}</div>
                              <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{p.queueNo||""}</div>
                            </td>
                            <td style={{padding:"11px 14px",fontSize:11,fontFamily:"monospace",color:"#475569"}}>{p.mrn||"-"}</td>
                            <td style={{padding:"11px 14px",fontSize:11,fontFamily:"monospace",color:"#0e7490",fontWeight:700}}>{p.rxNo||"-"}</td>
                            <td style={{padding:"11px 14px"}}>
                              <div style={{fontSize:12,fontWeight:700,color:"#0b1929"}}>{p.drugName}</div>
                              <div style={{fontSize:10,color:"#64748b"}}>{p.dose}{p.route?" · "+p.route:""}</div>
                            </td>
                            <td style={{padding:"11px 14px",fontSize:11,fontFamily:"monospace",color:"#475569"}}>{p.dispensedAt?new Date(p.dispensedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"-"}</td>
                            <td style={{padding:"11px 14px",fontSize:11,color:"#475569"}}>{p.dispensedBy||"-"}</td>
                            <td style={{padding:"11px 14px",fontSize:11,color:"#64748b",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.notes||"-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
              {/* Footer */}
              <div style={{padding:"12px 22px",borderTop:"1px solid #e2e8f0",background:"#fafafa",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:11,color:"#94a3b8"}}>{invRecallModal.patients.length} record{invRecallModal.patients.length!==1?"s":""} · Matched on drug name containing <strong>{invRecallModal.keyword}</strong></div>
                <button onClick={()=>setInvRecallModal(null)} style={{padding:"8px 20px",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:"#475569",background:"#fff"}}>Close</button>
              </div>
            </div>
          </div>
        )}

      </Layout>
    );



  // ============================================================
  // PROCUREMENT PAGE
  // ============================================================

}
