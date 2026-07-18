import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function QueuePage(props) {
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

  return (
    <Layout page={page} setPage={p=>{if(p!=="register"){setActive(null);setPage(p);}}} patients={patients} overlay={ToastModal}>
      <TopBar title="Patient Queue"
        subtitle={`${patients.length} patient${patients.length!==1?"s":""} today . ${new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}`}
        action={<button onClick={openQueue} style={BtnCyan}>🎫 Walk-in Patient</button>} />

      <div style={{ padding:"20px 26px" }}>
        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:11,marginBottom:20 }}>
          {[
            ["All","👥","#0b1929","#e2e8f0",""],
            ["Queued","🎫","#475569","#f1f5f9","Queued"],
            ["Triaged","🩺","#c2410c","#ffedd5","Triaged"],
            ["Registered","📝","#b45309","#fef9c4","Registered"],
            ["Billed","💳","#1d4ed8","#dbeafe","Billed"],
            ["Completed","[OK]","#15803d","#dcfce7","Completed"],
          ].map(([s,icon,col,bg,f])=>(
            <div key={s} onClick={()=>setFStatus(s)}
              style={{ background:"#fff",borderRadius:11,padding:"11px 13px",
                boxShadow:"0 1px 8px rgba(0,0,0,.07)",display:"flex",alignItems:"center",gap:10,
                cursor:"pointer",border:fStatus===s?`2px solid ${col}`:"2px solid transparent",transition:"all .15s" }}>
              <div style={{ width:36,height:36,background:bg,borderRadius:9,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:17 }}>{icon}</div>
              <div>
                <div style={{ fontSize:22,fontWeight:800,color:col,lineHeight:1 }}>
                  {f ? patients.filter(p=>p.status===f).length : patients.length}
                </div>
                <div style={{ fontSize:9,color:C.slateL,fontFamily:"monospace",marginTop:1,letterSpacing:.5 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div style={{ background:"#fff",borderRadius:11,padding:"11px 14px",marginBottom:14,
          display:"flex",gap:10,alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,.05)" }}>
          <div style={{ flex:1,position:"relative" }}>
            <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"#cbd5e1" }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search name, patient ID, queue no., phone..."
              style={{ width:"100%",padding:"8px 11px 8px 34px",border:"1.5px solid #e2e8f0",
                borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
          </div>
          <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
            {["All","Queued","Triaged","Registered","Billed","With Doctor","Completed"].map(s=>(
              <button key={s} onClick={()=>setFStatus(s)}
                style={{ padding:"6px 11px",borderRadius:7,fontFamily:"inherit",fontSize:11,cursor:"pointer",
                  border:fStatus===s?"2px solid #0b1929":"1.5px solid #e2e8f0",
                  background:fStatus===s?"#0b1929":"#fff",color:fStatus===s?"#fff":C.slate,fontWeight:fStatus===s?700:400 }}>{s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background:"#fff",borderRadius:13,boxShadow:"0 2px 16px rgba(0,0,0,.07)",overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",minWidth:920 }}>
              <thead>
                <tr style={{ background:"#f8fafc",borderBottom:"2px solid #e2e8f0" }}>
                  {["Queue","Patient","Phone","Category","Flow Status","Triage","Next Action",""].map(h=>(
                    <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:700,
                      color:C.slateL,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0
                  ? <tr><td colSpan={8} style={{ textAlign:"center",padding:"52px",color:"#cbd5e1",fontSize:14 }}>No patients found</td></tr>
                  : filtered.map((p,i)=>{
                    const sm  = STATUS_META[p.status]||STATUS_META.Queued;
                    const cc  = !p.category ? {bg:"#f1f5f9",c:"#94a3b8"} : p.category==="Insurance"?{bg:"#dbeafe",c:"#1d4ed8"}:p.category==="Corporate"?{bg:"#dcfce7",c:"#15803d"}:{bg:"#fef9c4",c:"#b45309"};
                    const tl  = TRIAGE_LEVELS.find(t=>t.level===p.triage?.level);
                    const hue = avatarHue(p.id||p.queueNo);

                    // What's the next logical action button?
                    const nextActions = [];
                    if (p.status==="Queued")         nextActions.push({ label:"🩺 Triage",    fn:()=>goTriage(p),   color:"#ffedd5",textColor:"#c2410c" });
                    if (p.status==="Triaged")        nextActions.push({ label:"📝 Register",  fn:()=>goRegister(p), color:"#fff9c4",textColor:"#b45309" });
                    if (p.status==="Registered")     nextActions.push({ label:"💳 Billing",   fn:()=>goBilling(p),  color:"#dbeafe",textColor:"#1d4ed8" });
                    if (p.status==="Billed")         nextActions.push({ label:"🩺 Doctor",  fn:()=>goDoctor(p),   color:"#f3e8ff",textColor:"#7e22ce" });
                    if (p.status==="Lab Pending")    nextActions.push({ label:"🧪 Lab",       fn:()=>goLab(p),      color:"#fef3c7",textColor:"#d97706" });
                    if (p.status==="With Doctor")    nextActions.push({ label:"🩺 Doctor",  fn:()=>goDoctor(p),   color:"#f3e8ff",textColor:"#7e22ce" });

                    return (
                      <tr key={p.queueNo} style={{ borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafbfd" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafbfd"}>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ fontFamily:"monospace",fontSize:17,fontWeight:900,color:"#0b1929" }}>{p.queueNo}</div>
                          <div style={{ fontSize:10,color:C.slateL,fontFamily:"monospace" }}>{p.queueTime}</div>
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                            <div style={{ width:36,height:36,borderRadius:"50%",flexShrink:0,
                              background:`hsl(${hue},50%,82%)`,color:`hsl(${hue},40%,28%)`,
                              display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700 }}>
                              {(p.name||p.firstName||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight:700,color:"#1e293b",fontSize:13 }}>{p.name||`${p.firstName} ${p.lastName}`||"-"}</div>
                              <div style={{ fontSize:10,color:C.slateL,fontFamily:"monospace" }}>{p.id||"Unregistered"}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"11px 14px",fontSize:12,fontFamily:"monospace",color:"#475569" }}>{p.phone}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <span style={{ background:cc.bg,color:cc.c,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700 }}>
                            {p.category||"Unknown"}
                          </span>
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          <Badge label={p.status} color={sm.color} bg={sm.bg} dot={sm.dot} sm />
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          {tl
                            ? <Badge label={`L${p.triage.level} ${tl.label}`} color={tl.tc} bg={tl.bg} sm />
                            : <span style={{ fontSize:11,color:"#cbd5e1" }}>-</span>}
                        </td>
                        <td style={{ padding:"11px 14px" }}>
                          {nextActions.map(a=>(
                            <button key={a.label} onClick={a.fn}
                              style={{ padding:"6px 12px",border:"none",borderRadius:7,background:a.color,color:a.textColor,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700 }}>
                              {a.label}
                            </button>
                          ))}
                          {p.status==="Completed"&&<span style={{ fontSize:12,color:"#15803d",fontWeight:700 }}>[OK] Done</span>}
                        </td>
                        <td style={{ padding:"11px 10px" }}>
                          <div style={{ display:"flex",gap:4 }}>
                            <button onClick={()=>goTriage(p)}   title="Edit Triage"   style={{ background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:12 }}>🩺</button>
                            <button onClick={()=>goRegister(p)} title="Edit Reg"      style={{ background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:12 }}></button>
                            <button onClick={()=>goBilling(p)}  title="Edit Billing"  style={{ background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:12 }}>💳</button>
                            <button onClick={()=>goDoctor(p)}   title="Doctor"        style={{ background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:12 }}>🩺</button>
                            <button onClick={()=>setDelId(p.queueNo)} title="Delete" style={{ background:"#fff1f2",border:"1px solid #fecaca",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:12 }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div style={{ padding:"8px 18px",borderTop:"1px solid #f1f5f9",color:C.slateL,fontSize:11,fontFamily:"monospace" }}>
            Showing {filtered.length} of {patients.length} patients
          </div>
        </div>
      </div>

      {/* ── KIOSK MODAL ───────────────────────────────────────────────────── */}
      {qModal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(7,24,40,.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(3px)" }}>
          <div style={{ background:"#fff",borderRadius:20,boxShadow:"0 32px 80px rgba(0,0,0,.4)",width:520,overflow:"hidden" }}>

            {/* Header */}
            <div style={{ background:"linear-gradient(135deg,#0b1929,#0f3460)",padding:"22px 28px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div style={{ fontSize:22,fontWeight:900,color:"#fff",letterSpacing:.2 }}>🏥 Patient Kiosk</div>
                <div style={{ fontSize:11,color:"rgba(255,255,255,.5)",marginTop:3,letterSpacing:.5 }}>
                  {kioskStep==="select" && "How can we help you today?"}
                  {kioskStep==="walkin-service" && "Select your destination"}
                  {kioskStep==="walkin-payment" && `Walk-in → ${(serviceLabel[kioskService]||"").toUpperCase()} — How will you pay?`}
                  {kioskStep==="walkin-form" && `Walk-in → ${(serviceLabel[kioskService]||"").toUpperCase()} — Enter your details`}
                  {kioskStep==="new-patient" && "New patient — Enter your details"}
                  {kioskStep==="existing" && "Existing patient check-in"}
                </div>
              </div>
              <button onClick={()=>setQModal(false)} style={{ background:"rgba(255,255,255,.12)",border:"none",borderRadius:10,width:36,height:36,cursor:"pointer",fontSize:18,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
            </div>

            <div style={{ padding:"24px 28px" }}>
              <ErrBox msg={qErr} />

              {/* ── STEP: SELECT ─────────────────────────────────────────── */}
              {kioskStep==="select" && (
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
                  {[
                    { emoji:"🚶", title:"Walk-in",       sub:"Pharmacy · Lab · Radiology", color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe", step:"walkin-service" },
                    { emoji:"👤", title:"New Patient",    sub:"First visit · Full queue",   color:"#0369a1", bg:"#eff6ff", border:"#bfdbfe", step:"new-patient"    },
                    { emoji:"🔄", title:"Existing Patient",sub:"Return visit · Check-in",   color:"#059669", bg:"#f0fdf4", border:"#bbf7d0", step:"existing"       },
                  ].map(opt=>(
                    <button key={opt.step} onClick={()=>setKioskStep(opt.step)}
                      style={{ border:`2px solid ${opt.border}`,borderRadius:14,padding:"22px 10px",background:opt.bg,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .15s" }}>
                      <div style={{ fontSize:36,marginBottom:10 }}>{opt.emoji}</div>
                      <div style={{ fontSize:14,fontWeight:800,color:opt.color,marginBottom:5 }}>{opt.title}</div>
                      <div style={{ fontSize:11,color:"#64748b",lineHeight:1.4 }}>{opt.sub}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* ── STEP: WALK-IN → SERVICE SELECTION ───────────────────── */}
              {kioskStep==="walkin-service" && (
                <>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:18 }}>
                    {[
                      { key:"pharmacy",  emoji:"💊", label:"Pharmacy",   sub:"Prescription pick-up",  color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
                      { key:"lab",       emoji:"🧪", label:"Laboratory", sub:"Tests & specimens",     color:"#0369a1", bg:"#eff6ff", border:"#bfdbfe" },
                      { key:"radiology", emoji:"📡", label:"Radiology",  sub:"X-ray, Scan, MRI",      color:"#b45309", bg:"#fffbeb", border:"#fde68a" },
                    ].map(s=>(
                      <button key={s.key} onClick={()=>{setKioskService(s.key);setKioskPayment(null);setKioskStep("walkin-payment");setQFirstName("");setQSurname("");setQPhone("");setQErr("");}}
                        style={{ border:`2px solid ${kioskService===s.key?s.color:s.border}`,borderRadius:14,padding:"20px 8px",background:s.bg,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .15s" }}>
                        <div style={{ fontSize:32,marginBottom:8 }}>{s.emoji}</div>
                        <div style={{ fontSize:13,fontWeight:800,color:s.color }}>{s.label}</div>
                        <div style={{ fontSize:10,color:"#64748b",marginTop:3 }}>{s.sub}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ display:"flex",justifyContent:"flex-start" }}>
                    <button onClick={()=>setKioskStep("select")} style={{ ...BtnGhost,fontSize:12 }}>← Back</button>
                  </div>
                </>
              )}

              {/* ── STEP: WALK-IN → PAYMENT METHOD ──────────────────── */}
              {kioskStep==="walkin-payment" && (
                <>
                  {/* Service context chip */}
                  {(() => {
                    const svc = { pharmacy:{emoji:"💊",color:"#7c3aed"}, lab:{emoji:"🧪",color:"#0369a1"}, radiology:{emoji:"📡",color:"#b45309"} }[kioskService]||{};
                    return (
                      <div style={{ background:"#f8fafc",borderRadius:10,padding:"9px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10,border:"1px solid #e2e8f0" }}>
                        <span style={{ fontSize:20 }}>{svc.emoji}</span>
                        <span style={{ fontSize:12,fontWeight:700,color:svc.color }}>{serviceLabel[kioskService]} Walk-in</span>
                        <span style={{ fontSize:11,color:"#94a3b8",marginLeft:"auto" }}>Select payment type</span>
                      </div>
                    );
                  })()}

                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20 }}>
                    {/* CASH card */}
                    <button onClick={()=>{setKioskPayment("cash");setKioskStep("walkin-form");}}
                      style={{ border:`2.5px solid ${kioskPayment==="cash"?"#059669":"#bbf7d0"}`,borderRadius:16,padding:"28px 16px",background:kioskPayment==="cash"?"#f0fdf4":"#f0fdf4",cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .15s",position:"relative" }}>
                      <div style={{ fontSize:42,marginBottom:10 }}>💵</div>
                      <div style={{ fontSize:16,fontWeight:900,color:"#059669",marginBottom:6 }}>Cash</div>
                      <div style={{ fontSize:11,color:"#64748b",lineHeight:1.5 }}>Pay at the<br/>service point</div>
                      <div style={{ marginTop:12,background:"#059669",color:"#fff",borderRadius:8,padding:"5px 10px",fontSize:10,fontWeight:800,letterSpacing:.5,display:"inline-block" }}>→ SERVICE POINT</div>
                    </button>

                    {/* CREDIT card */}
                    <button onClick={()=>{setKioskPayment("credit");setKioskStep("walkin-form");}}
                      style={{ border:`2.5px solid ${kioskPayment==="credit"?"#0369a1":"#bfdbfe"}`,borderRadius:16,padding:"28px 16px",background:kioskPayment==="credit"?"#eff6ff":"#eff6ff",cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .15s",position:"relative" }}>
                      <div style={{ fontSize:42,marginBottom:10 }}>💳</div>
                      <div style={{ fontSize:16,fontWeight:900,color:"#0369a1",marginBottom:6 }}>Credit / Insurance</div>
                      <div style={{ fontSize:11,color:"#64748b",lineHeight:1.5 }}>Routed to<br/>Registration desk</div>
                      <div style={{ marginTop:12,background:"#0369a1",color:"#fff",borderRadius:8,padding:"5px 10px",fontSize:10,fontWeight:800,letterSpacing:.5,display:"inline-block" }}>→ REGISTRATION</div>
                    </button>
                  </div>

                  <div style={{ display:"flex",justifyContent:"flex-start" }}>
                    <button onClick={()=>setKioskStep("walkin-service")} style={{ ...BtnGhost,fontSize:12 }}>← Back</button>
                  </div>
                </>
              )}

              {/* ── STEP: WALK-IN FORM ───────────────────────────────────── */}
              {kioskStep==="walkin-form" && (
                <>
                  {(() => {
                    const svc = { pharmacy:{emoji:"💊",color:"#7c3aed",prefix:"PH"}, lab:{emoji:"🧪",color:"#0369a1",prefix:"LB"}, radiology:{emoji:"📡",color:"#b45309",prefix:"RD"} }[kioskService]||{};
                    return (
                      <div style={{ background:"#f8fafc",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10,border:"1px solid #e2e8f0" }}>
                        <span style={{ fontSize:22 }}>{svc.emoji}</span>
                        <div>
                          <div style={{ fontSize:12,fontWeight:800,color:svc.color }}>{serviceLabel[kioskService]} Walk-in</div>
                          <div style={{ fontSize:10,color:"#64748b" }}>Ticket prefix: <strong style={{fontFamily:"monospace",color:svc.color}}>{svc.prefix}-XXX</strong></div>
                          <div style={{ fontSize:10,marginTop:3 }}>Payment: <strong style={{color:kioskPayment==="credit"?"#0369a1":"#059669"}}>{kioskPayment==="credit"?"💳 Credit / Insurance":"💵 Cash"}</strong> · Route: <strong style={{color:kioskPayment==="credit"?"#0369a1":"#059669"}}>{kioskPayment==="credit"?"Registration desk":"Service point"}</strong></div>
                        </div>
                      </div>
                    );
                  })()}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                    <div>
                      <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>First Name *</label>
                      <input value={qFirstName} onChange={e=>setQFirstName(e.target.value)} placeholder="e.g. James" style={IS(!qFirstName&&qErr)} autoFocus />
                    </div>
                    <div>
                      <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>Surname *</label>
                      <input value={qSurname} onChange={e=>setQSurname(e.target.value)} placeholder="e.g. Mwangi" style={IS(!qSurname&&qErr)} />
                    </div>
                  </div>
                  <div style={{ marginBottom:20 }}>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>Phone Number *</label>
                    <input value={qPhone} onChange={e=>setQPhone(e.target.value)} placeholder="+254-7XX-XXX-XXX" style={IS(!qPhone&&qErr)} />
                  </div>
                  <div style={{ display:"flex",gap:10,justifyContent:"space-between" }}>
                    <button onClick={()=>setKioskStep("walkin-payment")} style={{ ...BtnGhost,fontSize:12 }}>← Back</button>
                    <button onClick={saveWalkinPatient} style={BtnCyan}>[OK] Get Ticket</button>
                  </div>
                </>
              )}

              {/* ── STEP: NEW PATIENT FORM ───────────────────────────────── */}
              {kioskStep==="new-patient" && (
                <>
                  <div style={{ background:"#eff6ff",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10,border:"1px solid #bfdbfe" }}>
                    <span style={{ fontSize:22 }}>👤</span>
                    <div>
                      <div style={{ fontSize:12,fontWeight:800,color:"#0369a1" }}>New Patient Queue</div>
                      <div style={{ fontSize:10,color:"#64748b" }}>Ticket prefix: <strong style={{fontFamily:"monospace",color:"#0369a1"}}>Q-XXX</strong></div>
                    </div>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                    <div>
                      <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>First Name *</label>
                      <input value={qFirstName} onChange={e=>setQFirstName(e.target.value)} placeholder="e.g. James" style={IS(!qFirstName&&qErr)} autoFocus />
                    </div>
                    <div>
                      <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>Surname *</label>
                      <input value={qSurname} onChange={e=>setQSurname(e.target.value)} placeholder="e.g. Mwangi" style={IS(!qSurname&&qErr)} />
                    </div>
                  </div>
                  <div style={{ marginBottom:20 }}>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>Phone Number *</label>
                    <input value={qPhone} onChange={e=>setQPhone(e.target.value)} placeholder="+254-7XX-XXX-XXX" style={IS(!qPhone&&qErr)} />
                  </div>
                  <div style={{ display:"flex",gap:10,justifyContent:"space-between" }}>
                    <button onClick={()=>setKioskStep("select")} style={{ ...BtnGhost,fontSize:12 }}>← Back</button>
                    <button onClick={saveQueuePatient} style={BtnCyan}>[OK] Join Queue</button>
                  </div>
                </>
              )}

              {/* ── STEP: EXISTING PATIENT ───────────────────────────────── */}
              {kioskStep==="existing" && (
                <>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.slate,marginBottom:5,letterSpacing:.8,textTransform:"uppercase" }}>Search by Name, Phone or Patient ID</label>
                    <input value={kioskExSearch} onChange={e=>{setKioskExSearch(e.target.value);setKioskExPick(null);}}
                      placeholder="e.g. Mwangi / +254-722... / PAT-2026..." style={baseInput} autoFocus />
                  </div>
                  {kioskExSearch.trim().length>1 && (()=>{
                    const q = kioskExSearch.trim().toLowerCase();
                    const hits = patients.filter(p=>(p.name||"").toLowerCase().includes(q)||(p.phone||"").includes(q)||(p.id||"").toLowerCase().includes(q)||(p.mrn||"").toLowerCase().includes(q)).slice(0,6);
                    return (
                      <div style={{ maxHeight:220,overflowY:"auto",borderRadius:10,border:"1px solid #e2e8f0",marginBottom:14 }}>
                        {hits.length===0
                          ? <div style={{ padding:"18px",textAlign:"center",color:C.slateL,fontSize:12 }}>No patient found</div>
                          : hits.map(p=>{
                              const sel = kioskExPick?.queueNo===p.queueNo;
                              return (
                                <div key={p.queueNo} onClick={()=>setKioskExPick(p)}
                                  style={{ padding:"11px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",
                                    background:sel?"#eff6ff":"#fff",borderBottom:"1px solid #f1f5f9",
                                    borderLeft:sel?"3px solid #0369a1":"3px solid transparent" }}>
                                  <div>
                                    <div style={{ fontWeight:700,fontSize:13,color:"#0b1929" }}>{p.firstName||p.name} {p.lastName||""}</div>
                                    <div style={{ fontSize:10,color:C.slateL,fontFamily:"monospace" }}>{p.id||"Unregistered"} · {p.phone||"-"}</div>
                                  </div>
                                  <div style={{ textAlign:"right" }}>
                                    <div style={{ fontFamily:"monospace",fontWeight:700,color:"#0369a1",fontSize:11 }}>{p.queueNo}</div>
                                    <div style={{ fontSize:10,color:C.slateL }}>{p.status}</div>
                                  </div>
                                </div>
                              );
                          })
                        }
                      </div>
                    );
                  })()}
                  {kioskExPick && (
                    <div style={{ background:"#f0fdf4",borderRadius:10,padding:"12px 14px",marginBottom:16,border:"1px solid #bbf7d0",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:800,fontSize:13,color:"#166534" }}>✓ {kioskExPick.firstName||kioskExPick.name} {kioskExPick.lastName||""}</div>
                        <div style={{ fontSize:10,color:"#166534",marginTop:2 }}>Will be re-queued with EX- ticket</div>
                      </div>
                      <div style={{ fontFamily:"monospace",fontWeight:900,color:"#059669",fontSize:15 }}>
                        EX-{pad(patients.filter(p=>p.queueNo.startsWith("EX-")).length+1,3)}
                      </div>
                    </div>
                  )}
                  <div style={{ display:"flex",gap:10,justifyContent:"space-between" }}>
                    <button onClick={()=>setKioskStep("select")} style={{ ...BtnGhost,fontSize:12 }}>← Back</button>
                    <button onClick={saveExistingCheckin} disabled={!kioskExPick}
                      style={{ ...BtnGreen, opacity:kioskExPick?1:.45, cursor:kioskExPick?"pointer":"not-allowed" }}>
                      [OK] Check-in Patient
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {delId && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <div style={{ background:"#fff",borderRadius:16,padding:"28px 32px",maxWidth:360,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
            <div style={{ fontSize:36,marginBottom:10 }}>(!)</div>
            <div style={{ fontWeight:700,fontSize:17,marginBottom:8 }}>Remove Patient?</div>
            <div style={{ color:C.slateL,fontSize:13,marginBottom:20 }}>This action cannot be undone.</div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button onClick={()=>setDelId(null)} style={BtnGhost}>Cancel</button>
              <button onClick={()=>{setPatients(p=>p.filter(x=>x.queueNo!==delId));apiCall(`/hms/patients/${delId}`,"DELETE").catch(console.error);setDelId(null);}} style={BtnRed}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );

  // ==========================================================================
  // PAGE: TRIAGE
  // ==========================================================================

}
