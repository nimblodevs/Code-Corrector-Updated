import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function TransfersPage(props) {
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


    const TF_FACILITIES = [
      { id:"main-pharma", name:"Main Pharmacy" },
      { id:"ward-a",      name:"Ward A Store" },
      { id:"ward-b",      name:"Ward B Store" },
      { id:"ward-c",      name:"Ward C Store" },
      { id:"lab-store",   name:"Laboratory Store" },
      { id:"emergency",   name:"Emergency Store" },
      { id:"theatre",     name:"Theatre Store" },
    ];
    const tfFmtDate = (d) => d?new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—";
    const tfActiveBatches = (item) => (item.batches||[]).filter(b=>!b.recalled&&b.qty>0);
    const tfGetStock      = (item) => tfActiveBatches(item).reduce((s,b)=>s+b.qty,0);
    const getFefo = (itemId) => {
      const it = invItems.find(x=>(x.id||x.itemId)===itemId);
      if (!it) return [];
      return [...tfActiveBatches(it)].sort((a,b)=>(a.expiryDate||"9999")>(b.expiryDate||"9999")?1:-1);
    };
    const TF_STATUS_LABELS = { pending:"Pending", approved:"Approved", in_transit:"In Transit", received:"Received", cancelled:"Cancelled" };
    const TF_STATUS_COLORS = {
      pending:    { color:"#92400e", bg:"#fef3c7" },
      approved:   { color:"#1d4ed8", bg:"#dbeafe" },
      in_transit: { color:"#6d28d9", bg:"#ede9fe" },
      received:   { color:"#166534", bg:"#dcfce7" },
      cancelled:  { color:"#991b1b", bg:"#fee2e2" },
    };
    const tfFiltered = transfers.filter(t=>{
      if (!tfSearch.trim()) return true;
      const q = tfSearch.toLowerCase();
      return t.id.toLowerCase().includes(q)||
        (t.itemName||"").toLowerCase().includes(q)||
        (t.fromFacilityName||"").toLowerCase().includes(q)||
        (t.toFacilityName||"").toLowerCase().includes(q);
    });
    const submitTransfer = () => {
      setTfErr("");
      const { fromFacility, toFacility, itemId, batchNo, qty, reason, transferredBy } = tfForm;
      if (!fromFacility)           { setTfErr("Select source facility."); return; }
      if (!toFacility)             { setTfErr("Select destination facility."); return; }
      if (fromFacility===toFacility){ setTfErr("Source and destination must differ."); return; }
      if (!itemId)                 { setTfErr("Select an item."); return; }
      if (!qty||isNaN(qty)||Number(qty)<=0){ setTfErr("Enter a valid quantity."); return; }
      if (!transferredBy?.trim())  { setTfErr("Transferred by is required."); return; }
      const item = invItems.find(x=>(x.id||x.itemId)===itemId);
      const stock = item ? tfGetStock(item) : 0;
      if (Number(qty)>stock) { setTfErr(`Only ${stock} units available in stock.`); return; }
      const fefo = getFefo(itemId);
      const autoBatch = batchNo||(fefo[0]?.batchNo||"");
      const tfId = "TRF-"+String(transfers.length+1).padStart(4,"0");
      const newTf = {
        id:tfId, itemId, itemName:item?.name||"Unknown", batchNo:autoBatch,
        qty:Number(qty), fromFacility, toFacility,
        fromFacilityName:TF_FACILITIES.find(f=>f.id===fromFacility)?.name||fromFacility,
        toFacilityName:TF_FACILITIES.find(f=>f.id===toFacility)?.name||toFacility,
        status:"pending", reason:reason||"", transferredBy:transferredBy||"",
        createdAt:new Date().toISOString(),
        history:[{ action:"created", by:transferredBy, at:new Date().toISOString(), note:"Transfer initiated" }]
      };
      setTransfers(prev=>[...prev,newTf]);
      setTfModal(null); setTfForm({}); setTfErr("");
    };
    const advanceStatus = (tfId, nextStatus) => {
      setTransfers(prev=>prev.map(t=>{
        if (t.id!==tfId) return t;
        const noteMap = { approved:"Transfer approved", in_transit:"Dispatched — in transit", received:"Transfer received & verified", cancelled:"Transfer cancelled" };
        const entry = { action:nextStatus, by:"Admin User", at:new Date().toISOString(), note:noteMap[nextStatus]||"Status updated" };
        if (nextStatus==="received") {
          setInvItems(prev2=>prev2.map(it=>{
            if ((it.id||it.itemId)!==t.itemId) return it;
            let rem = t.qty;
            const fefoSorted = [...tfActiveBatches(it)].sort((a,b)=>(a.expiryDate||"9999")>(b.expiryDate||"9999")?1:-1);
            const newBatches = it.batches.map(b=>{
              if (rem<=0||b.recalled) return b;
              const isBatch = t.batchNo ? b.batchNo===t.batchNo : fefoSorted[0]?.batchNo===b.batchNo;
              if (!isBatch) return b;
              const take = Math.min(b.qty, rem); rem -= take;
              return { ...b, qty:b.qty-take };
            });
            return { ...it, batches:newBatches };
          }));
          setInvTxns(prev2=>[...prev2,{ id:"TXN-TRF-"+tfId, type:"out", itemId:t.itemId, qty:t.qty, batchNo:t.batchNo, date:new Date().toISOString().split("T")[0], reference:tfId, department:t.fromFacilityName, notes:`Transfer to ${t.toFacilityName}`, performedBy:"Admin User" }]);
        }
        return { ...t, status:nextStatus, history:[...t.history, entry] };
      }));
    };
    const printTransfer = (tf) => {
      const win = window.open("","_blank","width=700,height=900");
      if (!win) return;
      win.document.write(`<html><head><title>Transfer ${tf.id}</title><style>
        body{font-family:Arial,sans-serif;padding:32px;color:#111;}h1{font-size:20px;margin-bottom:4px;}
        .sub{font-size:12px;color:#666;margin-bottom:24px;}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
        .field{padding:10px;background:#f8fafc;border-radius:6px;}.field label{font-size:10px;color:#888;display:block;text-transform:uppercase;letter-spacing:.6px;}
        .field span{font-size:13px;font-weight:600;}table{width:100%;border-collapse:collapse;margin-top:16px;}
        th,td{padding:9px 12px;border:1px solid #ddd;font-size:12px;}th{background:#f1f5f9;font-weight:700;}
        .sig{margin-top:60px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;}
        .sig div{border-top:1px solid #999;padding-top:8px;font-size:12px;color:#555;}
        @media print{body{padding:16px;}}
      </style></head><body>
        <h1>🔄 BATCH TRANSFER DOCUMENT</h1>
        <div class="sub">MediCore HMS · Transfer ID: <b>${tf.id}</b> · ${new Date().toLocaleString("en-GB")}</div>
        <div class="grid">
          <div class="field"><label>From</label><span>${tf.fromFacilityName}</span></div>
          <div class="field"><label>To</label><span>${tf.toFacilityName}</span></div>
          <div class="field"><label>Item</label><span>${tf.itemName}</span></div>
          <div class="field"><label>Batch No.</label><span>${tf.batchNo||"—"}</span></div>
          <div class="field"><label>Quantity</label><span>${tf.qty}</span></div>
          <div class="field"><label>Status</label><span>${TF_STATUS_LABELS[tf.status]||tf.status}</span></div>
          <div class="field"><label>Transferred By</label><span>${tf.transferredBy}</span></div>
          <div class="field"><label>Date</label><span>${new Date(tf.createdAt).toLocaleDateString("en-GB")}</span></div>
          <div class="field" style="grid-column:span 2"><label>Reason</label><span>${tf.reason||"Not specified"}</span></div>
        </div>
        <table><thead><tr><th>#</th><th>Action</th><th>By</th><th>Date / Time</th><th>Note</th></tr></thead><tbody>
          ${(tf.history||[]).map((h,i)=>`<tr><td>${i+1}</td><td>${TF_STATUS_LABELS[h.action]||h.action}</td><td>${h.by}</td><td>${new Date(h.at).toLocaleString("en-GB")}</td><td>${h.note}</td></tr>`).join("")}
        </tbody></table>
        <div class="sig"><div>Transferred By<br><b>${tf.transferredBy}</b></div><div>Received By<br>&nbsp;</div><div>Verified By<br>&nbsp;</div></div>
        <script>window.onload=()=>window.print();</script>
      </body></html>`);
      win.document.close();
    };
    return (
      <Layout page={page} setPage={setPage} patients={patients} overlay={ToastModal}>
        <TopBar
          title="Batch Transfers"
          sub="Inter-facility stock movement · FEFO-compliant · Chain of custody tracking"
          action={<button onClick={()=>{ setTfForm({}); setTfErr(""); setTfModal("new"); }} style={BtnPrimary}>+ New Transfer</button>}
        />
        <div style={{ padding:"0 24px 32px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
            {[
              { label:"Total Transfers",  val:transfers.length, icon:"🔄", color:"#0ea5e9", bg:"#f0f9ff" },
              { label:"Pending Approval", val:transfers.filter(t=>t.status==="pending").length, icon:"⏳", color:"#92400e", bg:"#fef3c7" },
              { label:"In Transit",       val:transfers.filter(t=>t.status==="in_transit").length, icon:"🚚", color:"#6d28d9", bg:"#ede9fe" },
              { label:"Completed",        val:transfers.filter(t=>t.status==="received").length, icon:"✅", color:"#166534", bg:"#dcfce7" },
            ].map((s,i)=>(
              <div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}>
                <div style={{ width:42,height:42,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:26,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
            <div style={{ padding:"14px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10 }}>
              <input value={tfSearch} onChange={e=>setTfSearch(e.target.value)}
                placeholder="Search transfers by ID, item, or facility…"
                style={{ flex:1,padding:"7px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none" }} />
              <span style={{ fontSize:11,color:"#94a3b8" }}>{tfFiltered.length} records</span>
            </div>
            {transfers.length===0 ? (
              <div style={{ textAlign:"center",padding:"60px 24px",color:"#94a3b8" }}>
                <div style={{ fontSize:40,marginBottom:12 }}>🔄</div>
                <div style={{ fontSize:14,fontWeight:600,color:"#64748b",marginBottom:6 }}>No transfers yet</div>
                <div style={{ fontSize:12 }}>Click "+ New Transfer" to create your first inter-facility stock transfer</div>
              </div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",minWidth:900 }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["Transfer ID","Item","Batch","Qty","From","To","Status","Date","Actions"].map(h=>(
                        <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tfFiltered.map((tf,i)=>{
                      const sc = TF_STATUS_COLORS[tf.status]||{ color:"#475569",bg:"#f1f5f9" };
                      return (
                        <tr key={tf.id} style={{ borderBottom:"1px solid #f1f5f9" }}
                          onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"10px 14px",fontSize:12,fontFamily:"monospace",fontWeight:700,color:"#6366f1" }}>{tf.id}</td>
                          <td style={{ padding:"10px 14px",fontSize:12,fontWeight:600,color:"#0b1929" }}>{tf.itemName}</td>
                          <td style={{ padding:"10px 14px",fontSize:11,color:"#64748b",fontFamily:"monospace" }}>{tf.batchNo||"—"}</td>
                          <td style={{ padding:"10px 14px",fontSize:13,fontWeight:700,color:"#0b1929" }}>{tf.qty}</td>
                          <td style={{ padding:"10px 14px",fontSize:11,color:"#475569" }}>{tf.fromFacilityName}</td>
                          <td style={{ padding:"10px 14px",fontSize:11,color:"#475569" }}>{tf.toFacilityName}</td>
                          <td style={{ padding:"10px 14px" }}>
                            <span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:sc.bg,color:sc.color }}>{TF_STATUS_LABELS[tf.status]||tf.status}</span>
                          </td>
                          <td style={{ padding:"10px 14px",fontSize:11,color:"#94a3b8" }}>{tfFmtDate(tf.createdAt)}</td>
                          <td style={{ padding:"10px 14px" }}>
                            <div style={{ display:"flex",gap:4 }}>
                              {tf.status==="pending" && (
                                <button onClick={()=>advanceStatus(tf.id,"approved")}
                                  style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,background:"#dbeafe",color:"#1d4ed8" }}>Approve</button>
                              )}
                              {tf.status==="approved" && (
                                <button onClick={()=>advanceStatus(tf.id,"in_transit")}
                                  style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,background:"#ede9fe",color:"#6d28d9" }}>Dispatch</button>
                              )}
                              {tf.status==="in_transit" && (
                                <button onClick={()=>advanceStatus(tf.id,"received")}
                                  style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,background:"#dcfce7",color:"#166534" }}>Receive</button>
                              )}
                              {["pending","approved"].includes(tf.status) && (
                                <button onClick={()=>{ if(window.confirm(`Cancel ${tf.id}?`)) advanceStatus(tf.id,"cancelled"); }}
                                  style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,background:"#fee2e2",color:"#dc2626" }}>Cancel</button>
                              )}
                              <button onClick={()=>{ setTfDetail(tf); setTfModal("detail"); }}
                                style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:600,background:"#f1f5f9",color:"#475569" }}>View</button>
                              <button onClick={()=>printTransfer(tf)}
                                style={{ padding:"4px 9px",border:"none",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:600,background:"#f1f5f9",color:"#475569" }}>🖨</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* New Transfer Modal */}
        {tfModal==="new" && (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999 }}>
            <div style={{ background:"#fff",borderRadius:18,width:"100%",maxWidth:540,boxShadow:"0 24px 80px rgba(0,0,0,.28)",overflow:"hidden" }}>
              <div style={{ background:"linear-gradient(135deg,#0b1929,#0d2137)",padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:15,fontWeight:800,color:"#fff" }}>🔄 New Batch Transfer</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.5)",marginTop:2 }}>Inter-facility stock movement · FEFO priority</div>
                </div>
                <button onClick={()=>{ setTfModal(null); setTfErr(""); }} style={{ background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:22,lineHeight:1 }}>×</button>
              </div>
              <div style={{ padding:"22px 24px" }}>
                {tfErr && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"9px 14px",borderRadius:8,fontSize:12,marginBottom:14,fontWeight:600 }}>{tfErr}</div>}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>From Facility *</label>
                    <select value={tfForm.fromFacility||""} onChange={e=>setTfForm(p=>({...p,fromFacility:e.target.value}))}
                      style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",background:"#fff" }}>
                      <option value="">Select source…</option>
                      {TF_FACILITIES.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>To Facility *</label>
                    <select value={tfForm.toFacility||""} onChange={e=>setTfForm(p=>({...p,toFacility:e.target.value}))}
                      style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",background:"#fff" }}>
                      <option value="">Select destination…</option>
                      {TF_FACILITIES.filter(f=>f.id!==tfForm.fromFacility).map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Item *</label>
                  <select value={tfForm.itemId||""} onChange={e=>setTfForm(p=>({...p,itemId:e.target.value,batchNo:""}))}
                    style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",background:"#fff" }}>
                    <option value="">Select item…</option>
                    {invItems.filter(it=>tfGetStock(it)>0).map(it=>(
                      <option key={it.id||it.itemId} value={it.id||it.itemId}>{it.name} (Stock: {tfGetStock(it)} {it.unit})</option>
                    ))}
                  </select>
                </div>
                {tfForm.itemId && (() => {
                  const fefo = getFefo(tfForm.itemId);
                  return fefo.length>0 ? (
                    <div style={{ marginBottom:14 }}>
                      <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Batch (FEFO — earliest expiry first)</label>
                      <select value={tfForm.batchNo||""} onChange={e=>setTfForm(p=>({...p,batchNo:e.target.value}))}
                        style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",background:"#fff" }}>
                        <option value="">Auto-select FEFO: {fefo[0]?.batchNo}</option>
                        {fefo.map(b=>(
                          <option key={b.batchNo} value={b.batchNo}>{b.batchNo} · {b.qty} units{b.expiryDate?` · Exp: ${b.expiryDate}`:""}</option>
                        ))}
                      </select>
                    </div>
                  ) : null;
                })()}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Quantity *</label>
                    <input type="number" min="1" value={tfForm.qty||""} onChange={e=>setTfForm(p=>({...p,qty:e.target.value}))}
                      style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Transferred By *</label>
                    <input value={tfForm.transferredBy||""} onChange={e=>setTfForm(p=>({...p,transferredBy:e.target.value}))} placeholder="Staff name"
                      style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
                  </div>
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:11,fontWeight:700,color:"#475569",display:"block",marginBottom:5 }}>Reason / Notes</label>
                  <textarea value={tfForm.reason||""} onChange={e=>setTfForm(p=>({...p,reason:e.target.value}))} rows={2} placeholder="Reason for transfer…"
                    style={{ width:"100%",padding:"9px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box" }} />
                </div>
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={submitTransfer} style={{ flex:1,padding:"11px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,background:"#0b1929",color:"#00e5ff" }}>Create Transfer</button>
                  <button onClick={()=>{ setTfModal(null); setTfErr(""); }} style={{ padding:"11px 20px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:13,background:"#fff",color:"#475569" }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail / Chain of Custody Modal */}
        {tfModal==="detail" && tfDetail && (() => {
          const tf = transfers.find(t=>t.id===tfDetail.id)||tfDetail;
          const sc = TF_STATUS_COLORS[tf.status]||{ color:"#475569",bg:"#f1f5f9" };
          return (
            <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999 }}>
              <div style={{ background:"#fff",borderRadius:18,width:"100%",maxWidth:540,boxShadow:"0 24px 80px rgba(0,0,0,.28)",overflow:"hidden",maxHeight:"90vh",display:"flex",flexDirection:"column" }}>
                <div style={{ background:"linear-gradient(135deg,#0b1929,#0d2137)",padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
                  <div>
                    <div style={{ fontSize:15,fontWeight:800,color:"#fff" }}>Transfer {tf.id}</div>
                    <div style={{ fontSize:11,color:"rgba(255,255,255,.5)",marginTop:2 }}>{tf.itemName}</div>
                  </div>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <span style={{ fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:sc.bg,color:sc.color }}>{TF_STATUS_LABELS[tf.status]}</span>
                    <button onClick={()=>{ setTfModal(null); setTfDetail(null); }} style={{ background:"none",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:22 }}>×</button>
                  </div>
                </div>
                <div style={{ overflowY:"auto",padding:"20px 24px" }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 }}>
                    {[
                      { label:"From",           val:tf.fromFacilityName },
                      { label:"To",             val:tf.toFacilityName },
                      { label:"Item",           val:tf.itemName },
                      { label:"Batch No.",      val:tf.batchNo||"—" },
                      { label:"Quantity",       val:tf.qty },
                      { label:"Transferred By", val:tf.transferredBy },
                      { label:"Date Created",   val:tfFmtDate(tf.createdAt) },
                      { label:"Reason",         val:tf.reason||"—" },
                    ].map((f,i)=>(
                      <div key={i} style={{ padding:"10px 12px",background:"#f8fafc",borderRadius:8 }}>
                        <div style={{ fontSize:9,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.8,marginBottom:3 }}>{f.label}</div>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0b1929" }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:12,fontWeight:700,color:"#0b1929",marginBottom:10 }}>Chain of Custody</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:18 }}>
                    {(tf.history||[]).map((h,i)=>(
                      <div key={i} style={{ display:"flex",gap:10,padding:"10px 12px",background:i===tf.history.length-1?"#f0fdf4":"#f8fafc",borderRadius:9,borderLeft:`3px solid ${i===tf.history.length-1?"#22c55e":"#cbd5e1"}` }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12,fontWeight:700,color:"#0b1929" }}>{TF_STATUS_LABELS[h.action]||h.action} <span style={{ fontSize:10,fontWeight:400,color:"#64748b" }}>by {h.by}</span></div>
                          <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>{h.note} · {new Date(h.at).toLocaleString("en-GB")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>printTransfer(tf)} style={{ flex:1,padding:"10px",border:"none",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,background:"#0b1929",color:"#00e5ff" }}>🖨 Print Document</button>
                    <button onClick={()=>{ setTfModal(null); setTfDetail(null); }} style={{ padding:"10px 18px",border:"1.5px solid #e2e8f0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,color:"#475569",background:"#fff" }}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Layout>
    );


  // ============================================================
  // EXPIRY MANAGEMENT PAGE
  // ============================================================

}
