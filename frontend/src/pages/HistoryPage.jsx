import { useState, useEffect, useMemo, useRef } from "react";
import { C, baseInput, IS, SS, TA, Badge, Sec, FL, Card, ErrBox, SuccessBox, FlowBar, Sidebar, TopBar, Layout, PatientBanner, RefNumStrip, EmptyState, CatalogueSearch } from "../components/SharedComponents";
import { STATUS_META, ICON_EMOJI, emojiOf, genNo, CASH_METHODS, SCHEME_METHODS, checkPharmCleared, todayStr, timeNow, pad, calcAge, fmtN, avatarHue } from "../lib/utils";
import { EMPTY_REG, SPECIALTIES, WARDS, GENDERS, BLOOD_GROUPS, RELIGIONS, DIET_OPTIONS, MARITAL, LANGUAGES, CORP_ORGS, INS_PROVIDERS, DISCHARGE_TYPES, CONDITION_AT_DC, SPECIMEN_MAP, NATIONALITIES, RELATIONSHIPS, TRIAGE_LEVELS } from "../data/constants";
import { ICD10, LAB_CATEGORIES, RAD_CATEGORIES, DRUG_ITEMS, SERVICES, IP_CHARGES, ITEM_REGISTRY, searchRegistry, getDrugPrice } from "../data/referenceData";
import { SEED_INVENTORY, SEED_DISPENSE_LOG, SEED_INV_TXNS, SEED_SUPPLIERS, SEED_POS, SEED_RECALLS, SEED_PATIENTS } from "../data/seedData";
import DebtorsAccount from "../components/DebtorsAccount";
import SchemesPage from "../components/SchemesPage";
import SpecimenSVG from "../components/SpecimenSVG";

export default function HistoryPage(props) {
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
    DOC_TABS, REG_TABS,
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


    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";

    // ── helpers ─────────────────────────────────────────────────
    const getStatusSc = (status) => {
      if (status==="Completed")  return { bg:"#dcfce7", color:"#166534" };
      if (status==="Admitted")   return { bg:"#dbeafe", color:"#1d4ed8" };
      if (status==="Queued")     return { bg:"#fef3c7", color:"#92400e" };
      return { bg:"#f1f5f9", color:"#475569" };
    };

    // ── filtered list ────────────────────────────────────────────
    const filtered = patients.filter(p => {
      if (!histSearch.trim()) return true;
      const q = histSearch.toLowerCase();
      return (p.name||"").toLowerCase().includes(q) ||
        (`${p.firstName||""} ${p.lastName||""}`).toLowerCase().includes(q) ||
        (p.queueNo||"").toLowerCase().includes(q) ||
        (p.mrn||"").toLowerCase().includes(q) ||
        (p.phone||"").toLowerCase().includes(q);
    });

    // ── visit steps ──────────────────────────────────────────────
    const visitSteps = histPatient ? [
      { title:"Patient Queued",        subtitle:`Queue Number: ${histPatient.queueNo||"—"}`,                                                                                                done:true,                                                                          time:histPatient.queuedAt,                          color:"#475569", light:"#f1f5f9", icon:"⏱" },
      { title:"Triage Completed",      subtitle:histPatient.triage?.triageLevel?`Triage Level ${histPatient.triage.triageLevel}${histPatient.triage.complaint?" — "+histPatient.triage.complaint:""}`:null, done:!!histPatient.triage?.triageLevel,  time:histPatient.triage?.triageTime,                color:"#0e7490", light:"#cffafe", icon:"🩺" },
      { title:"Billing Processed",     subtitle:histPatient.billing?.invoiceNo?`Invoice ${histPatient.billing.invoiceNo} · KES ${(histPatient.billing.items||[]).reduce((s,i)=>s+(i.price*i.qty),0).toLocaleString()}`:null, done:!!histPatient.billing?.invoiceNo, time:histPatient.billing?.billedAt,  color:"#16a34a", light:"#dcfce7", icon:"💳" },
      { title:"Doctor Consultation",   subtitle:histPatient.clerking?.finalDx||histPatient.clerking?.provDx||null,                                                                          done:!!(histPatient.clerking?.finalDx||histPatient.clerking?.provDx),               time:histPatient.clerking?.createdAt,               color:"#7c3aed", light:"#ede9fe", icon:"📋" },
      { title:"Laboratory Tests",      subtitle:(histPatient.labResults||[]).length?`${(histPatient.labResults||[]).length} test(s) ordered`:null,                                          done:(histPatient.labResults||[]).length>0,                                         time:(histPatient.labResults||[])[0]?.completedAt,  color:"#2563eb", light:"#dbeafe", icon:"🧪" },
      { title:"Pharmacy Prescription", subtitle:(histPatient.clerking?.prescriptions||[]).length?`${(histPatient.clerking.prescriptions||[]).length} medication(s) prescribed`:histPatient.clerking?.dispensed?"Dispensed":null, done:!!(histPatient.clerking?.dispensed||(histPatient.clerking?.prescriptions||[]).length), time:histPatient.clerking?.dispensedAt, color:"#ea580c", light:"#ffedd5", icon:"💊" },
      { title:"Visit Completed",       subtitle:histPatient.status==="Completed"?"Patient discharged":histPatient.status==="Admitted"?"Currently admitted":null,                            done:histPatient.status==="Completed",                                              time:histPatient.completedAt,                       color:"#16a34a", light:"#dcfce7", icon:"✅" },
    ] : [];

    // ── previous encounters for this patient (same phone or MRN) ─
    const prevVisits = histPatient ? patients.filter(p =>
      p.id !== histPatient.id &&
      ((histPatient.phone && p.phone && p.phone === histPatient.phone) ||
       (histPatient.mrn   && p.mrn   && p.mrn   === histPatient.mrn))
    ).sort((a,b)=> new Date(b.queuedAt||0)-new Date(a.queuedAt||0)) : [];

    return (
      <Layout page={page} setPage={p=>{setHistPatient(null);setPage(p);}} patients={patients} overlay={ToastModal}>
        <TopBar
          title={histPatient ? `Patient History — ${histPatient.name||`${histPatient.firstName||""} ${histPatient.lastName||""}`.trim()}` : "Patient History"}
          sub={histPatient ? `${histPatient.queueNo||""}${histPatient.mrn?" · MRN "+histPatient.mrn:""}` : "Clinical records, visit timelines and encounter details"}
          action={histPatient && <button onClick={()=>setHistPatient(null)} style={BtnGhost}>← Back</button>}
        />

        {/* ── LIST VIEW ─────────────────────────────────────────────── */}
        {!histPatient && (
          <div style={{ padding:"0 24px 24px" }}>
            <div style={{ marginBottom:20 }}>
              <input value={histSearch} onChange={e=>setHistSearch(e.target.value)}
                placeholder="Search by name, queue no, MRN or phone…"
                style={{ width:"100%",padding:"11px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:14,fontFamily:"inherit",outline:"none",background:"#fff",color:"#0b1929",boxSizing:"border-box" }} />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
              {[
                { label:"Total Patients",    val:patients.length, color:"#0ea5e9", bg:"#f0f9ff", icon:"👥" },
                { label:"Completed Visits",  val:patients.filter(p=>p.status==="Completed").length, color:"#22c55e", bg:"#f0fdf4", icon:"✅" },
                { label:"Currently Admitted",val:patients.filter(p=>p.admitted||p.status==="Admitted").length, color:"#6366f1", bg:"#eef2ff", icon:"🛏" },
                { label:"Active Today",      val:patients.filter(p=>{ try { return new Date(p.queuedAt).toDateString()===new Date().toDateString(); } catch { return false; } }).length, color:"#f59e0b", bg:"#fffbeb", icon:"📅" },
              ].map((s,i)=>(
                <div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",gap:14 }}>
                  <div style={{ width:42,height:42,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:22,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
              <div style={{ padding:"14px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:14,fontWeight:700,color:"#0b1929" }}>All Patients</span>
                <span style={{ fontSize:11,color:"#94a3b8",background:"#f1f5f9",padding:"2px 8px",borderRadius:20 }}>{filtered.length}</span>
              </div>
              {filtered.length===0 ? (
                <div style={{ textAlign:"center",padding:"48px",color:"#94a3b8" }}>
                  <div style={{ fontSize:32,marginBottom:8 }}>📋</div>
                  <div>No patients found</div>
                </div>
              ) : (
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["Queue No","Name","MRN","Gender/Age","Category","Status","Last Visit",""].map(h=>(
                        <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0",textTransform:"uppercase",letterSpacing:.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p,i)=>{
                      const sc  = getStatusSc(p.status);
                      const age = p.dateOfBirth ? Math.floor((Date.now()-new Date(p.dateOfBirth))/(365.25*86400000)) : null;
                      const nm  = p.name||`${p.firstName||""} ${p.lastName||""}`.trim();
                      // count previous encounters for this patient
                      const prevCount = patients.filter(x=>x.id!==p.id&&((p.phone&&x.phone===p.phone)||(p.mrn&&x.mrn===p.mrn))).length;
                      return (
                        <tr key={p.id||i} style={{ borderBottom:"1px solid #f1f5f9" }}
                          onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"11px 14px",fontSize:12,fontFamily:"monospace",color:"#6366f1",fontWeight:700 }}>{p.queueNo||"—"}</td>
                          <td style={{ padding:"11px 14px" }}>
                            <div style={{ fontSize:13,fontWeight:600,color:"#0b1929" }}>{nm||"—"}</div>
                            {prevCount>0 && <div style={{ fontSize:10,color:"#0e7490",marginTop:1 }}>↩ {prevCount} previous visit{prevCount>1?"s":""}</div>}
                          </td>
                          <td style={{ padding:"11px 14px",fontSize:12,color:"#64748b",fontFamily:"monospace" }}>{p.mrn||"—"}</td>
                          <td style={{ padding:"11px 14px",fontSize:12,color:"#475569" }}>{p.gender||"—"}{age?` · ${age}y`:""}</td>
                          <td style={{ padding:"11px 14px",fontSize:12,color:"#475569" }}>{p.category||"—"}</td>
                          <td style={{ padding:"11px 14px" }}>
                            <span style={{ fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20,background:sc.bg,color:sc.color }}>{p.status||"—"}</span>
                          </td>
                          <td style={{ padding:"11px 14px",fontSize:11,color:"#94a3b8" }}>{fmtDate(p.queuedAt)}</td>
                          <td style={{ padding:"11px 14px" }}>
                            <button onClick={()=>setHistPatient(p)} style={{ padding:"5px 12px",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,background:"#e0f2fe",color:"#0369a1" }}>View →</button>
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

        {/* ── DETAIL VIEW ───────────────────────────────────────────── */}
        {histPatient && (
          <div style={{ padding:"0 24px 32px" }}>
            {/* Patient banner */}
            <div style={{ background:"linear-gradient(135deg,#0b1929,#0d2137)",borderRadius:14,padding:"20px 24px",marginBottom:20,color:"#fff" }}>
              <div style={{ display:"flex",alignItems:"center",gap:18 }}>
                <div style={{ width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#00bcd4,#0097a7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{histPatient.gender==="Female"?"👩":"👨"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:20,fontWeight:800 }}>{histPatient.name||`${histPatient.firstName||""} ${histPatient.lastName||""}`.trim()}</div>
                  <div style={{ fontSize:13,color:"rgba(255,255,255,.6)",marginTop:3,display:"flex",gap:16,flexWrap:"wrap" }}>
                    {histPatient.queueNo && <span>Queue: {histPatient.queueNo}</span>}
                    {histPatient.mrn && <span>MRN: {histPatient.mrn}</span>}
                    {histPatient.phone && <span>📞 {histPatient.phone}</span>}
                    {histPatient.dateOfBirth && <span>DOB: {fmtDate(histPatient.dateOfBirth)}</span>}
                    {histPatient.gender && <span>{histPatient.gender}</span>}
                  </div>
                </div>
                <span style={{ fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20,background:"rgba(0,188,212,.25)",color:"#00e5ff" }}>{histPatient.status||"—"}</span>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:18,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.1)" }}>
                {[
                  { label:"Category",   val:histPatient.category||"—" },
                  { label:"Insurance",  val:histPatient.insuranceProvider||histPatient.corporateOrg||"—" },
                  { label:"Registered", val:fmtDate(histPatient.registeredAt||histPatient.queuedAt) },
                  { label:"Referred By",val:histPatient.referredBy||"Walk-in" },
                ].map((f,i)=>(
                  <div key={i}>
                    <div style={{ fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:2 }}>{f.label}</div>
                    <div style={{ fontSize:13,fontWeight:600,color:"rgba(255,255,255,.9)" }}>{f.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visit Timeline — vertical */}
            <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"24px 28px",marginBottom:16 }}>
              <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:22 }}>Visit Timeline</div>
              <div style={{ display:"flex",flexDirection:"column" }}>
                {visitSteps.map((step,i)=>{
                  const last = i===visitSteps.length-1;
                  return (
                    <div key={i} style={{ display:"flex",gap:16 }}>
                      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0 }}>
                        <div style={{ width:40,height:40,borderRadius:"50%",background:step.done?step.color:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,boxShadow:step.done?`0 0 0 5px ${step.light}`:"none",color:step.done?"#fff":"#cbd5e1",transition:"all .2s" }}>
                          {step.icon}
                        </div>
                        {!last && <div style={{ width:2,flex:1,minHeight:24,margin:"4px 0",background:step.done?"#e2e8f0":"#f1f5f9",borderRadius:1 }} />}
                      </div>
                      <div style={{ paddingBottom:last?0:20,paddingTop:8,flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:700,color:step.done?"#0b1929":"#94a3b8",lineHeight:1.3 }}>{step.title}</div>
                        {step.subtitle && <div style={{ fontSize:12,color:"#64748b",marginTop:3,lineHeight:1.5 }}>{step.subtitle}</div>}
                        {step.time && <div style={{ fontSize:10,color:"#94a3b8",marginTop:4,fontFamily:"monospace" }}>{fmtDate(step.time)}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinical Details Grid */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              {histPatient.triage && (
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:12 }}>🩺 Triage & Vitals</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                    {[
                      { label:"Triage Level",    val:histPatient.triage.triageLevel?`ESI ${histPatient.triage.triageLevel}`:"—" },
                      { label:"Chief Complaint",  val:histPatient.triage.complaint||"—" },
                      { label:"BP",               val:histPatient.triage.bp||"—" },
                      { label:"Pulse",            val:histPatient.triage.pulse?`${histPatient.triage.pulse} bpm`:"—" },
                      { label:"Temp",             val:histPatient.triage.temp?`${histPatient.triage.temp}°C`:"—" },
                      { label:"SpO₂",             val:histPatient.triage.spo2?`${histPatient.triage.spo2}%`:"—" },
                      { label:"RBS",              val:histPatient.triage.rbs?`${histPatient.triage.rbs} mg/dL`:"—" },
                      { label:"Weight",           val:histPatient.triage.weight?`${histPatient.triage.weight} kg`:"—" },
                    ].map((f,i)=>(
                      <div key={i} style={{ padding:"8px 10px",background:"#f8fafc",borderRadius:8 }}>
                        <div style={{ fontSize:9,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.8 }}>{f.label}</div>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0b1929",marginTop:2 }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {histPatient.clerking && (
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:12 }}>📋 Doctor's Assessment</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {[
                      { label:"Doctor",          val:histPatient.clerking.doctorName||"—" },
                      { label:"Final Diagnosis", val:histPatient.clerking.finalDx||"—" },
                      { label:"Provisional Dx",  val:histPatient.clerking.provDx||"—" },
                      { label:"HPI",             val:histPatient.clerking.hpi||"—" },
                      { label:"Plan",            val:histPatient.clerking.plan||"—" },
                    ].map((f,i)=>(
                      <div key={i} style={{ padding:"8px 10px",background:"#f8fafc",borderRadius:8 }}>
                        <div style={{ fontSize:9,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.8 }}>{f.label}</div>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0b1929",marginTop:2 }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {histPatient.billing?.invoiceNo && (
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:12 }}>💳 Billing Details</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}><span style={{ color:"#64748b" }}>Invoice No.</span><span style={{ fontWeight:700,fontFamily:"monospace",color:"#6366f1" }}>{histPatient.billing.invoiceNo}</span></div>
                    {histPatient.billing.receiptNo && <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}><span style={{ color:"#64748b" }}>Receipt No.</span><span style={{ fontWeight:700,fontFamily:"monospace",color:"#22c55e" }}>{histPatient.billing.receiptNo}</span></div>}
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}><span style={{ color:"#64748b" }}>Payment Method</span><span style={{ fontWeight:600,color:"#0b1929" }}>{histPatient.billing.paymentMethod||"—"}</span></div>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}><span style={{ color:"#64748b" }}>Status</span><span style={{ fontWeight:700,color:histPatient.billing.paid?"#22c55e":"#dc2626" }}>{histPatient.billing.paid?"Paid":"Unpaid"}</span></div>
                    <div style={{ borderTop:"1px solid #e2e8f0",marginTop:6,paddingTop:8 }}>
                      {(histPatient.billing.items||[]).map((it,i)=>(
                        <div key={i} style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569",marginBottom:3 }}>
                          <span>{it.name}</span><span style={{ fontWeight:600 }}>KES {(it.price*it.qty).toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,color:"#0b1929",borderTop:"1px solid #e2e8f0",paddingTop:6,marginTop:4 }}>
                        <span>Total</span><span>KES {(histPatient.billing.items||[]).reduce((s,it)=>s+(it.price*it.qty),0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {(histPatient.clerking?.orders?.rx?.drugs||[]).length>0 && (
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:12 }}>💊 Prescriptions</div>
                  {(histPatient.clerking.orders.rx.drugs||[]).map((d,i)=>(
                    <div key={i} style={{ padding:"8px 10px",background:"#f8fafc",borderRadius:8,marginBottom:6 }}>
                      <div style={{ fontSize:12,fontWeight:700,color:"#0b1929" }}>{d.drug||d.name}</div>
                      <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{[d.dose,d.route,d.frequency,d.duration].filter(Boolean).join(" · ")}</div>
                    </div>
                  ))}
                </div>
              )}
              {(histPatient.labResults||[]).length>0 && (
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px",gridColumn:"1 / -1" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#0b1929",marginBottom:12 }}>🧪 Laboratory Results</div>
                  <table style={{ width:"100%",borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:"#f8fafc" }}>
                        {["Test","Result","Reference","Flag","Date"].map(h=>(
                          <th key={h} style={{ padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(histPatient.labResults||[]).flatMap((g,gi)=>
                        (g.results||[]).map((r,ri)=>(
                          <tr key={`${gi}-${ri}`} style={{ borderBottom:"1px solid #f1f5f9" }}>
                            <td style={{ padding:"8px 12px",fontSize:12,fontWeight:600,color:"#0b1929" }}>{r.test||g.category||"—"}</td>
                            <td style={{ padding:"8px 12px",fontSize:12,fontWeight:700,color:r.flag==="H"?"#dc2626":r.flag==="L"?"#2563eb":"#0b1929" }}>{r.value} {r.unit}</td>
                            <td style={{ padding:"8px 12px",fontSize:11,color:"#94a3b8" }}>{r.ref||"—"}</td>
                            <td style={{ padding:"8px 12px" }}>{r.flag&&<span style={{ fontSize:10,padding:"2px 6px",borderRadius:20,background:r.flag==="H"?"#fee2e2":"#dbeafe",color:r.flag==="H"?"#dc2626":"#2563eb",fontWeight:700 }}>{r.flag==="H"?"High":"Low"}</span>}</td>
                            <td style={{ padding:"8px 12px",fontSize:11,color:"#94a3b8" }}>{fmtDate(g.completedAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── PREVIOUS VISITS ───────────────────────────────────── */}
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:14,fontWeight:700,color:"#0b1929",marginBottom:12,display:"flex",alignItems:"center",gap:8 }}>
                🕐 Previous Visits
                <span style={{ fontSize:11,color:"#94a3b8",background:"#f1f5f9",padding:"2px 8px",borderRadius:20,fontWeight:500 }}>
                  {prevVisits.length} encounter{prevVisits.length!==1?"s":""}
                </span>
              </div>
              {prevVisits.length===0 ? (
                <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"32px",textAlign:"center",color:"#94a3b8" }}>
                  <div style={{ fontSize:28,marginBottom:8 }}>📭</div>
                  <div style={{ fontSize:13,fontWeight:600 }}>No previous visits on record</div>
                  <div style={{ fontSize:12,marginTop:4 }}>This appears to be the patient's first encounter</div>
                </div>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {prevVisits.map((v,i)=>{
                    const sc  = getStatusSc(v.status);
                    const dx  = v.clerking?.finalDx||v.clerking?.provDx||null;
                    const inv = v.billing?.invoiceNo||null;
                    const total = (v.billing?.items||[]).reduce((s,it)=>s+(it.price*it.qty),0);
                    return (
                      <div key={v.id||i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"16px 20px" }}>
                        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10 }}>
                          <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                            <div style={{ width:36,height:36,borderRadius:9,background:"#f0f9ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>🏥</div>
                            <div>
                              <div style={{ fontSize:13,fontWeight:700,color:"#0b1929" }}>{v.queueNo||"—"} · Visit on {fmtDate(v.queuedAt)}</div>
                              <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>
                                {v.triage?.complaint && <span>{v.triage.complaint}</span>}
                              </div>
                            </div>
                          </div>
                          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                            <span style={{ fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:sc.bg,color:sc.color }}>{v.status||"—"}</span>
                            <button onClick={()=>setHistPatient(v)} style={{ padding:"5px 12px",border:"none",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,background:"#e0f2fe",color:"#0369a1" }}>View →</button>
                          </div>
                        </div>
                        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                          {dx && (
                            <span style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:"#f5f3ff",color:"#7c3aed",fontWeight:600,border:"1px solid #ede9fe" }}>
                              📋 {dx}
                            </span>
                          )}
                          {v.triage?.triageLevel && (
                            <span style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:"#cffafe",color:"#0e7490",fontWeight:600,border:"1px solid #a5f3fc" }}>
                              🩺 ESI {v.triage.triageLevel}
                            </span>
                          )}
                          {(v.labResults||[]).length>0 && (
                            <span style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:"#dbeafe",color:"#2563eb",fontWeight:600,border:"1px solid #bfdbfe" }}>
                              🧪 {(v.labResults||[]).length} lab result{(v.labResults||[]).length!==1?"s":""}
                            </span>
                          )}
                          {inv && (
                            <span style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:"#dcfce7",color:"#166534",fontWeight:600,border:"1px solid #bbf7d0" }}>
                              💳 {inv} · KES {total.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Layout>
    );


  // ============================================================
  // MASTER CATALOGUE PAGE
  // ============================================================

}
